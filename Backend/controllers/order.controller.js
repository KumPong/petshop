import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'order.json');
const PRODUCT_PATH = path.join(__dirname, '..', 'data', 'product.json');
const INVENTORY_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

// แกะ user จาก Authorization header ถ้ามี (secret key ตัวเดียวกับ auth.controller.js) — คืน null เฉยๆ ถ้าไม่มี/token ไม่ถูกต้อง
// ไม่มี token ก็ยัง fallback เป็น guest ได้ปกติ (ยังไม่บังคับ login ทุก endpoint)
function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], 'YOUR_SECRET_KEY_PETSTOP');
  } catch {
    return null;
  }
}

const TAX_RATE = 0.07; // ภาษี 7% แบบเดียวกับ VAT

// ค่าส่งคงที่ต่อวิธีจัดส่ง — ยังไม่มีระบบคำนวณค่าส่งจริงตามน้ำหนัก/ระยะทาง
const SHIPPING_METHODS = {
  standard: { cost: 0, label: 'จัดส่งมาตรฐาน', minDays: 3, maxDays: 5 },
  express: { cost: 150, label: 'จัดส่งด่วน', minDays: 1, maxDays: 2 },
};

// helper อ่าน/เขียนไฟล์ JSON ทั่วไป ใช้ได้ทั้งไฟล์ order.json และ product.json
async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// สร้างเลขที่ออเดอร์ถัดไป โดยหาเลขมากสุดที่มีอยู่แล้ว +1 (เช่นมี ORD-1001 อยู่ จะได้ ORD-1002)
// ถ้ายังไม่มีออเดอร์เลย จะเริ่มที่ ORD-1001 (fallback ฐาน 1000)
function nextOrderId(orders) {
  const numbers = orders
    .map((o) => Number(String(o.orderId).replace('ORD-', '')))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 1000;
  return `ORD-${max + 1}`;
}

// จำลองเลขอ้างอิงการชำระเงินจาก payment gateway (โปรเจกต์นี้ไม่มีการเชื่อมต่อ gateway จริง)
function fakeTransactionId() {
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `TXN-${Date.now()}-${randomPart}`;
}

// จำลองเลข tracking ของบริษัทขนส่ง (โปรเจกต์นี้ไม่มีการเชื่อมต่อระบบขนส่งจริง)
function fakeTrackingNumber() {
  const randomPart = Math.floor(Math.random() * 900000000 + 100000000);
  return `KER-${randomPart}`;
}

// ลำดับสถานะจริงของออเดอร์ (Staff เป็นคนกดเปลี่ยนผ่าน PATCH /:id/status) — Flagged/Cancelled เป็น exception
// แทรกได้ทุกจุด ไม่นับเป็น step ใน timeline ที่ลูกค้าเห็น
const STEP_ORDER = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

// map สถานะ Staff (ฝั่งใน) ให้ตรงกับ step ที่ลูกค้าเห็นในหน้า Tracking (ฝั่งนอก) แบบ 1:1 — คนละมุมมอง
// เดียวกัน ไม่ใช่จำลองแยกกันคนละระบบเหมือนเดิม
const STEP_META = {
  Confirmed: { key: 'paid', label: 'ชำระเงินสำเร็จ' },
  Processing: { key: 'preparing', label: 'กำลังจัดเตรียมสินค้า' },
  Packed: { key: 'handed_to_carrier', label: 'ส่งมอบให้บริษัทขนส่ง' },
  Shipped: { key: 'in_transit', label: 'สินค้าอยู่ระหว่างทาง' },
  Delivered: { key: 'delivered', label: 'จัดส่งสำเร็จ' },
};

// แปล step ปัจจุบันของ timeline เป็นข้อความสั้นๆ ไว้โชว์เป็น badge สรุปสถานะบนสุดของหน้าติดตามพัสดุ
const STATUS_BADGE_LABEL = {
  paid: 'ชำระเงินสำเร็จ',
  preparing: 'กำลังเตรียมสินค้า',
  handed_to_carrier: 'อยู่ระหว่างการขนส่ง',
  in_transit: 'อยู่ระหว่างการขนส่ง',
  delivered: 'จัดส่งสำเร็จ',
};

// สร้าง timeline ที่ลูกค้าเห็นจากสถานะจริงของ Staff (order.status/statusHistory) สดทุกครั้ง แทนการจำลอง
// เวลาล่วงหน้าแบบเดิม — effectiveStatus ควรใช้ statusBeforeFlag แทน order.status ตรงๆ ตอนกำลัง Flagged
// อยู่ เพราะลูกค้าไม่ควรรู้ว่ามีปัญหาภายใน เห็นแค่ความคืบหน้าล่าสุดก่อนโดน flag ตามปกติ
function buildTimelineFromStatus(effectiveStatus, statusHistory) {
  const currentIndex = STEP_ORDER.indexOf(effectiveStatus);
  const findTimestamp = (status) => statusHistory.find((h) => h.status === status)?.at ?? null;

  return STEP_ORDER.map((step, idx) => {
    const meta = STEP_META[step];
    const isDone = idx < currentIndex || (idx === currentIndex && (effectiveStatus === 'Confirmed' || effectiveStatus === 'Delivered'));
    const isCurrent = idx === currentIndex && effectiveStatus !== 'Confirmed' && effectiveStatus !== 'Delivered';
    return {
      key: meta.key,
      label: meta.label,
      status: isDone ? 'done' : isCurrent ? 'current' : 'pending',
      timestamp: findTimestamp(step),
    };
  });
}

// เติม shipping.timeline/statusLabel สดจาก status จริงให้ order ก่อนส่งออกไปทุกครั้ง (ไม่เชื่อค่าที่ persist ไว้เดิม)
function attachLiveTimeline(order) {
  const effectiveStatus = order.status === 'Flagged' ? order.statusBeforeFlag || 'Confirmed' : order.status;
  const timeline = buildTimelineFromStatus(effectiveStatus, order.statusHistory || []);
  // ไม่มี step ไหนเป็น 'current' ได้ตอน Confirmed/Delivered (ดู buildTimelineFromStatus) — fallback ไปหา
  // step 'done' ล่าสุดแทน ไม่ใช่ step สุดท้ายของ array เฉยๆ (ไม่งั้นตอน Confirmed จะโชว์ป้ายผิดเป็น "จัดส่งสำเร็จ")
  const currentStep =
    timeline.find((s) => s.status === 'current') ??
    [...timeline].reverse().find((s) => s.status === 'done') ??
    timeline[0];
  return {
    ...order,
    shipping: { ...order.shipping, timeline, statusLabel: STATUS_BADGE_LABEL[currentStep.key] },
  };
}

const ALLOWED_UPDATE_STATUSES = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Flagged'];

// GET /api/orders — ต้อง login เท่านั้น (เดิมเปิดให้ guest ดึงออเดอร์ "ทุกคน" ได้ตรงๆ รวม PII เต็ม — ปิดช่องนี้แล้ว)
// Staff/Manager เห็นออเดอร์ทั้งหมด (ใช้ในหน้า Order manage), Customer เห็นแค่ออเดอร์ของตัวเอง (ใช้ใน Tracking ตอนไม่ระบุเลขออเดอร์)
export async function getOrders(req, res) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนดูรายการคำสั่งซื้อ' });
  }

  const orders = await readJson(ORDERS_PATH);
  const isStaff = authUser.role === 'Staff' || authUser.role === 'Manager';
  const visibleOrders = isStaff ? orders : orders.filter((o) => o.customerId === authUser.id);

  visibleOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  res.json(visibleOrders.map(attachLiveTimeline));
}

// GET /api/orders/:id — ดึงออเดอร์เดียว ใช้โดยหน้า Confirmation, Tracking (ระบุเลขออเดอร์ตรงๆ) และ Order manage
export async function getOrderById(req, res) {
  const { id } = req.params;
  const orders = await readJson(ORDERS_PATH);
  const order = orders.find((o) => o.orderId === id);
  if (!order) {
    return res.status(404).json({ message: `ไม่พบคำสั่งซื้อ orderId "${id}"` });
  }

  // ถ้า login มา (มี token) ต้องเป็นเจ้าของออเดอร์เอง หรือเป็น Staff/Manager เท่านั้นถึงจะดูได้
  // ไม่มี token เลย (guest, เช่นหน้า Tracking แบบไม่ login) ยังเข้าดูได้ปกติเหมือนเดิม กันไม่ให้ฟีเจอร์เดิมพัง
  const authUser = getAuthUser(req);
  if (authUser) {
    const isOwner = order.customerId === authUser.id;
    const isStaff = authUser.role === 'Staff' || authUser.role === 'Manager';
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้' });
    }
  }

  res.json(attachLiveTimeline(order));
}

// POST /api/orders — ทำครบ checkout ในจุดเดียว: ตรวจสินค้า -> คำนวณราคาจริงฝั่ง backend -> จำลองชำระเงิน
// (สำเร็จเสมอ ไม่มี gateway จริง) -> สร้างออเดอร์ body: { items, paymentMethod, shippingAddress, shippingMethod }
// customerId ผูกจาก token เอง (ไม่เชื่อค่าที่ client ส่งมาตรงๆ กันปลอมตัวเป็นคนอื่น) ไม่มี token ก็ยัง fallback เป็น GUEST ได้เหมือนเดิม
export async function createOrder(req, res) {
  const { items, paymentMethod, shippingAddress, shippingMethod } = req.body;
  const authUser = getAuthUser(req);

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items ต้องเป็น array ที่มีอย่างน้อย 1 รายการ' });
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return res.status(400).json({ message: 'paymentMethod ต้องระบุวิธีชำระเงิน' });
  }
  if (!SHIPPING_METHODS[shippingMethod]) {
    return res.status(400).json({ message: 'shippingMethod ต้องเป็น "standard" หรือ "express"' });
  }
  const requiredAddressFields = ['fullName', 'street', 'city', 'postalCode', 'phone'];
  const missingField = requiredAddressFields.find((f) => !shippingAddress?.[f]);
  if (missingField) {
    return res.status(400).json({ message: `shippingAddress.${missingField} ต้องระบุ` });
  }

  const products = await readJson(PRODUCT_PATH);
  const enrichedItems = [];

  // frontend ส่งมาแค่ productId/quantity — เติมชื่อ/ราคาจาก product.json เอง ไม่เชื่อราคาที่ frontend ส่งมาตรงๆ
  for (const { productId, quantity } of items) {
    const product = products.find((p) => p.productId === productId);
    if (!product) {
      return res.status(404).json({ message: `ไม่พบสินค้า productId "${productId}"` });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: `quantity ของสินค้า "${productId}" ต้องเป็นตัวเลขที่มากกว่า 0` });
    }
    enrichedItems.push({
      orderItemId: `OI-${productId}-${Date.now()}`,
      productId: product.productId,
      name: product.name,
      quantity: qty,
      unitPrice: product.price,
      subTotal: product.price * qty,
      picked: false,
      imageUrl: product.imageUrl || null,
    });
  }

  // เช็คสต็อกจริงจาก inventory.json ก่อนตัดเงิน/สร้างออเดอร์ (เชื่อมด้วย productId ที่ผูกไว้ในแต่ละ record ของ inventory)
  const inventory = await readJson(INVENTORY_PATH);
  for (const item of enrichedItems) {
    const invItem = inventory.find((i) => i.productId === item.productId);
    if (!invItem) {
      return res.status(404).json({ message: `ไม่พบข้อมูลสต็อกของสินค้า "${item.name}"` });
    }
    if (invItem.stock < item.quantity) {
      return res.status(409).json({
        message: `สินค้า "${item.name}" เหลือไม่พอ (คงเหลือ ${invItem.stock} ต้องการ ${item.quantity})`,
      });
    }
    // เก็บรูปไว้ใน order item เอง (ไม่ join สดจาก product/inventory ตอน query) กันรูปเปลี่ยนย้อนหลังถ้าสินค้าถูกแก้ไขทีหลัง
    if (!item.imageUrl) item.imageUrl = invItem.image || null;
  }

  // calculateTotal() — รวมยอดจากทุกรายการสินค้า แล้วบวกค่าส่ง + ภาษี
  const subtotal = enrichedItems.reduce((sum, item) => sum + item.subTotal, 0);
  const shippingAmount = SHIPPING_METHODS[shippingMethod].cost;
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalAmount = subtotal + shippingAmount + taxAmount;

  const orders = await readJson(ORDERS_PATH);
  const orderId = nextOrderId(orders);
  const orderDate = new Date().toISOString();

  // confirmPayment() — จำลองว่าชำระเงินสำเร็จเสมอ (ไม่มี gateway จริง) ไม่รับ/เก็บเลขบัตรจาก frontend เลย
  const payment = {
    paymentId: `PAY-${orderId}`,
    method: paymentMethod,
    amount: totalAmount,
    status: 'Paid',
    paymentDate: orderDate,
    transactionId: fakeTransactionId(),
  };

  const { minDays, maxDays } = SHIPPING_METHODS[shippingMethod];
  // shipping ไม่เก็บ timeline/statusLabel ไว้ตรงๆ อีกแล้ว — คำนวณสดจาก status/statusHistory ทุกครั้งที่ query
  // ผ่าน attachLiveTimeline() แทน (กันข้อมูลเก่าค้าง ไม่ตรงกับสถานะจริงที่ Staff กด)
  const shipping = {
    method: shippingMethod,
    methodLabel: SHIPPING_METHODS[shippingMethod].label,
    cost: shippingAmount,
    carrier: 'Kerry Express',
    trackingNumber: fakeTrackingNumber(),
    estimatedDeliveryStart: new Date(Date.now() + minDays * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryEnd: new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toISOString(),
  };

  // confirmOrder() — ฝัง items[]/shippingAddress/shipping/payment ไว้ในเรคคอร์ดเดียว (เหมือน purchaseOrder.controller.js)
  // statusHistory เก็บเวลาจริงที่แต่ละสถานะเกิดขึ้น ใช้คำนวณ timeline ที่ลูกค้าเห็นแทนการจำลองเวลาล่วงหน้า
  const newOrder = {
    orderId,
    orderNo: orderId,
    customerId: authUser?.id || 'GUEST', // ผูกจาก token ที่ login มา ไม่มี token (guest checkout) ก็ fallback ไปก่อน
    orderDate,
    status: 'Confirmed',
    statusHistory: [{ status: 'Confirmed', at: orderDate }],
    courierNotes: '',
    flagReason: '',
    statusBeforeFlag: null,
    subtotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    items: enrichedItems,
    shippingAddress,
    shipping,
    payment,
  };

  // ตัดสต็อกจริงตามจำนวนที่สั่ง (เช็คพอแล้วตั้งแต่ก่อนคำนวณราคา) แล้วบันทึกคู่กับออเดอร์ในคำขอเดียวกัน
  for (const item of enrichedItems) {
    const invItem = inventory.find((i) => i.productId === item.productId);
    invItem.stock -= item.quantity;
    invItem.lastUpdated = orderDate;
  }
  await writeJson(INVENTORY_PATH, inventory);

  orders.push(newOrder);
  await writeJson(ORDERS_PATH, orders);

  // 201 = สร้างสำเร็จ (Created) — ส่งออเดอร์ที่เพิ่งสร้างกลับไป ให้ frontend เอาไปแสดงหน้า "ขอบคุณที่สั่งซื้อสินค้า" ได้เลย
  res.status(201).json(attachLiveTimeline(newOrder));
}

// PATCH /api/orders/:id/status — Staff อัปเดตความคืบหน้าออเดอร์ (Order manage) body: { status, courierNotes?, pickedItems?, flagReason? }
// status ต้องอยู่ใน ALLOWED_UPDATE_STATUSES — ไม่รองรับ "Cancelled" เพราะการยกเลิกไม่ใช่ use case ของ Staff (S2-S5 ใน README
// ไม่มีข้อไหนพูดถึงยกเลิกเลย น่าจะเป็นสิทธิ์ของลูกค้าจากหน้า Order History แทน คนละ endpoint/scope)
export async function updateOrderStatus(req, res) {
  const authUser = getAuthUser(req);
  if (!authUser || (authUser.role !== 'Staff' && authUser.role !== 'Manager')) {
    return res.status(403).json({ message: 'เฉพาะ Staff/Manager เท่านั้นที่อัปเดตสถานะคำสั่งซื้อได้' });
  }

  const { id } = req.params;
  const { status, courierNotes, pickedItems, flagReason } = req.body;

  if (!ALLOWED_UPDATE_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `status ต้องเป็นหนึ่งใน ${ALLOWED_UPDATE_STATUSES.join(', ')}`,
    });
  }
  if (status === 'Flagged' && (!flagReason || !flagReason.trim())) {
    return res.status(400).json({ message: 'flagReason ต้องระบุเมื่อแจ้งปัญหา (status = "Flagged")' });
  }

  const orders = await readJson(ORDERS_PATH);
  const order = orders.find((o) => o.orderId === id);
  if (!order) {
    return res.status(404).json({ message: `ไม่พบคำสั่งซื้อ orderId "${id}"` });
  }

  // เก็บ/เคลียร์ statusBeforeFlag ฝั่ง server เอง ไม่เชื่อค่าจาก client เพื่อกันของปลอม
  if (status === 'Flagged') {
    if (order.status !== 'Flagged') {
      order.statusBeforeFlag = order.status;
    }
    order.flagReason = flagReason.trim();
  } else {
    if (order.status === 'Flagged') {
      order.statusBeforeFlag = null;
      order.flagReason = '';
    }
    // บันทึกเวลาจริงตอนถึงสถานะนี้ครั้งแรก (กันบันทึกซ้ำถ้ายิงซ้ำสถานะเดิม เช่น อัปเดตแค่ courierNotes ระหว่าง Processing)
    if (!order.statusHistory.some((h) => h.status === status)) {
      order.statusHistory.push({ status, at: new Date().toISOString() });
    }
  }

  if (typeof courierNotes === 'string') {
    order.courierNotes = courierNotes;
  }
  if (Array.isArray(pickedItems)) {
    order.items = order.items.map((item) => ({ ...item, picked: pickedItems.includes(item.orderItemId) }));
  }

  order.status = status;

  await writeJson(ORDERS_PATH, orders);
  res.json(attachLiveTimeline(order));
}

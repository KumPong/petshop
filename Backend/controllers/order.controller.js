import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'order.json');
const PRODUCT_PATH = path.join(__dirname, '..', 'data', 'product.json');

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

// จำลอง timeline จัดส่งไว้ล่วงหน้าตอนสร้างออเดอร์ (ไม่มีระบบขนส่งจริงเชื่อมต่อ): 2 ขั้นแรกเสร็จแล้ว
// (ชำระเงิน/เตรียมสินค้า), ขั้น 3 คือปัจจุบัน (ส่งมอบขนส่ง+เลข tracking), ที่เหลือยังไม่ถึง
function buildShippingTimeline(orderDate) {
  const base = new Date(orderDate);
  const plusHours = (h) => new Date(base.getTime() + h * 60 * 60 * 1000).toISOString();

  return [
    { key: 'paid', label: 'ชำระเงินสำเร็จ', status: 'done', timestamp: base.toISOString() },
    { key: 'preparing', label: 'กำลังจัดเตรียมสินค้า', status: 'done', timestamp: plusHours(4) },
    { key: 'handed_to_carrier', label: 'ส่งมอบให้บริษัทขนส่ง', status: 'current', timestamp: plusHours(24) },
    { key: 'in_transit', label: 'สินค้าอยู่ระหว่างทาง', status: 'pending', timestamp: null },
    { key: 'delivered', label: 'จัดส่งสำเร็จ', status: 'pending', timestamp: null },
  ];
}

// แปล step ปัจจุบันของ timeline เป็นข้อความสั้นๆ ไว้โชว์เป็น badge สรุปสถานะบนสุดของหน้าติดตามพัสดุ
const STATUS_BADGE_LABEL = {
  paid: 'ชำระเงินสำเร็จ',
  preparing: 'กำลังเตรียมสินค้า',
  handed_to_carrier: 'อยู่ระหว่างการขนส่ง',
  in_transit: 'อยู่ระหว่างการขนส่ง',
  delivered: 'จัดส่งสำเร็จ',
};

// GET /api/orders — ออเดอร์ทั้งหมด (เรียงล่าสุดก่อน) ใช้โดย Tracking ตอนไม่ระบุเลขออเดอร์ (ยังไม่มี login จริง)
export async function getOrders(req, res) {
  const orders = await readJson(ORDERS_PATH);
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  res.json(orders);
}

// GET /api/orders/:id — ดึงออเดอร์เดียว ใช้โดยหน้า Confirmation และหน้า Tracking (ระบุเลขออเดอร์ตรงๆ)
export async function getOrderById(req, res) {
  const { id } = req.params;
  const orders = await readJson(ORDERS_PATH);
  const order = orders.find((o) => o.orderId === id);
  if (!order) {
    return res.status(404).json({ message: `ไม่พบคำสั่งซื้อ orderId "${id}"` });
  }
  res.json(order);
}

// POST /api/orders — ทำครบ checkout ในจุดเดียว: ตรวจสินค้า -> คำนวณราคาจริงฝั่ง backend -> จำลองชำระเงิน
// (สำเร็จเสมอ ไม่มี gateway จริง) -> สร้างออเดอร์ body: { items, paymentMethod, shippingAddress, shippingMethod, customerId? }
export async function createOrder(req, res) {
  const { items, paymentMethod, shippingAddress, shippingMethod, customerId } = req.body;

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
    });
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
  const shipping = {
    method: shippingMethod,
    methodLabel: SHIPPING_METHODS[shippingMethod].label,
    cost: shippingAmount,
    carrier: 'Kerry Express',
    trackingNumber: fakeTrackingNumber(),
    estimatedDeliveryStart: new Date(Date.now() + minDays * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDeliveryEnd: new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000).toISOString(),
    timeline: buildShippingTimeline(orderDate),
  };
  const currentStep = shipping.timeline.find((s) => s.status === 'current') ?? shipping.timeline[0];
  shipping.statusLabel = STATUS_BADGE_LABEL[currentStep.key];

  // confirmOrder() — ฝัง items[]/shippingAddress/shipping/payment ไว้ในเรคคอร์ดเดียว (เหมือน purchaseOrder.controller.js)
  const newOrder = {
    orderId,
    orderNo: orderId,
    customerId: customerId || 'GUEST', // ยังไม่มีระบบ login จริง เลยใช้ค่า default ไปก่อน
    orderDate,
    status: 'Confirmed',
    subtotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    items: enrichedItems,
    shippingAddress,
    shipping,
    payment,
  };

  orders.push(newOrder);
  await writeJson(ORDERS_PATH, orders);

  // 201 = สร้างสำเร็จ (Created) — ส่งออเดอร์ที่เพิ่งสร้างกลับไป ให้ frontend เอาไปแสดงหน้า "ขอบคุณที่สั่งซื้อสินค้า" ได้เลย
  res.status(201).json(newOrder);
}

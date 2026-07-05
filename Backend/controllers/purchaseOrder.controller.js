import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'purchaseOrders.json');
const INVENTORY_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

// helper อ่าน/เขียนไฟล์ JSON ทั่วไป ใช้ได้ทั้งไฟล์ purchaseOrders.json และ inventory.json
async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// สร้างเลขที่ใบสั่งซื้อถัดไป โดยหาเลขมากสุดที่มีอยู่แล้ว +1 (เช่นมี PO-8821, PO-8822 อยู่ จะได้ PO-8823)
// ถ้ายังไม่มีใบสั่งซื้อเลย จะเริ่มที่ PO-8821 (fallback ฐาน 8820)
function nextPoId(orders) {
  const numbers = orders
    .map((o) => Number(String(o.id).replace('PO-', '')))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 8820;
  return `PO-${max + 1}`;
}

// GET /api/purchase-orders — คืนใบสั่งซื้อทั้งหมด เรียงจากสร้างล่าสุดไปเก่าสุด
export async function getPurchaseOrders(req, res) {
  const orders = await readJson(ORDERS_PATH);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
}

// POST /api/purchase-orders — สร้างใบสั่งซื้อใหม่
// body ที่ต้องส่งมา: { items: [{ id, qty }, ...] } — id คือรหัสสินค้าใน inventory.json
export async function createPurchaseOrder(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items ต้องเป็น array ที่มีอย่างน้อย 1 รายการ' });
  }

  const inventory = await readJson(INVENTORY_PATH);
  const enrichedItems = [];

  // ฝั่ง frontend ส่งมาแค่ id กับ qty — ต้อง "enrich" (เติมข้อมูล) ชื่อ/ผู้จัดจำหน่าย/ราคา
  // จากข้อมูลสินค้าจริงใน inventory.json เอง ไม่เชื่อข้อมูลที่ frontend ส่งมาตรงๆ
  // (กันกรณี frontend ส่งราคาปลอมมา หรือแค่ข้อมูลไม่ครบ)
  for (const { id, qty } of items) {
    const product = inventory.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });
    }
    const quantity = Number(qty);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: `qty ของสินค้า "${id}" ต้องเป็นตัวเลขที่มากกว่า 0` });
    }
    enrichedItems.push({
      id: product.id,
      name: product.name,
      supplier: product.supplier,
      qty: quantity,
      unitCost: product.unitCost,
    });
  }

  // ถ้าทุกสินค้าในออเดอร์มาจากผู้จัดจำหน่ายเดียวกัน ให้โชว์ชื่อนั้นตรงๆ
  // ถ้ามาจากหลายเจ้า ให้โชว์ "ผู้จัดจำหน่ายหลายราย" แทน
  const suppliers = new Set(enrichedItems.map((i) => i.supplier));
  const supplier = suppliers.size === 1 ? [...suppliers][0] : 'ผู้จัดจำหน่ายหลายราย';

  const orders = await readJson(ORDERS_PATH);
  const newOrder = {
    id: nextPoId(orders),
    createdAt: new Date().toISOString(),
    supplier,
    status: 'Pending',
    items: enrichedItems,
  };

  orders.push(newOrder);
  await writeJson(ORDERS_PATH, orders);

  // 201 = สร้างสำเร็จ (Created) — ส่งใบสั่งซื้อที่เพิ่งสร้างกลับไป ให้ frontend เอาไปเติมบนสุดของตารางได้เลย
  res.status(201).json(newOrder);
}

// PATCH /api/purchase-orders/:id/receive — "รับสินค้าเข้าคลัง"
// จุดสำคัญ: endpoint นี้คือตัวที่ผูกใบสั่งซื้อเข้ากับสต็อกจริง
// (ก่อนหน้านี้สร้าง PO ได้แต่สต็อกไม่เคยขยับเลย จนกว่าจะมาเรียก endpoint นี้)
export async function receivePurchaseOrder(req, res) {
  const { id } = req.params;

  const orders = await readJson(ORDERS_PATH);
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ message: `ไม่พบใบสั่งซื้อ id "${id}"` });
  }
  // กันรับซ้ำ — ถ้ารับไปแล้วครั้งนึง ห้ามบวกสต็อกซ้ำอีกรอบ
  if (order.status === 'Received') {
    return res.status(400).json({ message: 'ใบสั่งซื้อนี้ถูกรับเข้าคลังไปแล้ว' });
  }

  // วนบวกจำนวนของทุกสินค้าในใบสั่งซื้อ เข้าไปในสต็อกจริงทีละตัว
  const inventory = await readJson(INVENTORY_PATH);
  for (const item of order.items) {
    const product = inventory.find((p) => p.id === item.id);
    if (product) {
      product.stock += item.qty;
      product.lastUpdated = new Date().toISOString();
    }
  }
  await writeJson(INVENTORY_PATH, inventory);

  // เปลี่ยนสถานะใบสั่งซื้อเป็น "ได้รับแล้ว" พร้อมบันทึกเวลาที่รับไว้
  order.status = 'Received';
  order.receivedAt = new Date().toISOString();
  await writeJson(ORDERS_PATH, orders);

  // ส่งกลับทั้ง order ที่อัปเดตแล้ว และ inventory ทั้งชุดที่เพิ่งบวกสต็อกไป
  // เพื่อให้ frontend เอาไปอัปเดตทั้งตาราง "ใบสั่งซื้อล่าสุด" และการ์ด "แจ้งเตือนสินค้าใกล้หมด" ได้ทันทีโดยไม่ต้อง reload
  res.json({ order, inventory });
}

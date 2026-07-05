import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname ไม่มีให้ใช้อัตโนมัติใน ES module (import/export) แบบที่ใช้ในโปรเจกต์นี้
// เลยต้องคำนวณเอง จาก path ของไฟล์นี้เอง (import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

// โปรเจกต์นี้ใช้ไฟล์ JSON แทนฐานข้อมูลจริง (ตามที่ README ระบุ)
// ฟังก์ชัน 2 ตัวนี้เลยทำหน้าที่แทน "query" และ "save" ของฐานข้อมูล
async function readInventory() {
  const raw = await readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeInventory(items) {
  await writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

// GET /api/inventory — ส่งสินค้าคงคลังทั้งหมดกลับไปตรงๆ
export async function getInventory(req, res) {
  const items = await readInventory();
  res.json(items);
}

// GET /api/inventory/low-stock — กรองเอาเฉพาะที่สต็อกเหลือน้อยกว่าหรือเท่ากับเกณฑ์ขั้นต่ำ (threshold) ของ SKU นั้น
// หมายเหตุ: threshold เป็นค่าต่อ SKU ที่เก็บไว้ใน inventory.json แต่ละรายการ ไม่ใช่ค่าคงที่ตายตัว
export async function getLowStockInventory(req, res) {
  const items = await readInventory();
  res.json(items.filter((item) => item.stock <= item.threshold));
}

// PATCH /api/inventory/:id/adjust — ปรับจำนวนสต็อกของสินค้า 1 ชิ้น
// body ที่ต้องส่งมา: { type: 'add' | 'remove', amount: number, reason?: string }
export async function adjustStock(req, res) {
  const { id } = req.params; // :id จาก path เช่น /api/inventory/FD-SAL-05/adjust
  const { type, amount, reason } = req.body;

  // เช็คความถูกต้องของ input ก่อนแตะข้อมูลจริง (validation)
  if (type !== 'add' && type !== 'remove') {
    return res.status(400).json({ message: 'type ต้องเป็น "add" หรือ "remove"' });
  }
  const qty = Number(amount);
  if (!Number.isFinite(qty) || qty < 0) {
    return res.status(400).json({ message: 'amount ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0' });
  }

  const items = await readInventory();
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });
  }

  // add = บวกเข้าไปตรงๆ, remove = ลบออกแต่ไม่ให้ติดลบ (กันสต็อกติดลบด้วย Math.max(0, ...))
  item.stock = type === 'add' ? item.stock + qty : Math.max(0, item.stock - qty);
  item.lastUpdated = new Date().toISOString();
  // เก็บ log การปรับครั้งล่าสุดไว้เผื่อย้อนดูทีหลังว่าใครปรับ/ปรับเพราะอะไร (ยังไม่มีหน้าแสดงประวัตินี้)
  item.lastAdjustment = { type, amount: qty, reason: reason || null };

  await writeInventory(items);
  res.json(item); // ส่งข้อมูลสินค้าที่อัปเดตแล้วกลับไป ให้ frontend เอาไปแทนที่ค่าเดิมโดยไม่ต้องดึงใหม่ทั้งหมด
}

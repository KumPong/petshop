import api from './api.js';

// ไฟล์นี้คือ "ชั้นกลาง" ระหว่างหน้า UI (inventory.jsx, restockOrder.jsx) กับ backend
// หน้า UI ไม่ต้องรู้เรื่อง URL หรือ axios เลย แค่เรียกฟังก์ชันพวกนี้แล้วรอ Promise กลับมา

// ดึงสินค้าคงคลังทั้งหมด — ใช้ตอนโหลดหน้า Staff และหน้า Manager
export async function getInventory() {
  const { data } = await api.get('/inventory');
  return data;
}

// ดึงเฉพาะสินค้าที่สต็อกต่ำกว่าเกณฑ์ — ตอนนี้หน้า Manager เลือกดึงข้อมูลทั้งหมดแล้วกรองเองฝั่ง frontend
// (ดู lowStockItems ใน restockOrder.jsx) ฟังก์ชันนี้เลยยังไม่ถูกเรียกใช้จริง แต่เตรียม endpoint ไว้เผื่อใช้
export async function getLowStockInventory() {
  const { data } = await api.get('/inventory/low-stock');
  return data;
}

// ปรับจำนวนสต็อกของสินค้า 1 ชิ้น
// type: 'add' (เพิ่มสต็อก) หรือ 'remove' (ตัดสต็อกออก), amount: จำนวนที่จะปรับ, reason: เหตุผล (เช่น "รับสินค้าใหม่เข้า")
export async function adjustStock(id, { type, amount, reason }) {
  const { data } = await api.patch(`/inventory/${id}/adjust`, { type, amount, reason });
  return data;
}

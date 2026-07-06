import api from './api.js';

// ชั้นกลางระหว่างหน้า UI (inventory.jsx, restockOrder.jsx) กับ backend — ไม่ต้องรู้เรื่อง URL/axios เลย

// ดึงสินค้าคงคลังทั้งหมด — ใช้ตอนโหลดหน้า Staff และหน้า Manager
export async function getInventory() {
  const { data } = await api.get('/inventory');
  return data;
}

// ดึงเฉพาะสินค้าที่สต็อกต่ำกว่าเกณฑ์ — เตรียมไว้เผื่อใช้ ตอนนี้หน้า Manager กรองเองจาก getInventory() แทน
export async function getLowStockInventory() {
  const { data } = await api.get('/inventory/low-stock');
  return data;
}

// ปรับสต็อก 1 ชิ้น — type: 'add' | 'remove', amount: จำนวน, reason: เหตุผล (ดู ADD_REASONS/REMOVE_REASONS ใน inventory.jsx)
export async function adjustStock(id, { type, amount, reason }) {
  const { data } = await api.patch(`/inventory/${id}/adjust`, { type, amount, reason });
  return data;
}

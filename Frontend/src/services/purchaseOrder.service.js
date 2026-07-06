import api from './api.js';

// ชั้นกลางสำหรับเรียก backend เรื่องใบสั่งซื้อ (purchase orders) — ใช้ในหน้า Manager (restockOrder.jsx)

// ดึงใบสั่งซื้อล่าสุดทั้งหมด (backend เรียงล่าสุดก่อนให้แล้ว) — แสดงในตาราง "ใบสั่งซื้อล่าสุด"
export async function getPurchaseOrders() {
  const { data } = await api.get('/purchase-orders');
  return data;
}

// สร้างใบสั่งซื้อใหม่ — items เป็น array ของ { id, qty } เรียกตอนกด "ยืนยันการสั่งซื้อ" ใน modal
export async function createPurchaseOrder(items) {
  const { data } = await api.post('/purchase-orders', { items });
  return data;
}

// "รับสินค้าเข้าคลัง" — ปิดจบใบสั่งซื้อใบนั้น backend จะบวกสต็อกจริงให้เอง
// แล้วส่งกลับทั้ง order ที่อัปเดตแล้ว และ inventory ทั้งชุดที่สต็อกเปลี่ยนไป
export async function receivePurchaseOrder(id) {
  const { data } = await api.patch(`/purchase-orders/${id}/receive`);
  return data;
}

import api from './api.js';

// ชั้นกลางสำหรับเรียก backend เรื่องคำสั่งซื้อ/ชำระเงินของลูกค้า
// ใช้ในหน้า Payment (payment.jsx), Confirmation (confirmation.jsx), Tracking (tracking.jsx)

// แนบ token ถ้ามี (login แล้ว) ให้ backend เอาไปผูก customerId ตอนสร้างออเดอร์ และเช็คสิทธิ์เจ้าของออเดอร์ตอนดึงข้อมูล
// ไม่มี token (guest) ก็ยังเรียกได้ปกติ — backend จะ fallback เป็นพฤติกรรมเดิม (ไม่เช็คสิทธิ์)
function authHeaders() {
  const token = sessionStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// สร้างคำสั่งซื้อจากตะกร้า — backend จำลองชำระเงิน + สร้าง timeline จัดส่งให้ครบในคำขอเดียว
// items: [{ productId, quantity }], shippingAddress: { fullName, street, city, postalCode, phone }
// paymentMethod/shippingMethod: string ('บัตรเครดิต'... / 'standard' | 'express')
export async function createOrder(items, paymentMethod, shippingAddress, shippingMethod) {
  const { data } = await api.post('/orders', { items, paymentMethod, shippingAddress, shippingMethod }, authHeaders());
  return data;
}

// ดึงออเดอร์เดียวตามเลขที่ออเดอร์ — ใช้ในหน้า Confirmation และหน้า Tracking (ตอนระบุเลขออเดอร์มาด้วย)
export async function getOrder(orderId) {
  const { data } = await api.get(`/orders/${orderId}`, authHeaders());
  return data;
}

// ดึงออเดอร์ทั้งหมด — ต้อง login เท่านั้น (backend เช็คเอง) ใช้ใน Tracking ตอนไม่ระบุเลขออเดอร์ (โชว์ออเดอร์ล่าสุดของตัวเอง)
// และหน้า Order manage (list, Staff/Manager เห็นทุกออเดอร์)
export async function getOrders() {
  const { data } = await api.get('/orders', authHeaders());
  return data;
}

// อัปเดตความคืบหน้าออเดอร์ — ใช้ในหน้า Order manage (Staff) เท่านั้น backend เช็ค role Staff/Manager จาก token อีกชั้น
// payload: { status, courierNotes?, pickedItems?, flagReason? } — ดู order.controller.js (updateOrderStatus) สำหรับกติกาเต็ม
export async function updateOrderStatus(orderId, payload) {
  const { data } = await api.patch(`/orders/${orderId}/status`, payload, authHeaders());
  return data;
}

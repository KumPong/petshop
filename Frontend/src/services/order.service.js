import api from './api.js';

// ชั้นกลางสำหรับเรียก backend เรื่องคำสั่งซื้อ/ชำระเงินของลูกค้า
// ใช้ในหน้า Payment (payment.jsx), Confirmation (confirmation.jsx), Tracking (tracking.jsx)

// สร้างคำสั่งซื้อจากตะกร้า — backend จำลองชำระเงิน + สร้าง timeline จัดส่งให้ครบในคำขอเดียว
// items: [{ productId, quantity }], shippingAddress: { fullName, street, city, postalCode, phone }
// paymentMethod/shippingMethod: string ('บัตรเครดิต'... / 'standard' | 'express')
export async function createOrder(items, paymentMethod, shippingAddress, shippingMethod) {
  const { data } = await api.post('/orders', { items, paymentMethod, shippingAddress, shippingMethod });
  return data;
}

// ดึงออเดอร์เดียวตามเลขที่ออเดอร์ — ใช้ในหน้า Confirmation และหน้า Tracking (ตอนระบุเลขออเดอร์มาด้วย)
export async function getOrder(orderId) {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
}

// ดึงออเดอร์ทั้งหมด — ใช้ใน Tracking ตอนไม่ระบุเลขออเดอร์ (ยังไม่มี login เลย fallback โชว์ล่าสุดแทน)
export async function getOrders() {
  const { data } = await api.get('/orders');
  return data;
}

import api from './api.js';

// ชั้นกลางสำหรับเรียก backend เรื่องรายงาน — ใช้ในหน้า Manager (report.jsx)

// backend บังคับ Manager เท่านั้นถึงจะดูรายงานได้ (401/403 ถ้าไม่มี token/ไม่ใช่ Manager) ต้องแนบ token เสมอ
function authHeaders() {
  const token = sessionStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// รายงานยอดขาย — period: 'daily' | 'monthly' | 'quarterly'
export async function getSalesReport(period) {
  const { data } = await api.get('/reports/sales', { params: { period }, ...authHeaders() });
  return data;
}

// รายงานสินค้าคงเหลือ — ไม่มีตัวกรองช่วงเวลา (เป็นภาพรวม ณ ตอนนี้เสมอ)
export async function getInventoryReport() {
  const { data } = await api.get('/reports/inventory', authHeaders());
  return data;
}

// รายงานผลประกอบการ — period: 'daily' | 'monthly' | 'quarterly'
export async function getProfitReport(period) {
  const { data } = await api.get('/reports/profit', { params: { period }, ...authHeaders() });
  return data;
}

import api from './api.js';

// ชั้นกลางสำหรับเรียก backend เรื่องรายงาน — ใช้ในหน้า Manager (report.jsx)

// รายงานยอดขาย — period: 'daily' | 'monthly' | 'quarterly'
export async function getSalesReport(period) {
  const { data } = await api.get('/reports/sales', { params: { period } });
  return data;
}

// รายงานสินค้าคงเหลือ — ไม่มีตัวกรองช่วงเวลา (เป็นภาพรวม ณ ตอนนี้เสมอ)
export async function getInventoryReport() {
  const { data } = await api.get('/reports/inventory');
  return data;
}

// รายงานผลประกอบการ — period: 'daily' | 'monthly' | 'quarterly'
export async function getProfitReport(period) {
  const { data } = await api.get('/reports/profit', { params: { period } });
  return data;
}

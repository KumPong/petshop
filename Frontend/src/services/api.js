import axios from 'axios';

// axios instance ตัวกลาง ให้ทุก service ไฟล์อื่น (inventory.service.js, purchaseOrder.service.js)
// import ตัวนี้ไปใช้แทนที่จะเรียก axios ตรงๆ ทุกที่ — ข้อดีคือถ้าจะเปลี่ยน base URL
// หรือเพิ่ม config กลาง (เช่น header, timeout) ทีหลัง แก้ที่ไฟล์เดียวพอ
const api = axios.create({
  // อ่าน URL ของ backend จาก environment variable VITE_API_BASE_URL ก่อน
  // ถ้าไม่มีตั้งไว้ (เช่นตอน dev เครื่องตัวเอง) จะ fallback ไปที่ backend local port 4000
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

export default api;

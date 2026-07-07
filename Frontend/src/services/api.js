import axios from 'axios';

// axios instance กลาง ให้ทุก service ไฟล์อื่น import ไปใช้ — เปลี่ยน base URL/เพิ่ม config ทีหลังแก้ที่เดียวพอ
const api = axios.create({
  // ตั้งผ่าน env VITE_API_BASE_URL ได้ ถ้าไม่มีจะ fallback ไปที่ backend local port 4000
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

export default api;

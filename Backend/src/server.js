import express from 'express';
import cors from 'cors';
import inventoryRoutes from '../routes/inventory.route.js';
import purchaseOrderRoutes from '../routes/purchaseOrder.route.js';

// จุดเริ่มต้นของ Backend — ไฟล์นี้แค่ "ประกอบร่าง" server ไม่มี business logic เอง
const app = express();

// cors() อนุญาตให้ Frontend (คนละ port คือ 5173) ยิง request มาที่ backend นี้ได้
// ถ้าไม่มีบรรทัดนี้ browser จะบล็อก request ข้าม origin เอง
app.use(cors());

// express.json() แปลง body ของ request ที่เป็น JSON (เช่นตอน POST/PATCH) ให้กลายเป็น req.body
// ถ้าไม่มีบรรทัดนี้ req.body จะเป็น undefined เสมอ
app.use(express.json());

// mount แปลว่า "เอา router ไปต่อกับ path นี้" — ทุก route ใน inventoryRoutes
// จะขึ้นต้นด้วย /api/inventory โดยอัตโนมัติ (เช่น router.get('/low-stock') จริงๆ คือ /api/inventory/low-stock)
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);

// ใช้ port จาก environment variable ถ้ามี ไม่งั้น fallback เป็น 4000
// (ไม่ใช้ 5000 เพราะบน macOS port 5000 ชนกับ AirPlay Receiver ของระบบ)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

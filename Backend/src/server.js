import express from 'express';
import cors from 'cors';
import inventoryRoutes from '../routes/inventory.route.js';
import purchaseOrderRoutes from '../routes/purchaseOrder.route.js';
import orderRoutes from '../routes/order.route.js';

// จุดเริ่มต้นของ Backend — ไฟล์นี้แค่ "ประกอบร่าง" server ไม่มี business logic เอง
const app = express();

// cors() อนุญาต Frontend (port 5173) ยิง request ข้าม origin มาได้ — ไม่งั้น browser จะบล็อกเอง
app.use(cors());

// express.json() แปลง body ของ request (POST/PATCH) ให้กลายเป็น req.body — ไม่งั้นจะเป็น undefined เสมอ
app.use(express.json());

// mount router เข้ากับ path — route ใน inventoryRoutes จะขึ้นต้นด้วย /api/inventory โดยอัตโนมัติ
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/orders', orderRoutes);

// อ่าน port จาก env ถ้ามี ไม่งั้น fallback 4000 (เลี่ยง 5000 เพราะชนกับ AirPlay Receiver บน macOS)
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

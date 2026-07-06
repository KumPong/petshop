import { Router } from 'express';
import { getOrders, getOrderById, createOrder } from '../controllers/order.controller.js';

// แค่ประกาศเส้นทาง (route) เฉยๆ — logic จริงอยู่ใน order.controller.js
const router = Router();

// GET /api/orders — ออเดอร์ทั้งหมด (เรียงล่าสุดก่อน) ใช้โดยหน้า Tracking ตอนไม่ระบุเลขออเดอร์
router.get('/', getOrders);

// GET /api/orders/:id — ออเดอร์เดียวตามเลขที่ ใช้โดยหน้า Confirmation และ Tracking (ระบุเลขออเดอร์)
router.get('/:id', getOrderById);

// POST /api/orders — ทำครบ checkout ในคำขอเดียว: ตรวจสินค้า -> คำนวณราคาจริงจาก product.json ->
// จำลองชำระเงิน -> สร้างออเดอร์พร้อม timeline จัดส่ง body: { items, paymentMethod, shippingAddress, shippingMethod }
router.post('/', createOrder);

// ส่งออกไปให้ server.js เอาไปต่อ (mount) ที่ path "/api/orders"
export default router;

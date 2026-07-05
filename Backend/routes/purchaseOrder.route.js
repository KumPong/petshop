import { Router } from 'express';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
} from '../controllers/purchaseOrder.controller.js';

// router คือตัวจับคู่ "HTTP method + path" กับฟังก์ชันที่จะให้ทำงาน (controller)
// ไฟล์นี้แค่ประกาศเส้นทาง (route) ไม่มี logic เอง — logic จริงอยู่ใน purchaseOrder.controller.js
const router = Router();

// GET /api/purchase-orders
// ดึงรายการใบสั่งซื้อทั้งหมด (เรียงล่าสุดก่อน) ไปแสดงในตาราง "ใบสั่งซื้อล่าสุด"
router.get('/', getPurchaseOrders);

// POST /api/purchase-orders
// สร้างใบสั่งซื้อใหม่ — body ต้องส่ง { items: [{ id, qty }, ...] }
// เรียกตอนกด "ยืนยันการสั่งซื้อ" ในหน้า Manager
router.post('/', createPurchaseOrder);

// PATCH /api/purchase-orders/:id/receive
// "รับสินค้าเข้าคลัง" — เอาไว้ปิดจบใบสั่งซื้อใบนั้น โดยจะไปบวกจำนวนสต็อกจริง
// ของทุกสินค้าใน PO นี้เข้า inventory.json แล้วเปลี่ยนสถานะ PO เป็น "Received"
// :id ในเส้นทางคือเลขที่ใบสั่งซื้อ เช่น PATCH /api/purchase-orders/PO-8823/receive
router.patch('/:id/receive', receivePurchaseOrder);

// ส่ง router ตัวนี้ออกไปให้ server.js เอาไปต่อ (mount) ที่ path "/api/purchase-orders"
export default router;

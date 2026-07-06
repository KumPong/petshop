import { Router } from 'express';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
} from '../controllers/purchaseOrder.controller.js';

// แค่ประกาศเส้นทาง (route) เฉยๆ — logic จริงอยู่ใน purchaseOrder.controller.js
const router = Router();

// GET /api/purchase-orders — ใบสั่งซื้อทั้งหมด (เรียงล่าสุดก่อน) ไปแสดงในตาราง "ใบสั่งซื้อล่าสุด"
router.get('/', getPurchaseOrders);

// POST /api/purchase-orders — สร้าง PO ใหม่ body: { items: [{ id, qty }] } เรียกตอนกด "ยืนยันการสั่งซื้อ"
router.post('/', createPurchaseOrder);

// PATCH /api/purchase-orders/:id/receive — "รับสินค้าเข้าคลัง" บวกสต็อกจริงของทุกชิ้นใน PO เข้า
// inventory.json แล้วเปลี่ยนสถานะ PO เป็น "Received" (:id เช่น PO-8823)
router.patch('/:id/receive', receivePurchaseOrder);

// ส่งออกไปให้ server.js เอาไปต่อ (mount) ที่ path "/api/purchase-orders"
export default router;

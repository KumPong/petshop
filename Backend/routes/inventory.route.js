import { Router } from 'express';
import { getInventory, getLowStockInventory, adjustStock } from '../controllers/inventory.controller.js';

const router = Router();

// GET /api/inventory — สินค้าคงคลังทั้งหมด ใช้โดยตาราง Product Catalog (Staff) และ modal เลือกสินค้า (Manager)
router.get('/', getInventory);

// GET /api/inventory/low-stock — เฉพาะ stock <= threshold ใช้แสดงการ์ด "แจ้งเตือนสินค้าใกล้หมด" ของ Manager
router.get('/low-stock', getLowStockInventory);

// PATCH /api/inventory/:id/adjust — ปรับสต็อก 1 ชิ้น, body: { type: 'add'|'remove', amount, reason }
router.patch('/:id/adjust', adjustStock);

export default router;

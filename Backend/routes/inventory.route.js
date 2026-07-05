import { Router } from 'express';
import { getInventory, getLowStockInventory, adjustStock } from '../controllers/inventory.controller.js';

const router = Router();

// GET /api/inventory
// ดึงรายการสินค้าคงคลังทั้งหมด — ใช้โดยหน้า Staff (ตาราง Product Catalog)
// และหน้า Manager (catalog ใน modal "เลือกสินค้าที่จะเพิ่ม")
router.get('/', getInventory);

// GET /api/inventory/low-stock
// ดึงเฉพาะสินค้าที่ stock <= threshold — ใช้แสดงการ์ด "แจ้งเตือนสินค้าใกล้หมด" ในหน้า Manager
router.get('/low-stock', getLowStockInventory);

// PATCH /api/inventory/:id/adjust
// ปรับจำนวนสต็อกของสินค้า 1 ชิ้น — body ต้องส่ง { type: 'add'|'remove', amount, reason }
// เรียกตอนกด "บันทึกการปรับสต็อก" ใน modal ของหน้า Staff
router.patch('/:id/adjust', adjustStock);

export default router;

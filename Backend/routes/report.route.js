import { Router } from 'express';
import { getSalesReport, getInventoryReport, getProfitReport } from '../controllers/report.controller.js';

const router = Router();

// GET /api/reports/sales?period=daily|monthly|quarterly — stat cards + กราฟแท่ง + สินค้าขายดี
router.get('/sales', getSalesReport);

// GET /api/reports/inventory — stat cards + ตาราง low-stock/out-of-stock
router.get('/inventory', getInventoryReport);

// GET /api/reports/profit?period=daily|monthly|quarterly — stat cards + กราฟแท่ง + กราฟวงกลมต้นทุน vs กำไร
router.get('/profit', getProfitReport);

export default router;

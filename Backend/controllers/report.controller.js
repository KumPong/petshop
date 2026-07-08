import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// อ้าง Class Report/SalesReport/InventoryReport/ProfitReport ใน README — โปรเจกต์นี้ไม่มี Report entity
// แยกต่างหากใน DB (ไม่มี reportId/generatedAt persist ไว้) เพราะ generate() คำนวณสดจาก order.json/inventory.json
// ทุกครั้งที่เรียกอยู่แล้ว (เหมือนแนวทางเดียวกับ attachLiveTimeline ใน order.controller.js)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'order.json');
const INVENTORY_PATH = path.join(__dirname, '..', 'data', 'inventory.json');
const PRODUCT_PATH = path.join(__dirname, '..', 'data', 'product.json');

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// จำนวนช่วงเวลาย้อนหลังที่แสดงบนกราฟของแต่ละ periodType (นับรวมช่วงปัจจุบันด้วย)
const PERIOD_CONFIG = {
  daily: { count: 14, unit: 'day' },
  monthly: { count: 12, unit: 'month' },
  quarterly: { count: 8, unit: 'quarter' },
};

function normalizePeriod(period) {
  return PERIOD_CONFIG[period] ? period : 'monthly'; // default รายเดือน ถ้าไม่ส่ง query มา หรือส่งค่าที่ไม่รู้จัก
}

// เปรียบเทียบ bucket ล่าสุด (ช่วงปัจจุบัน) กับ bucket ก่อนหน้า (ช่วงก่อนหน้าประเภทเดียวกัน) ใช้ทำ trend badge
// บน stat card — คืนทั้ง % และค่าต่างจริง (delta) ไว้โชว์ caption เช่น "+฿140k จากเดือนที่แล้ว"
// pct เป็น null ถ้าข้อมูลไม่พอเทียบ (bucket ก่อนหน้าเป็น 0) กันหาร 0
function trendOf(buckets, getValue) {
  if (buckets.length < 2) return null;
  const curr = getValue(buckets[buckets.length - 1]);
  const prev = getValue(buckets[buckets.length - 2]);
  const delta = curr - prev;
  return { curr, prev, delta, pct: prev ? (delta / prev) * 100 : null };
}

// คำนวณ key (ไว้ group ข้อมูล) และ label ภาษาไทย (ไว้โชว์บนกราฟ) ของวันที่ที่ให้มา ตาม periodType
function bucketOf(dateInput, periodType) {
  const d = new Date(dateInput);
  if (periodType === 'daily') {
    return { key: d.toISOString().slice(0, 10), label: `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}` };
  }
  if (periodType === 'quarterly') {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return { key: `${d.getFullYear()}-Q${q}`, label: `Q${q} ${d.getFullYear() + 543}` };
  }
  // monthly
  return {
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    label: `${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`,
  };
}

// สร้างรายการ bucket ว่างๆ ย้อนหลังจากวันนี้ตามจำนวนที่กำหนดใน PERIOD_CONFIG เรียงเก่า->ใหม่ ไว้ก่อน
// (เติม 0 ล่วงหน้าทุกช่วง กันกราฟขาดช่วงที่ไม่มีออเดอร์เลย ไม่ใช่แค่โผล่เฉพาะช่วงที่มีข้อมูล)
function buildEmptyBuckets(periodType) {
  const { count, unit } = PERIOD_CONFIG[periodType];
  const now = new Date();
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (unit === 'day') d.setDate(d.getDate() - i);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    if (unit === 'quarter') d.setMonth(d.getMonth() - i * 3);
    buckets.push({ ...bucketOf(d, periodType), totalSales: 0, totalOrders: 0, revenue: 0, cost: 0 });
  }
  return buckets;
}

// GET /api/reports/sales?period=daily|monthly|quarterly — คลาส SalesReport.generate() ใน README
export async function getSalesReport(req, res) {
  const periodType = normalizePeriod(req.query.period);
  const [orders, products] = await Promise.all([readJson(ORDERS_PATH), readJson(PRODUCT_PATH)]);
  const categoryByProductId = new Map(products.map((p) => [p.productId, p.category || 'อื่นๆ']));

  const buckets = buildEmptyBuckets(periodType);
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
  const productAgg = new Map(); // productId -> { productId, name, quantity, revenue } สำหรับสินค้าขายดี
  const categoryAgg = new Map(); // category -> { category, orderIds: Set, quantity, revenue } สำหรับผลงานแยกตามหมวดหมู่

  let totalOrders = 0;
  let totalSales = 0;

  for (const order of orders) {
    const bucket = bucketByKey.get(bucketOf(order.orderDate, periodType).key);
    totalOrders += 1;
    totalSales += order.totalAmount;
    if (bucket) {
      bucket.totalSales += order.totalAmount;
      bucket.totalOrders += 1;
    }

    for (const item of order.items) {
      const category = categoryByProductId.get(item.productId) || 'อื่นๆ';
      const agg = productAgg.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        category,
        quantity: 0,
        revenue: 0,
      };
      agg.quantity += item.quantity;
      agg.revenue += item.subTotal;
      productAgg.set(item.productId, agg);

      const catAgg = categoryAgg.get(category) || { category, orderIds: new Set(), quantity: 0, revenue: 0 };
      catAgg.orderIds.add(order.orderId);
      catAgg.quantity += item.quantity;
      catAgg.revenue += item.subTotal;
      categoryAgg.set(category, catAgg);
    }
  }

  const topProducts = [...productAgg.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // จัดอันดับตามยอดขาย แล้วให้สถานะตามอันดับ (สูงสุด = ยอดเยี่ยม, ต่ำสุด = ต้องเร่งยอด, ระหว่างกลาง = คงที่)
  // มาจากข้อมูลจริงล้วนๆ ไม่ใช่ threshold ที่ตั้งลอยๆ
  const categoryRevenueTotal = [...categoryAgg.values()].reduce((sum, c) => sum + c.revenue, 0);
  const categoryBreakdown = [...categoryAgg.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .map((c, index, arr) => ({
      category: c.category,
      orders: c.orderIds.size,
      quantity: c.quantity,
      revenue: c.revenue,
      share: categoryRevenueTotal ? (c.revenue / categoryRevenueTotal) * 100 : 0,
      status: index === 0 ? 'ยอดเยี่ยม' : index === arr.length - 1 ? 'ต้องเร่งยอด' : 'คงที่',
    }));

  res.json({
    period: periodType,
    summary: {
      totalOrders,
      totalSales,
      averageOrderValue: totalOrders ? totalSales / totalOrders : 0,
    },
    // เปรียบเทียบช่วงล่าสุดกับช่วงก่อนหน้า (เช่น เดือนนี้เทียบเดือนที่แล้ว) ไว้โชว์เป็น trend badge
    trend: {
      totalSales: trendOf(buckets, (b) => b.totalSales),
      totalOrders: trendOf(buckets, (b) => b.totalOrders),
      averageOrderValue: trendOf(buckets, (b) => (b.totalOrders ? b.totalSales / b.totalOrders : 0)),
    },
    chart: buckets.map(({ label, totalSales: sales, totalOrders: orderCount }) => ({
      label,
      totalSales: sales,
      totalOrders: orderCount,
    })),
    topProducts,
    categoryBreakdown,
  });
}

// GET /api/reports/inventory — คลาส InventoryReport.generate() ใน README
export async function getInventoryReport(req, res) {
  const items = await readJson(INVENTORY_PATH);

  const totalItems = items.reduce((sum, i) => sum + i.stock, 0);
  const totalValue = items.reduce((sum, i) => sum + i.stock * i.unitCost, 0);
  const lowStockItems = items.filter((i) => i.stock > 0 && i.stock <= i.threshold);
  const outOfStockItems = items.filter((i) => i.stock === 0);

  res.json({
    summary: {
      totalItems,
      totalValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
    },
    lowStockItems,
    outOfStockItems,
  });
}

// GET /api/reports/profit?period=daily|monthly|quarterly — คลาส ProfitReport.generate() ใน README
// ข้อจำกัด: ไม่มีระบบเก็บต้นทุนย้อนหลัง (cost history) ในระบบเลย ใช้ unitCost ปัจจุบันจาก inventory.json
// คำนวณ COGS แทนต้นทุน ณ เวลาที่ขายจริง (ถ้าต้นทุนสินค้าเปลี่ยนไปหลังขาย ตัวเลขย้อนหลังจะไม่แม่นยำ 100%)
// รายรับใช้ order.subtotal (ยอดขายสินค้าล้วนๆ) ไม่รวมค่าส่ง/ภาษี เพื่อให้เทียบกับ COGS ได้ตรงประเภทกัน
export async function getProfitReport(req, res) {
  const periodType = normalizePeriod(req.query.period);
  const [orders, inventory] = await Promise.all([readJson(ORDERS_PATH), readJson(INVENTORY_PATH)]);
  const costByProductId = new Map(inventory.map((i) => [i.productId, i.unitCost]));

  const buckets = buildEmptyBuckets(periodType);
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

  let totalRevenue = 0;
  let totalCost = 0;

  for (const order of orders) {
    const orderCost = order.items.reduce(
      (sum, item) => sum + item.quantity * (costByProductId.get(item.productId) ?? 0),
      0
    );
    totalRevenue += order.subtotal;
    totalCost += orderCost;

    const bucket = bucketByKey.get(bucketOf(order.orderDate, periodType).key);
    if (bucket) {
      bucket.revenue += order.subtotal;
      bucket.cost += orderCost;
    }
  }

  const grossProfit = totalRevenue - totalCost;
  // ยังไม่มีข้อมูลค่าใช้จ่ายดำเนินงาน (opex) อื่นในระบบ (ค่าเช่า/เงินเดือน ฯลฯ) เลยให้ netProfit = grossProfit ไปก่อน
  const netProfit = grossProfit;

  const bucketsWithProfit = buckets.map((b) => ({ ...b, profit: b.revenue - b.cost }));

  res.json({
    period: periodType,
    summary: { totalRevenue, totalCost, grossProfit, netProfit },
    trend: {
      revenue: trendOf(bucketsWithProfit, (b) => b.revenue),
      cost: trendOf(bucketsWithProfit, (b) => b.cost),
      profit: trendOf(bucketsWithProfit, (b) => b.profit),
    },
    chart: buckets.map(({ label, revenue, cost }) => ({ label, revenue, cost, profit: revenue - cost })),
    breakdown: [
      { name: 'ต้นทุน', value: totalCost },
      { name: 'กำไร', value: grossProfit },
    ],
  });
}

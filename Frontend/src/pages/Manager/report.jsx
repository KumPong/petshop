// Frontend/src/pages/Manager/report.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Archive,
  AlertTriangle,
  PackageX,
  Wallet,
  Coins,
  Printer,
  Download,
  Tag,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getSalesReport, getInventoryReport, getProfitReport } from '../../services/report.service.js';

// อ้าง Sequence Diagram "3.Manager" เฟส 3 — เรียก SalesReport.generate() กับ InventoryReport.generate() แยกกัน
// คนละ call จึงแยกเป็น tab คนละหมวด (ยอดขาย/สินค้าคงเหลือ/ผลประกอบการ) ไม่ยัดกราฟทั้งหมดไว้หน้าเดียว
const TABS = [
  { key: 'sales', label: 'ยอดขาย', subtitle: 'วิเคราะห์รายงานการขาย ข้อมูลสรุปประสิทธิภาพธุรกิจและแนวโน้มการเติบโต' },
  { key: 'inventory', label: 'สินค้าคงเหลือ', subtitle: 'ภาพรวมมูลค่าสต็อกและสินค้าที่ต้องเติมด่วน' },
  { key: 'profit', label: 'ผลประกอบการ', subtitle: 'สรุปรายรับ ต้นทุน และกำไรของร้าน' },
];

const PERIODS = [
  { key: 'daily', label: 'รายวัน' },
  { key: 'monthly', label: 'รายเดือน' },
  { key: 'quarterly', label: 'รายไตรมาส' },
];

const CHART_COLORS = { sales: '#8AA624', cost: '#E76F51', profit: '#588157' };

const STATUS_PILL = {
  ยอดเยี่ยม: 'bg-green-100 text-green-700',
  คงที่: 'bg-gray-100 text-gray-600',
  ต้องเร่งยอด: 'bg-red-100 text-red-600',
};

function money(n) {
  return `฿${(n ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// แปลง array ของ object ธรรมดาเป็นไฟล์ CSV แล้วสั่งดาวน์โหลดทันที — ไม่ใช้ library ตามที่ตัดสินใจไว้ในแผน
// (ใส่ BOM นำหน้ากันข้อความภาษาไทยเพี้ยนตอนเปิดด้วย Excel)
function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function EmptyState({ text }) {
  return <p className="py-10 text-center text-sm text-gray-400">{text}</p>;
}

// pill เล็กๆ มุมขวาบนของ stat card โชว์ % เปลี่ยนแปลงเทียบช่วงก่อนหน้า (เขียว = ขึ้น, แดง = ลง)
// ไม่โชว์อะไรเลยถ้าเทียบไม่ได้ (pct เป็น null เช่นช่วงก่อนหน้าไม่มีข้อมูลเลย) กันโชว์เลขมั่ว
function TrendBadge({ trend }) {
  if (!trend || trend.pct === null || !Number.isFinite(trend.pct)) return null;
  const isUp = trend.pct >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}
    >
      <Icon size={12} />
      {Math.abs(trend.pct).toFixed(1)}%
    </span>
  );
}

function StatCard({ icon, label, value, caption, trend, tone = 'text-gray-900' }) {
  return (
    <div className="break-inside-avoid rounded-2xl bg-other p-6 print:bg-gray-50">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-700">{icon}</span>
        <TrendBadge trend={trend} />
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
      {caption && <p className="mt-1 text-xs text-gray-500">{caption}</p>}
    </div>
  );
}

// segmented control เลือกช่วงเวลา ใช้ร่วมกันทั้ง tab ยอดขาย/ผลประกอบการ (สินค้าคงเหลือเป็นภาพรวม ณ ปัจจุบันเสมอ ไม่มีตัวนี้)
function PeriodToggle({ period, onChange }) {
  return (
    <div className="flex gap-1 rounded-full bg-background p-1">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            period === p.key ? 'bg-primary text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function SalesTab({ period, onPeriodChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');

  useEffect(() => {
    let cancelled = false;
    // ไม่เคลียร์ data/loading ก่อนยิง fetch ใหม่ตอนสลับช่วงเวลา — โชว์ข้อมูลเก่าค้างไว้จนกว่าจะโหลดเสร็จ กัน
    // หน้าจอกระพริบว่างเปล่า (loading state ใช้แค่ตอนโหลดครั้งแรกที่ data ยังเป็น null เท่านั้น)
    getSalesReport(period)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError('โหลดรายงานยอดขายไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [period]);

  const categories = useMemo(
    () => ['ทั้งหมด', ...(data?.categoryBreakdown.map((c) => c.category) ?? [])],
    [data]
  );

  const filteredTopProducts = useMemo(() => {
    if (!data) return [];
    if (categoryFilter === 'ทั้งหมด') return data.topProducts;
    return data.topProducts.filter((p) => p.category === categoryFilter);
  }, [data, categoryFilter]);

  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;
  if (loading || !data) return <EmptyState text="กำลังโหลดข้อมูล..." />;

  const hasSales = data.summary.totalOrders > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          icon={<DollarSign size={22} />}
          label="รายได้รวมทั้งหมด"
          value={money(data.summary.totalSales)}
          trend={data.trend.totalSales}
          caption={
            data.trend.totalSales &&
            `${data.trend.totalSales.delta >= 0 ? '+' : '-'}${money(Math.abs(data.trend.totalSales.delta))} จากช่วงก่อนหน้า`
          }
        />
        <StatCard
          icon={<ShoppingCart size={22} />}
          label="ราคาเฉลี่ยต่อออเดอร์"
          value={money(data.summary.averageOrderValue)}
          trend={data.trend.averageOrderValue}
          caption={
            data.trend.averageOrderValue &&
            `${data.trend.averageOrderValue.delta >= 0 ? '+' : '-'}${money(Math.abs(data.trend.averageOrderValue.delta))} จากยอดเฉลี่ยเดิม`
          }
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="จำนวนออเดอร์รวม"
          value={data.summary.totalOrders.toLocaleString('th-TH')}
          trend={data.trend.totalOrders}
          caption={
            data.trend.totalOrders &&
            `${data.trend.totalOrders.delta >= 0 ? '+' : ''}${data.trend.totalOrders.delta} รายการ เทียบกับช่วงก่อนหน้า`
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">แนวโน้มยอดขาย</h2>
              <p className="text-xs text-gray-500">เปรียบเทียบยอดขายตามช่วงเวลา</p>
            </div>
            <PeriodToggle period={period} onChange={onPeriodChange} />
          </div>
          {hasSales ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.chart}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.sales} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_COLORS.sales} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => money(v)} />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  name="ยอดขาย"
                  stroke={CHART_COLORS.sales}
                  fill="url(#salesFill)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="ยังไม่มีข้อมูลยอดขายในช่วงเวลานี้" />
          )}
        </div>

        <div className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Tag size={18} className="text-gray-500" />
            หมวดหมู่สินค้า
          </h2>
          {/* ไม่มีข้อมูล "ภูมิภาค/สาขา" ในระบบ (ไม่มี entity สาขา) และ "ช่วงวันที่" ก็ซ้ำกับตัวเลือกช่วงเวลาด้านบนอยู่แล้ว
              เลยตัดสองอย่างนั้นออก เหลือแค่ตัวกรองหมวดหมู่ที่มีข้อมูลจริงรองรับ ใช้กรองตาราง "สินค้าขายดี" ด้านล่าง */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === c ? 'bg-primary text-gray-900' : 'bg-background text-gray-600 hover:text-gray-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">ผลงานแยกตามหมวดหมู่</h2>
          <button
            onClick={() =>
              downloadCsv(
                'sales-by-category.csv',
                data.categoryBreakdown.map((c) => ({
                  หมวดหมู่: c.category,
                  จำนวนออเดอร์: c.orders,
                  ยอดขายรวม: c.revenue,
                  สัดส่วน: `${c.share.toFixed(1)}%`,
                  สถานะ: c.status,
                }))
              )
            }
            disabled={data.categoryBreakdown.length === 0}
            className="no-print flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
        {data.categoryBreakdown.length === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูลการขาย" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="py-3 font-medium">หมวดหมู่</th>
                <th className="py-3 font-medium">จำนวนออเดอร์</th>
                <th className="py-3 font-medium">ยอดขายรวม</th>
                <th className="py-3 font-medium">สัดส่วนยอดขาย</th>
                <th className="py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryBreakdown.map((c) => (
                <tr key={c.category} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{c.category}</td>
                  <td className="py-3 text-gray-600">{c.orders.toLocaleString('th-TH')} รายการ</td>
                  <td className="py-3 font-semibold text-gray-900">{money(c.revenue)}</td>
                  <td className="py-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, c.share)}%` }} />
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">สินค้าขายดี{categoryFilter !== 'ทั้งหมด' && ` — ${categoryFilter}`}</h2>
        {filteredTopProducts.length === 0 ? (
          <EmptyState text="ไม่มีข้อมูลสินค้าในหมวดหมู่นี้" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="py-3 font-medium">ชื่อสินค้า</th>
                <th className="py-3 font-medium">จำนวนที่ขายได้</th>
                <th className="py-3 font-medium">ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopProducts.map((p) => (
                <tr key={p.productId} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 text-gray-600">{p.quantity.toLocaleString('th-TH')}</td>
                  <td className="py-3 font-semibold text-gray-900">{money(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InventoryTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getInventoryReport()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError('โหลดรายงานสินค้าคงเหลือไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;
  if (loading || !data) return <EmptyState text="กำลังโหลดข้อมูล..." />;

  const attentionItems = [...data.outOfStockItems, ...data.lowStockItems];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={<Archive size={22} />} label="มูลค่าสต็อกรวม" value={money(data.summary.totalValue)} />
        <StatCard icon={<Archive size={22} />} label="จำนวนสินค้าคงเหลือ" value={data.summary.totalItems.toLocaleString('th-TH')} />
        <StatCard
          icon={<AlertTriangle size={22} />}
          label="ใกล้หมดสต็อก"
          value={data.summary.lowStockCount.toLocaleString('th-TH')}
          tone={data.summary.lowStockCount > 0 ? 'text-orange-600' : 'text-gray-900'}
        />
        <StatCard
          icon={<PackageX size={22} />}
          label="สินค้าหมดสต็อก"
          value={data.summary.outOfStockCount.toLocaleString('th-TH')}
          tone={data.summary.outOfStockCount > 0 ? 'text-red-600' : 'text-gray-900'}
        />
      </div>

      <div className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <AlertTriangle className="text-orange-500" size={18} />
            สินค้าใกล้หมด / หมดสต็อก
          </h2>
          <button
            onClick={() =>
              downloadCsv(
                'inventory-attention.csv',
                attentionItems.map((i) => ({
                  ชื่อสินค้า: i.name,
                  คงเหลือ: i.stock,
                  เกณฑ์ขั้นต่ำ: i.threshold,
                  สถานะ: i.stock === 0 ? 'หมดสต็อก' : 'ใกล้หมด',
                }))
              )
            }
            disabled={attentionItems.length === 0}
            className="no-print flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
        {attentionItems.length === 0 ? (
          <EmptyState text="ไม่มีสินค้าใกล้หมดหรือหมดสต็อกตอนนี้" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="py-3 font-medium">ชื่อสินค้า</th>
                <th className="py-3 font-medium">คงเหลือ</th>
                <th className="py-3 font-medium">เกณฑ์ขั้นต่ำ</th>
                <th className="py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {attentionItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 text-gray-600">{item.stock}</td>
                  <td className="py-3 text-gray-600">{item.threshold}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        item.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.stock === 0 ? 'หมดสต็อก' : 'ใกล้หมด'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProfitTab({ period, onPeriodChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // pattern เดียวกับ SalesTab — ไม่เคลียร์ data ก่อน fetch ใหม่ กันหน้าจอกระพริบว่างเปล่าตอนสลับช่วงเวลา
    getProfitReport(period)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError('โหลดรายงานผลประกอบการไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;
  if (loading || !data) return <EmptyState text="กำลังโหลดข้อมูล..." />;

  const hasRevenue = data.summary.totalRevenue > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          icon={<Wallet size={22} />}
          label="รายรับ"
          value={money(data.summary.totalRevenue)}
          trend={data.trend.revenue}
          caption={
            data.trend.revenue &&
            `${data.trend.revenue.delta >= 0 ? '+' : '-'}${money(Math.abs(data.trend.revenue.delta))} จากช่วงก่อนหน้า`
          }
        />
        <StatCard
          icon={<Coins size={22} />}
          label="ต้นทุน"
          value={money(data.summary.totalCost)}
          trend={data.trend.cost}
          caption={
            data.trend.cost && `${data.trend.cost.delta >= 0 ? '+' : '-'}${money(Math.abs(data.trend.cost.delta))} จากช่วงก่อนหน้า`
          }
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="กำไรขั้นต้น"
          value={money(data.summary.grossProfit)}
          tone={data.summary.grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}
          trend={data.trend.profit}
          caption={
            data.trend.profit && `${data.trend.profit.delta >= 0 ? '+' : '-'}${money(Math.abs(data.trend.profit.delta))} จากช่วงก่อนหน้า`
          }
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="กำไรสุทธิ"
          value={money(data.summary.netProfit)}
          tone={data.summary.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">รายรับ vs ต้นทุนตามช่วงเวลา</h2>
            <PeriodToggle period={period} onChange={onPeriodChange} />
          </div>
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
                <Bar dataKey="revenue" name="รายรับ" fill={CHART_COLORS.sales} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="cost" name="ต้นทุน" fill={CHART_COLORS.cost} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="ยังไม่มีข้อมูลรายรับในช่วงเวลานี้" />
          )}
        </div>

        <div className="break-inside-avoid rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">สัดส่วนต้นทุน vs กำไร</h2>
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  <Cell fill={CHART_COLORS.cost} />
                  <Cell fill={CHART_COLORS.profit} />
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="ยังไม่มีข้อมูล" />
          )}
        </div>
      </div>
    </div>
  );
}

function Report() {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('monthly');

  const currentTab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="-m-6 min-h-screen bg-background p-10 print:m-0 print:bg-white print:p-0">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report</h1>
          <p className="mt-1 text-sm text-gray-500">{currentTab?.subtitle}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-gray-900 shadow-sm hover:brightness-95"
        >
          <Printer size={18} />
          Export PDF
        </button>
      </div>

      <div className="mb-8 no-print">
        <div className="flex w-fit gap-2 rounded-full bg-other p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-primary text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* หัวข้อสำหรับตอนพิมพ์ — บอกว่ากำลังดูรายงานไหน ช่วงเวลาไหน เพราะ tab ถูกซ่อนไปหมด (.no-print) */}
      <h2 className="mb-6 hidden text-xl font-bold text-gray-900 print:block">
        รายงาน{currentTab?.label}
        {activeTab !== 'inventory' && ` (${PERIODS.find((p) => p.key === period)?.label})`}
      </h2>

      {activeTab === 'sales' && <SalesTab period={period} onPeriodChange={setPeriod} />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'profit' && <ProfitTab period={period} onPeriodChange={setPeriod} />}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export default Report;

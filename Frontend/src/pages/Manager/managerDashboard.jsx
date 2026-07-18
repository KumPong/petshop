import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Clock, Star, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getInventory } from '../../services/inventory.service';
import { getOrders } from '../../services/order.service';

// ---- helpers ----
function formatBaht(num) {
    return '฿' + num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getStockStatus(item) {
    if (item.stock === 0) return { label: 'หมดสต็อก', color: 'text-red-500', bg: 'bg-red-100' };
    if (item.stock <= item.threshold) return { label: `สต็อกต่ำ: เหลือ ${item.stock}`, color: 'text-amber-600', bg: 'bg-amber-100' };
    return null;
}

const CATEGORY_COLORS = ['#5c6b3a', '#a3b17a', '#d4c9a8', '#8b9d58', '#c4b89a'];

// ---- sub-components ----
function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div className="bg-other rounded-2xl p-5 flex flex-col gap-2 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                {accent && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent.cls}`}>
                        {accent.text}
                    </span>
                )}
            </div>
            <div className="flex items-end gap-3">
                <div className="p-2 rounded-xl bg-[#f0f2ea]">{icon}</div>
                <span className="text-2xl font-bold text-gray-800">{value}</span>
            </div>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-other border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
                <p className="text-gray-700">{label}</p>
                <p className="font-semibold text-[#5c6b3a]">{formatBaht(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

// ---- main component ----
function ManagerDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getOrders(), getInventory()])
            .then(([ord, inv]) => {
                setOrders(ord);
                setInventory(inv);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ---- derived data ----
    const totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    // นับแบบเดียวกับ "ออเดอร์ที่ต้องดำเนินการ" ใน orderManage.jsx — ทุกสถานะที่ไม่ใช่ Delivered/Cancelled
    // (เดิมเช็คแค่ ['Confirmed','Processing','Picking'] ซึ่ง 'Picking' ไม่ใช่สถานะจริงและขาด Packed/Shipped ไปเลย)
    const pendingOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));

    // product sales aggregation
    const salesMap = {};
    orders.forEach(o => {
        (o.items || []).forEach(item => {
            if (!salesMap[item.productId]) {
                salesMap[item.productId] = { productId: item.productId, name: item.name, sold: 0, revenue: 0, category: '' };
            }
            salesMap[item.productId].sold += item.quantity;
            salesMap[item.productId].revenue += item.subTotal;
        });
    });
    const sortedProducts = Object.values(salesMap).sort((a, b) => b.sold - a.sold);
    const bestSeller = sortedProducts[0];

    // low stock
    const lowStockItems = inventory.filter(i => i.stock <= i.threshold);

    // sales chart – last 30 days
    const now = new Date();
    const chartData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const revenue = orders
            .filter(o => o.orderDate && o.orderDate.slice(0, 10) === key)
            .reduce((s, o) => s + o.totalAmount, 0);
        return { label, revenue };
    });

    // avg wait time (hours) for pending orders
    const avgWait = pendingOrders.length
        ? (pendingOrders.reduce((s, o) => {
            const diff = (now - new Date(o.orderDate)) / 3600000;
            return s + diff;
        }, 0) / pendingOrders.length).toFixed(1)
        : 0;

    // category aggregation
    const catMap = {};
    orders.forEach(o => {
        (o.items || []).forEach(item => {
            const inv = inventory.find(i => i.productId === item.productId);
            const cat = inv?.category || 'อื่นๆ';
            catMap[cat] = (catMap[cat] || 0) + item.subTotal;
        });
    });
    const totalCatRev = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    const categoryData = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, val]) => ({ name, value: Math.round((val / totalCatRev) * 100) }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                กำลังโหลดข้อมูล...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">ภาพรวมธุรกิจ</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<TrendingUp size={20} className="text-[#5c6b3a]" />}
                    label="ยอดขายรวม (Total Sales)"
                    value={formatBaht(totalSales)}
                    accent={{ text: '+12.5%', cls: 'bg-green-100 text-green-700' }}
                />
                <StatCard
                    icon={<Clock size={20} className="text-amber-500" />}
                    label="คำสั่งซื้อรอจัดส่ง (Pending)"
                    value={`${pendingOrders.length} รายการ`}
                    sub={`เวลารอเฉลี่ย: ${avgWait} ชั่วโมง`}
                    accent={{ text: `${pendingOrders.length} เร่งด่วน`, cls: 'bg-amber-100 text-amber-700' }}
                />
                <StatCard
                    icon={<Star size={20} className="text-[#5c6b3a]" />}
                    label="สินค้าขายดี (Best Sellers)"
                    value={bestSeller?.name?.split(':')[0] || '-'}
                    sub={`หมวดอันดับ 1: ${sortedProducts[0] ? (inventory.find(i => i.productId === sortedProducts[0].productId)?.category || '-') : '-'}`}
                />
                <StatCard
                    icon={<AlertTriangle size={20} className="text-red-500" />}
                    label="สต็อกใกล้หมด (Low Stock)"
                    value={`${lowStockItems.length} รายการ`}
                    sub={`${lowStockItems.filter(i => i.stock === 0).length} รายการหมดสต็อกวันนี้`}
                    accent={lowStockItems.length > 0 ? { text: 'วิกฤต', cls: 'bg-red-100 text-red-600' } : undefined}
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sales Revenue */}
                <div className="lg:col-span-2 bg-other rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-700">ยอดขาย</h2>
                        <span className="text-xs text-gray-400">30 วันล่าสุด</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5c6b3a" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#5c6b3a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                interval={4}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#5c6b3a"
                                strokeWidth={2}
                                fill="url(#revenueGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Categories */}
                <div className="bg-other rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-700 mb-4">หมวดหมู่ยอดนิยม</h2>
                    {categoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        dataKey="value"
                                        paddingAngle={3}
                                    >
                                        {categoryData.map((_, idx) => (
                                            <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block w-2.5 h-2.5 rounded-full"
                                                style={{ background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                                            />
                                            <span className="text-gray-600">{cat.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-700">{cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 text-center mt-10">ยังไม่มีข้อมูล</p>
                    )}
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Best Selling Products */}
                <div className="bg-other rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-700">สินค้าขายดี</h2>       
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-600 text-xs uppercase border-b border-gray-100">
                                <th className="text-left pb-2">ชื่อสินค้า</th>
                                <th className="text-left pb-2">หมวดหมู่</th>
                                <th className="text-right pb-2">ขายได้</th>
                                <th className="text-right pb-2">รายได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.slice(0, 5).map((p, idx) => {
                                const inv = inventory.find(i => i.productId === p.productId);
                                return (
                                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                                        <td className="py-2 font-medium text-gray-700 truncate max-w-35">
                                            {p.name.split(':')[0]}
                                        </td>
                                        <td className="py-2">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-[#f0f2ea] text-black/60">
                                                {inv?.category || '-'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-right text-gray-600">{p.sold}</td>
                                        <td className="py-2 text-right text-gray-700 font-medium">
                                            {formatBaht(p.revenue)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-400 text-xs">ยังไม่มีข้อมูล</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Critical Stock Levels */}
                <div className="bg-other rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-700 mb-4">สินค้าสต็อกวิกฤต</h2>
                    <div className="space-y-3">
                        {lowStockItems.slice(0, 5).map((item, idx) => {
                            const status = getStockStatus(item);
                            return (
                                <div key={idx} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg shrink-0 object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg bg-[#f0f2ea] flex items-center justify-center shrink-0">
                                                <ShoppingCart size={16} className="text-[#5c6b3a]" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                {item.name.split(':')[0]}
                                            </p>
                                            {status && (
                                                <span className={`text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/manager/suppliers')}
                                        className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-[#5c6b3a] text-white rounded-lg hover:bg-[#4a5630] transition-colors whitespace-nowrap"
                                    >
                                        สั่งซื้อเพิ่ม
                                    </button>
                                </div>
                            );
                        })}
                        {lowStockItems.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">สต็อกทุกรายการอยู่ในระดับปกติ</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingBag, TrendingUp, Eye, ChevronRight } from 'lucide-react';
import { getOrders } from '../../services/order.service';
import { getInventory } from '../../services/inventory.service';

// ---- helpers ----
const STATUS_STYLE = {
    Confirmed:  'bg-blue-100 text-blue-700',
    Processing: 'bg-amber-100 text-amber-700',
    Picking:    'bg-purple-100 text-purple-700',
    Shipped:    'bg-green-100 text-green-700',
    Delivered:  'bg-emerald-100 text-emerald-700',
    Pending:    'bg-gray-100 text-gray-600',
    Flagged:    'bg-red-100 text-red-600',
};

function StatusBadge({ status }) {
    const cls = STATUS_STYLE[status] || 'bg-gray-100 text-gray-600';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function formatBaht(n) {
    return '฿' + Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStockStatus(item) {
    if (item.stock === 0) return { label: 'หมดสต็อก', color: 'text-red-500' };
    if (item.stock <= item.threshold) return { label: `เหลือ ${item.stock} ชิ้น`, color: 'text-amber-600' };
    return null;
}

// ---- stat card ----
function StatCard({ icon, label, value, sub, subColor, accent }) {
    return (
        <div className="bg-other rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
                <p className="text-sm text-gray-600 font-medium leading-tight max-w-30">{label}</p>
                <div className="p-2 rounded-xl bg-white/60">{icon}</div>
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                {sub && <p className={`text-xs mt-1 flex items-center gap-1 ${subColor || 'text-gray-500'}`}>{sub}</p>}
            </div>
            {accent && (
                <span className={`absolute top-3 right-12 text-xs font-semibold px-2 py-0.5 rounded-full ${accent.cls}`}>
                    {accent.text}
                </span>
            )}
        </div>
    );
}

// ---- main ----
export default function StaffDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getOrders(), getInventory()])
            .then(([ord, inv]) => { setOrders(ord); setInventory(inv); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ---- derived ----
    const toProcess = orders.filter(o => ['Confirmed', 'Processing', 'Picking'].includes(o.status));
    const lowStock   = inventory.filter(i => i.stock <= i.threshold);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.orderDate?.slice(0, 10) === todayStr);
    const revenueToday = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const completedToday = orders.filter(
        o => o.statusHistory?.some(h => h.status === 'Delivered' && h.at?.slice(0, 10) === todayStr)
    );

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);

    const criticalStock = [...lowStock]
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">หน้าหลักพนักงาน</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Package size={20} className="text-[#5c6b3a]" />}
                    label="ออเดอร์รอดำเนินการ"
                    value={toProcess.length}
                    sub={`+${todayOrders.length} รายการใหม่วันนี้`}
                    subColor="text-green-600"
                />
                <StatCard
                    icon={<AlertTriangle size={20} className="text-amber-500" />}
                    label="สินค้าสต็อกต่ำ"
                    value={lowStock.length}
                    sub="⚠ ต้องดำเนินการ"
                    subColor="text-amber-600"
                />
                <StatCard
                    icon={<ShoppingBag size={20} className="text-[#5c6b3a]" />}
                    label="จัดส่งสำเร็จวันนี้"
                    value={completedToday.length}
                    sub="สัปดาห์นี้"
                    subColor="text-gray-500"
                />
                <StatCard
                    icon={<TrendingUp size={20} className="text-[#5c6b3a]" />}
                    label="ยอดขายวันนี้"
                    value={formatBaht(revenueToday)}
                    sub={`เป้าหมาย: ฿5,000`}
                    subColor="text-gray-500"
                />
            </div>

            {/* ORDER label */}
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">ออเดอร์</p>

            {/* Orders + Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-other rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-700">ออเดอร์ล่าสุด</h2>
                        <button
                            onClick={() => navigate('/staff/orders')}
                            className="text-xs text-[#5c6b3a] hover:underline flex items-center gap-0.5"
                        >
                            ดูทั้งหมด <ChevronRight size={14} />
                        </button>
                    </div>
                    <table className="w-full text-sm bg-background">
                        <thead>
                            <tr className="text-xs text-gray-700 uppercase border-b border-gray-200">
                                <th className="text-left px-5 py-3 font-medium">เลขออเดอร์</th>
                                <th className="text-left px-4 py-3 font-medium">ชื่อลูกค้า</th>
                                <th className="text-left px-4 py-3 font-medium">สถานะ</th>
                                <th className="text-right px-4 py-3 font-medium">ยอดรวม</th>
                                <th className="text-center px-4 py-3 font-medium">ดูรายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 text-xs">ยังไม่มีออเดอร์</td>
                                </tr>
                            ) : recentOrders.map(order => (
                                <tr key={order.orderId} className="border-b border-gray-200 last:border-0 hover:bg-other transition-colors">
                                    <td className="px-5 py-3 font-mono text-xs text-gray-600">#{order.orderId}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {order.shippingAddress?.fullName || 'ลูกค้าทั่วไป'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                                        {formatBaht(order.totalAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => navigate(`/staff/orders/${order.orderId}`)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#5c6b3a] hover:bg-[#f0f2ea] transition-colors"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Stock Alerts */}
                <div className="bg-other rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-700">แจ้งเตือนสต็อก</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {criticalStock.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-8">สต็อกทุกรายการปกติ</p>
                        ) : criticalStock.map(item => {
                            const status = getStockStatus(item);
                            return (
                                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg shrink-0 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-[#f0f2ea] shrink-0 flex items-center justify-center text-lg">
                                            🐾
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {item.name.split(':')[0]}
                                        </p>
                                        {status && (
                                            <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate('/staff/inventory')}
                                        className="shrink-0 text-xs font-semibold text-[#5c6b3a] hover:underline"
                                    >
                                        เติมสต็อก
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-5 py-4">
                        <button
                            onClick={() => navigate('/staff/inventory')}
                            className="w-full py-2 bg-[#f0f2ea] text-[#5c6b3a] text-sm font-semibold rounded-xl hover:bg-[#e3e8d6] transition-colors"
                        >
                            จัดการคลังสินค้า
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

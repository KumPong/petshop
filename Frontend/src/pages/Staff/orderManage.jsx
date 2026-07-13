// Frontend/src/pages/Staff/orderManage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  PackageCheck,
  Flag as FlagIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
} from 'lucide-react';
import { getOrders } from '../../services/order.service.js';

// สถานะที่จบ lifecycle แล้ว (terminal) — แก้ไขสถานะต่อไม่ได้อีกตามตรรกะธุรกิจ กดเข้าไปได้แค่ดูอย่างเดียว
const TERMINAL_STATUSES = ['Delivered', 'Cancelled'];

const FILTERS = ['ทั้งหมด', 'รอตรวจสอบ', 'กำลังเตรียม', 'กำลังจัดส่ง', 'ส่งถึงแล้ว'];

// ครบทุกสถานะที่เป็นไปได้ตาม flow ของหน้า detail (orderVerify.jsx) — ต้องตรงกันเป๊ะๆ ไม่งั้น pill จะว่างเปล่า
const STATUS_LABELS = {
  Confirmed: 'รอตรวจสอบ',
  Processing: 'กำลังเตรียม',
  Packed: 'แพ็คเสร็จแล้ว',
  Shipped: 'จัดส่งแล้ว',
  Delivered: 'ส่งถึงแล้ว',
  Flagged: 'พบปัญหา',
  Cancelled: 'ยกเลิกแล้ว',
};

const STATUS_PILL = {
  Confirmed: 'bg-orange-100 text-orange-700',
  Processing: 'bg-lime-100 text-lime-800',
  Packed: 'bg-teal-100 text-teal-700',
  Shipped: 'bg-yellow-100 text-yellow-800',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Flagged: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-200 text-gray-600',
};

const PAGE_SIZE = 10;

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50" (ใช้ pattern เดียวกับ restockOrder.jsx)
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-2xl bg-other p-6">
      <div className="mb-6 text-gray-700">{icon}</div>
      <p className="text-sm font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/60 text-xs font-semibold text-gray-700">
      {initials}
    </span>
  );
}

function OrderManage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);

  // โหลดออเดอร์จาก backend ตอนเปิดหน้า — cancelled กัน setState หลัง component ถูก unmount ไปแล้ว
  useEffect(() => {
    let cancelled = false;

    const loadOrders = () => {
      getOrders()
        .then((data) => {
          if (!cancelled) setOrders(data);
        })
        .catch(() => {
          if (!cancelled) setError('โหลดข้อมูลออเดอร์ไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    loadOrders();
    // รีเฟรชอัตโนมัติทุกครั้งที่กลับมาโฟกัสหน้านี้ กันข้อมูลค้างเก่า (pattern เดียวกับ inventory.jsx)
    window.addEventListener('focus', loadOrders);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', loadOrders);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'รอตรวจสอบ') return orders.filter((o) => o.status === 'Confirmed');
    if (activeFilter === 'กำลังเตรียม') return orders.filter((o) => o.status === 'Processing');
    if (activeFilter === 'กำลังจัดส่ง') return orders.filter((o) => o.status === 'Shipped');
    if (activeFilter === 'ส่งถึงแล้ว') return orders.filter((o) => o.status === 'Delivered');
    return orders;
  }, [orders, activeFilter]);

  const sortedOrders = useMemo(() => {
    const arr = [...filteredOrders];
    arr.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.orderDate) - new Date(a.orderDate)
        : new Date(a.orderDate) - new Date(b.orderDate)
    );
    return arr;
  }, [filteredOrders, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = sortedOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // สถิติจากข้อมูลจริงที่ดึงมา — ไม่ใช้เลข mock ลอยๆ (ตัดการ์ด "คืนสินค้า" ออกเพราะระบบนี้ไม่มี flow คืนสินค้าเลย
  // แทนที่ด้วย "ออเดอร์ที่มีปัญหา" ซึ่งเป็นข้อมูลจริงจากฟีเจอร์ "แจ้งปัญหา" ที่มีอยู่แล้ว)
  const activeCount = orders.filter((o) => !TERMINAL_STATUSES.includes(o.status)).length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const flaggedCount = orders.filter((o) => o.status === 'Flagged').length;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
      <p className="mt-2 text-gray-500">ภาพรวมคำสั่งซื้อและสถานะการจัดส่งแบบเรียลไทม์</p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard icon={<ClipboardList size={20} />} value={activeCount} label="ออเดอร์ที่ต้องดำเนินการ" />
        <StatCard icon={<PackageCheck size={20} />} value={shippedCount} label="อยู่ระหว่างจัดส่ง" />
        <StatCard icon={<FlagIcon size={20} />} value={flaggedCount} label="ออเดอร์ที่มีปัญหา" />
      </div>

      <div className="mt-6 rounded-2xl bg-other shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-primary text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>เรียงตาม:</span>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              <option value="newest">ล่าสุดก่อน</option>
              <option value="oldest">เก่าสุดก่อน</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">กำลังโหลดข้อมูลออเดอร์...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-700">
                  <th className="px-6 py-3">เลขที่ออเดอร์</th>
                  <th className="px-6 py-3">ชื่อลูกค้า</th>
                  <th className="px-6 py-3">วันที่ & เวลา</th>
                  <th className="px-6 py-3">ยอดรวม</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((o) => (
                  <tr key={o.orderId} className="border-t border-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">#{o.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={o.shippingAddress?.fullName || '-'} />
                        <span className="text-gray-900">{o.shippingAddress?.fullName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(o.orderDate)}
                      <div className="text-xs text-gray-400">{formatTime(o.orderDate)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{money(o.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[o.status]}`}>
                        • {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/staff/orders/${o.orderId}`)}
                        className="text-gray-400 hover:text-gray-700"
                        title={TERMINAL_STATUSES.includes(o.status) ? 'ดูรายละเอียด' : 'จัดการออเดอร์'}
                      >
                        {TERMINAL_STATUSES.includes(o.status) ? <Eye size={16} /> : <Pencil size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {pagedOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      ไม่มีออเดอร์ในหมวดนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-6 text-sm text-gray-500">
              <span>แสดง {sortedOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, sortedOrders.length)} จาก {sortedOrders.length} รายการ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded p-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`rounded-md px-3 py-1 font-medium ${
                      n === currentPage ? 'bg-primary text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded p-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderManage;

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Package, MapPin, Truck, CircleCheck, Clock, Copy, ListOrdered, Image as ImageIcon, Home } from 'lucide-react';
import { getOrder, getOrders } from '../../services/order.service.js';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatDateTH(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateTimeTH(iso) {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${formatDateTH(iso)} · ${time}`;
}

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50"
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TIMELINE_ICON = { done: CircleCheck, current: Truck, pending: Clock };

function Tracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // มี orderId ใน URL -> ดึงออเดอร์นั้นตรงๆ, ไม่มี (เช่นจากลิงก์ "ติดตามสินค้า" ใน navbar) -> โชว์ออเดอร์ล่าสุดของตัวเอง
  // (ต้อง login เพราะ backend เช็ค customerId จาก token — ไม่มี token เรียก getOrders() ไม่ได้เลย เช็คตัดไว้ก่อนกันขึ้น error ทั่วไป)
  useEffect(() => {
    let cancelled = false;

    if (!orderId && !localStorage.getItem('token')) {
      setError('กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อล่าสุดของคุณ');
      setLoading(false);
      return;
    }

    const load = orderId
      ? getOrder(orderId)
      : getOrders().then((orders) => {
          if (orders.length === 0) throw new Error('no orders');
          return orders[0];
        });

    load
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setError('ไม่พบคำสั่งซื้อที่จะติดตาม');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const copyTracking = () => {
    navigator.clipboard.writeText(order.shipping.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="-m-6 flex min-h-screen items-center justify-center bg-background p-10 text-gray-400">
        กำลังโหลดข้อมูลการจัดส่ง...
      </div>
    );
  }

  if (error || !order) {
    const needsLogin = !orderId && !localStorage.getItem('token');
    return (
      <div className="-m-6 flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-10">
        <p className="text-gray-500">{error || 'ไม่พบคำสั่งซื้อที่จะติดตาม'}</p>
        {needsLogin ? (
          <Link to="/login" className="text-sm font-medium text-green-700 hover:underline">
            เข้าสู่ระบบ
          </Link>
        ) : (
          <Link to="/" className="text-sm font-medium text-green-700 hover:underline">
            กลับสู่หน้าหลัก
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-background p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-3xl font-bold text-gray-900">ติดตามสถานะคำสั่งซื้อ</h1>
        <p className="mb-8 text-gray-500">Track Your Order Status</p>

        <div className="mb-6 flex items-center justify-between rounded-2xl bg-other px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order Details</p>
            <p className="text-lg font-bold text-gray-900">Order ID #{order.orderNo}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-gray-900">
            <Truck size={16} />
            {order.shipping.statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-2xl bg-other p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">ไทม์ไลน์การจัดส่ง</h2>
            <div className="space-y-0">
              {order.shipping.timeline.map((step, i) => {
                const Icon = TIMELINE_ICON[step.status];
                const isLast = i === order.shipping.timeline.length - 1;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          step.status === 'pending'
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-primary text-gray-900'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      {!isLast && <div className="my-1 h-full w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
                      <p className="font-medium text-gray-900">{step.label}</p>
                      <p className="text-xs text-gray-500">
                        {step.status === 'pending' ? 'รอดำเนินการ' : formatDateTimeTH(step.timestamp)}
                      </p>
                      {step.status === 'current' && order.shipping.trackingNumber && (
                        <div className="mt-2 flex w-fit items-center gap-2 rounded-lg bg-other px-3 py-2 text-sm font-medium text-gray-800">
                          {order.shipping.trackingNumber}
                          <button onClick={copyTracking} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                            <Copy size={12} />
                            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-other p-5">
              <div className="mb-3 flex items-start gap-3">
                <Calendar size={18} className="mt-0.5 text-gray-700" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateTH(order.shipping.estimatedDeliveryStart)} - {formatDateTH(order.shipping.estimatedDeliveryEnd)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={18} className="mt-0.5 text-gray-700" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Carrier</p>
                  <p className="font-semibold text-gray-900">{order.shipping.carrier}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-other p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                <MapPin size={16} />
                ที่อยู่จัดส่ง
              </h3>
              <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-500">
                {order.shippingAddress.city} {order.shippingAddress.postalCode}
              </p>
            </div>

            <div className="rounded-2xl bg-other p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                <ListOrdered size={16} />
                รายการสินค้า
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="flex items-center gap-3 text-sm">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                        <ImageIcon size={16} />
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">จำนวน {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-gray-900">
                <span>ยอดรวมสุทธิ</span>
                <span>{money(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Home size={16} />
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Tracking;

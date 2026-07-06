import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Heart, PawPrint, Truck, Mail } from 'lucide-react';
import { getOrder } from '../../services/order.service.js';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatDateTH(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50"
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Confirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงออเดอร์จริงจาก backend ด้วยเลขที่ออเดอร์ใน URL แทนที่จะพึ่ง state ที่ส่งมาตอน navigate
  // เพื่อให้หน้านี้ refresh แล้วยังใช้งานได้ (ไม่หายไปพร้อม in-memory state)
  useEffect(() => {
    let cancelled = false;
    getOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setError('ไม่พบคำสั่งซื้อนี้');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="-m-6 flex min-h-screen items-center justify-center bg-background p-10 text-gray-400">
        กำลังโหลดคำสั่งซื้อ...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="-m-6 flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-10">
        <p className="text-gray-500">{error || 'ไม่พบคำสั่งซื้อนี้'}</p>
        <Link to="/" className="text-sm font-medium text-green-700 hover:underline">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-6 flex min-h-screen items-center justify-center bg-background p-10">
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-full bg-primary/30">
          <CheckCircle2 className="text-gray-800" size={64} />
          <Heart className="absolute -left-2 bottom-2 text-primary" size={20} />
          <PawPrint className="absolute -right-1 -top-1 text-gray-700" size={24} />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">ขอบคุณสำหรับการสั่งซื้อ!</h1>
        <p className="mb-8 text-gray-500">
          เราได้รับคำสั่งซื้อของคุณแล้ว และกำลังเตรียมจัดส่งสินค้าอย่างทะนุถนอม
        </p>

        <div className="mb-4 rounded-2xl bg-white p-6 text-left shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Order ID</p>
              <p className="font-semibold text-gray-900">#{order.orderNo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">วันที่สั่งซื้อ</p>
              <p className="font-semibold text-gray-900">{formatDateTH(order.orderDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">ยอดรวมสุทธิ</p>
              <p className="font-semibold text-gray-900">{money(order.totalAmount)}</p>
            </div>
          </div>

          <div className="my-4 h-px bg-gray-100" />

          <div className="flex items-center gap-3 rounded-xl bg-other px-4 py-3 text-sm">
            <Truck size={18} className="shrink-0 text-gray-700" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">วันจัดส่งโดยประมาณ</p>
              <p className="font-semibold text-gray-900">
                {formatDateTH(order.shipping.estimatedDeliveryStart)} - {formatDateTH(order.shipping.estimatedDeliveryEnd)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Mail size={14} />
            เราได้ส่งรายละเอียดคำสั่งซื้อไปยังอีเมลของคุณแล้ว
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(`/tracking/${order.orderId}`)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-gray-900 shadow-sm hover:brightness-95"
          >
            <Truck size={16} />
            ติดตามสถานะคำสั่งซื้อ
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;

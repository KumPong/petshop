import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Flag, FileText, PackageCheck, Truck, CheckCircle2, Circle, XCircle, X } from 'lucide-react';
import { getOrder, updateOrderStatus } from '../../services/order.service.js';

// ลำดับสถานะปกติของออเดอร์ (ไม่รวม Cancelled/Flagged ซึ่งเป็น exception แทรกได้ทุกจุด)
const STATUS_FLOW = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

// action หลักของแต่ละสถานะ — ปุ่มเดียวพาไปสถานะถัดไปเสมอ ไม่มีช่องให้พิมพ์ tracking/สถานะเองมั่วๆ
// เลขพัสดุมีอยู่แล้วตั้งแต่ตอน checkout (shipping.trackingNumber) ไม่ต้อง gen ใหม่ตอนแพ็ค
const STATUS_ACTION = {
  Confirmed: { label: 'ยืนยันความถูกต้อง', next: 'Processing', Icon: ShieldCheck },
  Processing: { label: 'แพ็คเสร็จแล้ว', next: 'Packed', Icon: PackageCheck },
  Packed: { label: 'ส่งมอบให้ขนส่งแล้ว', next: 'Shipped', Icon: Truck },
  Shipped: { label: 'จัดส่งสำเร็จแล้ว', next: 'Delivered', Icon: CheckCircle2 },
};

const TIMELINE_LABELS = {
  Confirmed: 'ยืนยันการชำระเงิน',
  Processing: 'กำลังแพ็คสินค้า',
  Packed: 'แพ็คเสร็จ / พร้อมส่ง',
  Shipped: 'ส่งมอบให้ขนส่งแล้ว',
  Delivered: 'จัดส่งสำเร็จ',
};

// ป้ายสถานะภาษาไทยที่โชว์ในหน้า (แยกจาก key ภายในที่ยังใช้ภาษาอังกฤษ เพื่อให้ตรงกับ backend/order.json)
const STATUS_LABEL_TH = {
  Confirmed: 'ยืนยันแล้ว',
  Processing: 'กำลังเตรียม',
  Packed: 'แพ็คเสร็จแล้ว',
  Shipped: 'กำลังจัดส่ง',
  Delivered: 'ส่งถึงแล้ว',
  Flagged: 'พบปัญหา',
  Cancelled: 'ยกเลิกแล้ว',
};

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50" (ใช้ pattern เดียวกับ restockOrder.jsx)
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function OrderVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  // โหลดออเดอร์จาก backend ตาม :id — cancelled กัน setState หลัง component ถูก unmount ไปแล้ว
  useEffect(() => {
    let cancelled = false;
    getOrder(id)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setNotes(data.courierNotes || '');
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
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-400">กำลังโหลดข้อมูลออเดอร์...</div>;
  if (error || !order) return <div className="p-10 text-center text-red-500">{error || 'ไม่พบคำสั่งซื้อนี้'}</div>;

  const subtotal = order.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const isTerminal = order.status === 'Delivered' || order.status === 'Cancelled';
  const action = STATUS_ACTION[order.status];
  // Flagged ไม่ได้อยู่ใน STATUS_FLOW เลยต้องอิง statusBeforeFlag แทน ไม่งั้น timeline จะโชว์ว่ายังไม่ทำอะไรเลยทั้งที่จริงๆ ทำมาถึงขั้นไหนแล้วก็ตาม
  const effectiveStatus = order.status === 'Flagged' ? order.statusBeforeFlag || order.status : order.status;
  const currentStepIndex = STATUS_FLOW.indexOf(effectiveStatus);

  const togglePicked = (itemId) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.orderItemId === itemId ? { ...it, picked: !it.picked } : it)),
    }));
  };

  const handlePrimaryAction = async () => {
    if (!action || saving) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order.orderId, {
        status: action.next,
        courierNotes: notes,
        pickedItems: order.items.filter((it) => it.picked).map((it) => it.orderItemId),
      });
      setOrder(updated);
    } catch {
      alert('อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const confirmFlag = async () => {
    if (!flagReasonInput.trim() || saving) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order.orderId, { status: 'Flagged', flagReason: flagReasonInput.trim() });
      setOrder(updated);
      setShowFlagModal(false);
      setFlagReasonInput('');
    } catch {
      alert('แจ้งปัญหาไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handleClearFlag = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order.orderId, { status: order.statusBeforeFlag || 'Processing' });
      setOrder(updated);
    } catch {
      alert('เคลียร์ปัญหาไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/staff/orders')} className="text-sm text-gray-500 hover:text-gray-700">
          คำสั่งซื้อ
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900">ออเดอร์ #{order.orderNo}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{STATUS_LABEL_TH[order.status]}</span>
      </div>

      {order.status === 'Flagged' && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Flag size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">ออเดอร์นี้ถูกแจ้งปัญหาไว้</p>
            <p className="text-red-600">{order.flagReason}</p>
          </div>
          <button
            onClick={handleClearFlag}
            disabled={saving}
            className="ml-auto shrink-0 rounded-lg bg-white px-3 py-1 font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            เคลียร์ปัญหาแล้ว
          </button>
        </div>
      )}

      {order.status === 'Cancelled' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <XCircle size={16} /> ออเดอร์นี้ถูกยกเลิกแล้ว
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* ฝั่งซ้าย */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-other p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">สรุปคำสั่งซื้อ (ORDER SUMMARY)</p>
                <h2 className="text-2xl font-bold text-gray-900">{order.shippingAddress?.fullName || '-'}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-green-700">ชำระเงินสำเร็จ</span>
                <p className="text-xs text-gray-500">วันที่: {formatDate(order.orderDate)}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">เบอร์โทรศัพท์</p>
                <p className="font-medium text-gray-900">{order.shippingAddress?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">ที่อยู่จัดส่ง</p>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
                </p>
              </div>
              <div>
                <p className="text-gray-500">ยอดรวม</p>
                <p className="text-lg font-bold text-gray-900">{money(order.totalAmount)}</p>
              </div>
            </div>
            {order.shipping?.trackingNumber && (
              <div className="mt-4 rounded-lg bg-white/70 px-4 py-2 text-sm">
                <span className="text-gray-500">เลขพัสดุ: </span>
                <span className="font-semibold text-gray-900">{order.shipping.trackingNumber}</span>
                <span className="text-gray-500"> ({order.shipping.carrier})</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {order.status === 'Confirmed' ? 'รายการตรวจสอบ' : `รายการสินค้า (${order.items.length})`}
              </h3>
              {order.status === 'Processing' && (
                <span className="text-xs text-gray-400">ติ๊กเมื่อหยิบสินค้าครบแล้ว</span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">สินค้า</th>
                  <th className="px-6 py-3">จำนวน</th>
                  <th className="px-6 py-3">ราคา</th>
                  <th className="px-6 py-3 text-right">ยอดรวม</th>
                  {order.status === 'Processing' && <th className="px-6 py-3 text-right">หยิบแล้ว</th>}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.orderItemId} className="border-t border-gray-100">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-gray-700">{money(item.unitPrice)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {money(item.quantity * item.unitPrice)}
                    </td>
                    {order.status === 'Processing' && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => togglePicked(item.orderItemId)}>
                          {item.picked ? (
                            <CheckCircle2 size={20} className="text-primary" />
                          ) : (
                            <Circle size={20} className="text-gray-300" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100">
                  <td colSpan={order.status === 'Processing' ? 4 : 3} className="px-6 py-4 text-right font-semibold text-gray-900">
                    รวมทั้งหมด
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">{money(subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!isTerminal && action && (
            <div className="flex gap-4">
              <button
                onClick={handlePrimaryAction}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-gray-900 hover:bg-primary/80 disabled:opacity-50"
              >
                <action.Icon size={18} /> {saving ? 'กำลังบันทึก...' : action.label}
              </button>
              <button
                onClick={() => setShowFlagModal(true)}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-300 px-6 py-4 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Flag size={18} /> พบปัญหา
              </button>
            </div>
          )}
        </div>

        {/* ฝั่งขวา */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">หลักฐานการชำระเงิน</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">ช่องทางชำระเงิน</p>
                <p className="font-semibold text-gray-900">{order.payment?.method}</p>
              </div>
              <div>
                <p className="text-gray-500">เลขอ้างอิง</p>
                <p className="font-semibold text-gray-900">{order.payment?.transactionId}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">ไทม์ไลน์</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-gray-900">สร้างออเดอร์</p>
                  <p className="text-xs text-gray-400">{formatDate(order.orderDate)}</p>
                </div>
              </li>
              {STATUS_FLOW.map((step, idx) => {
                const done = idx < currentStepIndex || (idx === currentStepIndex && isTerminal);
                const current = idx === currentStepIndex && !isTerminal;
                return (
                  <li key={step} className="flex gap-3">
                    {done ? (
                      <CheckCircle2 size={18} className="mt-0.5 text-primary" />
                    ) : (
                      <Circle size={18} className={`mt-0.5 ${current ? 'text-gray-700' : 'text-gray-300'}`} />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${current ? 'text-gray-900' : done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {TIMELINE_LABELS[step]}
                      </p>
                      {current && <p className="text-xs text-gray-400">กำลังดำเนินการ</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {(order.status === 'Processing' || order.courierNotes) && (
            <div className="rounded-2xl bg-other p-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} /> หมายเหตุถึงขนส่ง
              </h3>
              <textarea
                value={order.status === 'Processing' ? notes : order.courierNotes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={order.status !== 'Processing'}
                placeholder="เช่น สินค้าแตกง่าย / ฝากไว้หน้าประตูได้"
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
                rows={4}
              />
            </div>
          )}
        </div>
      </div>

      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-other px-6 py-5">
              <h3 className="text-xl font-semibold text-gray-900">แจ้งปัญหาออเดอร์</h3>
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReasonInput('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ระบุปัญหาที่พบ <span className="text-red-500">*</span>
              </label>
              <textarea
                autoFocus
                value={flagReasonInput}
                onChange={(e) => setFlagReasonInput(e.target.value)}
                placeholder="เช่น สินค้าเสียหาย / ของหมดกลางทาง / ลูกค้าติดต่อไม่ได้"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowFlagModal(false);
                    setFlagReasonInput('');
                  }}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmFlag}
                  disabled={!flagReasonInput.trim() || saving}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Flag size={16} /> ยืนยันแจ้งปัญหา
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderVerify;

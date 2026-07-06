import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, QrCode, Landmark, ShieldCheck, BadgeCheck, MessageCircle, Plus, Minus, Trash2, Image as ImageIcon } from 'lucide-react';
import { createOrder } from '../../services/order.service.js';

// ตะกร้าจำลอง — ยังไม่มี Cart/Context กลางใช้ร่วมกับ navbar.jsx เลยแยกทำงานเดี่ยวๆ ไปก่อน
// (productId อ้างอิงของจริงจาก Backend/data/product.json)
const INITIAL_CART = [
  { productId: 'PD-002', name: 'Oak & Harvest: เนื้อวัวออร์แกนิกและข้าว', price: 950, quantity: 1 },
  { productId: 'PD-005', name: 'Cozy Nap: เบาะนอนสัตว์เลี้ยงไซส์กลาง', price: 750, quantity: 1 },
  { productId: 'PD-003', name: 'Whisker Delight: ทูน่าเนื้อแน่นในเยลลี่', price: 45, quantity: 2 },
];

const SHIPPING_METHODS = [
  { value: 'standard', label: 'จัดส่งมาตรฐาน', detail: '3-5 วันทำการ', cost: 0 },
  { value: 'express', label: 'จัดส่งด่วน', detail: '1-2 วันทำการ', cost: 150 },
];

const PAYMENT_TABS = [
  { value: 'บัตรเครดิต', label: 'บัตรเครดิต/เดบิต', Icon: CreditCard },
  { value: 'พร้อมเพย์', label: 'พร้อมเพย์', Icon: QrCode },
  { value: 'โอนเงินผ่านธนาคาร', label: 'โอนเงินผ่านธนาคาร', Icon: Landmark },
];

const STEPS = ['ตะกร้า', 'จัดส่ง', 'ชำระเงิน', 'ยืนยัน'];

const TAX_RATE = 0.07;

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50"
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Payment() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(INITIAL_CART);
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', postalCode: '', phone: '' });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_TABS[0].value);
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = SHIPPING_METHODS.find((m) => m.value === shippingMethod).cost;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shippingCost + tax;

  // เอาไว้กรองให้เหลือแต่ตัวเลข ใช้กับช่องหมายเลขบัตร/วันหมดอายุ/CVV ที่ห้ามพิมพ์ตัวอักษรปน
  const onlyDigits = (value) => value.replace(/\D/g, '');

  const handleCardNumberChange = (value) => {
    // จำกัด 16 หลัก (เลขบัตรมาตรฐาน) แล้วเว้นวรรคทุก 4 หลักให้อ่านง่าย เช่น "4111 1111 1111 1111"
    const digits = onlyDigits(value).slice(0, 16);
    const formatted = digits.replace(/(.{4})(?=.)/g, '$1 ');
    setCard({ ...card, number: formatted });
  };

  const handleExpiryChange = (value) => {
    // จำกัด 4 หลัก (MM + YY) แล้วแทรก "/" หลังหลักที่ 2 ให้อัตโนมัติ
    const digits = onlyDigits(value).slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCard({ ...card, expiry: formatted });
  };

  const handleCvvChange = (value) => {
    // CVV มีแค่ 3-4 หลัก ไม่ต้องจัดรูปแบบอะไรเพิ่ม แค่กรองตัวอักษรทิ้ง
    setCard({ ...card, cvv: onlyDigits(value).slice(0, 4) });
  };

  const handlePostalCodeChange = (value) => {
    // รหัสไปรษณีย์ไทยมี 5 หลัก
    setAddress({ ...address, postalCode: onlyDigits(value).slice(0, 5) });
  };

  const handlePhoneChange = (value) => {
    // เบอร์มือถือไทยมี 10 หลัก
    setAddress({ ...address, phone: onlyDigits(value).slice(0, 10) });
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // ใช้ทั้งตอนพิมพ์เลขเองและกด +/- — ตั้งเป็น 0 หรือต่ำกว่า = ลบออกจากตะกร้าเลย (ไม่ clamp ไว้ที่ 1)
  const setQty = (productId, rawValue) => {
    const qty = Math.floor(Number(rawValue));
    if (!Number.isFinite(qty) || qty <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item)));
  };

  const changeQty = (productId, delta) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    setQty(productId, item.quantity + delta);
  };

  const addressComplete = Object.values(address).every((v) => v.trim() !== '');
  // ฟิลด์บัตรเก็บไว้แค่ตรวจว่ากรอกครบสำหรับ UX เท่านั้น — ไม่ส่งเลขบัตร/CVV ไปที่ backend เลย (ไม่มี gateway จริง)
  const cardComplete =
    paymentMethod !== PAYMENT_TABS[0].value || Object.values(card).every((v) => v.trim() !== '');
  const canSubmit = addressComplete && cardComplete && cart.length > 0;

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const items = cart.map(({ productId, quantity }) => ({ productId, quantity }));
      const order = await createOrder(items, paymentMethod, address, shippingMethod);
      navigate(`/confirmation/${order.orderId}`);
    } catch {
      setError('ชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  return (
    <div className="-m-6 min-h-screen bg-background p-10">
      {/* Stepper — Cart ถือว่าผ่านมาแล้ว (ไม่มีหน้า Cart จริงในสโคปนี้), หน้านี้คือขั้น Shipping/Payment รวมกัน */}
      <div className="mx-auto mb-10 flex max-w-3xl items-center justify-between">
        {STEPS.map((label, i) => {
          const stepIndex = i + 1;
          const isDone = stepIndex === 1;
          const isCurrent = stepIndex === 2;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isDone
                      ? 'bg-primary text-gray-900'
                      : isCurrent
                      ? 'border-2 border-primary bg-white text-gray-900'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? '✓' : stepIndex}
                </div>
                {i < STEPS.length - 1 && <div className="mx-2 h-px flex-1 bg-gray-200" />}
              </div>
              <span className={`mt-2 text-xs ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Truck size={18} />
              ที่อยู่จัดส่ง
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล
                <input
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="เช่น สมชาย ใจดี"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700">
                ที่อยู่
                <input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                จังหวัด
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="เช่น เชียงใหม่"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                รหัสไปรษณีย์
                <input
                  value={address.postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  inputMode="numeric"
                  placeholder="50200"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
                <input
                  value={address.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  inputMode="numeric"
                  placeholder="08X-XXX-XXXX"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">วิธีจัดส่ง</h2>
            <div className="grid grid-cols-2 gap-4">
              {SHIPPING_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                    shippingMethod === m.value
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={m.value}
                      checked={shippingMethod === m.value}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mr-2 accent-primary"
                    />
                    <span className="font-medium text-gray-900">{m.label}</span>
                    <span className="block pl-5 text-xs text-gray-500">{m.detail}</span>
                  </span>
                  <span className="font-medium text-gray-900">{m.cost === 0 ? 'ฟรี' : money(m.cost)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">วิธีชำระเงิน</h2>
            <div className="mb-4 flex gap-2">
              {PAYMENT_TABS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
                    paymentMethod === value
                      ? 'border-primary bg-primary/20 text-gray-900'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {paymentMethod === PAYMENT_TABS[0].value && (
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700">
                  ชื่อบนบัตร
                  <input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="ชื่อบนบัตร"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-gray-700">
                  หมายเลขบัตร
                  <input
                    value={card.number}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  วันหมดอายุ
                  <input
                    value={card.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="MM/YY"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  CVV
                  <input
                    type="password"
                    value={card.cvv}
                    onChange={(e) => handleCvvChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="***"
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>
            )}

            {paymentMethod === 'พร้อมเพย์' && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 py-8 text-sm text-gray-600">
                <QrCode size={64} className="text-gray-400" />
                สแกน QR พร้อมเพย์เพื่อชำระเงิน (จำลอง)
              </div>
            )}

            {paymentMethod === 'โอนเงินผ่านธนาคาร' && (
              <div className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
                โอนเงินมาที่บัญชี PetStop Co., Ltd. — ธนาคารกสิกรไทย 123-4-56789-0 (จำลอง)
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-other p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-gray-300">
                    <ImageIcon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.productId, -1)}
                        className="rounded-full bg-white p-1 text-gray-500 hover:text-gray-800"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => setQty(item.productId, e.target.value)}
                        className="w-10 rounded-md border border-gray-200 bg-white text-center text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => changeQty(item.productId, 1)}
                        className="rounded-full bg-white p-1 text-gray-500 hover:text-gray-800"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{money(item.price * item.quantity)}</span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="rounded-full p-1 text-gray-400 hover:text-red-500"
                    title="นำออกจากตะกร้า"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-gray-200" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>ยอดรวมสินค้า</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>{shippingCost === 0 ? 'ฟรี' : money(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ภาษี (7%)</span>
                <span>{money(tax)}</span>
              </div>
            </div>

            <div className="my-4 h-px bg-gray-200" />

            <div className="mb-4 flex justify-between text-lg font-bold text-gray-900">
              <span>ยอดรวมทั้งหมด</span>
              <span>{money(total)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!canSubmit || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-gray-900 shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'กำลังดำเนินการ...' : 'สั่งซื้อสินค้า'}
            </button>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} />
                ชำระเงินปลอดภัย
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck size={14} />
                รับประกัน 30 วัน
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-other p-4 text-sm">
            <MessageCircle size={18} className="mt-0.5 shrink-0 text-gray-700" />
            <div>
              <p className="font-semibold text-gray-900">ต้องการความช่วยเหลือ?</p>
              <p className="text-gray-600">ทีมผู้เชี่ยวชาญด้านสัตว์เลี้ยงของเราพร้อมให้บริการทางแชทตลอด 24 ชั่วโมง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

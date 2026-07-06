import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  AlertTriangle,
  ArrowRight,
  Image as ImageIcon,
  CircleCheck,
  Circle,
  X,
  Check,
} from 'lucide-react';
import { getInventory } from '../../services/inventory.service.js';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
} from '../../services/purchaseOrder.service.js';

// สถานะ PO มี 3 แบบ: Pending, Shipped, Received — flow จริงมีแค่ Pending -> Received (ข้าม Shipped เพราะ
// ยังไม่มีระบบแจ้งจัดส่งจริง, เหลือไว้เพราะมีอยู่ในข้อมูลตัวอย่างเท่านั้น)
const PENDING_LABEL = 'รอดำเนินการ';

const STATUS_LABELS = {
  Shipped: 'จัดส่งแล้ว',
  Received: 'ได้รับแล้ว',
  Pending: PENDING_LABEL,
};

// สี + ไอคอนของป้ายสถานะแต่ละแบบ ในตาราง "ใบสั่งซื้อล่าสุด"
const STATUS_PILL = {
  Shipped: { bg: 'bg-primary/40', text: 'text-gray-800', Icon: Circle },
  Received: { bg: 'bg-green-100', text: 'text-green-700', Icon: CircleCheck },
  Pending: { bg: 'bg-gray-100', text: 'text-gray-600', Icon: Circle },
};

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// แปลงตัวเลขเป็นข้อความราคาแบบไทย เช่น 1234.5 -> "฿1,234.50"
function money(n) {
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// แปลง ISO string ของ backend เป็นข้อความไทยอ่านง่าย เช่น "5 ก.ค. 2026" (ไม่มีวันที่ -> โชว์ PENDING_LABEL)
function formatDateTH(iso) {
  if (!iso) return PENDING_LABEL;
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function RestockOrder() {
  const [products, setProducts] = useState([]); // catalog สินค้าทั้งหมด ดึงจาก backend ตัวเดียวกับหน้า Staff
  const [orderItems, setOrderItems] = useState([]); // "ร่าง" ใบสั่งซื้อที่กำลังจัดอยู่ ยังไม่ถูกส่งไป backend จนกว่าจะกดยืนยัน
  const [recentOrders, setRecentOrders] = useState([]); // ประวัติใบสั่งซื้อที่สร้างไปแล้ว (จาก backend)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); // true ระหว่างรอ backend ตอบกลับตอนสร้าง PO
  const [receivingId, setReceivingId] = useState(null); // เก็บ id ของ PO ที่กำลังกด "รับสินค้าเข้าคลัง" อยู่ (กันกดซ้ำ/โชว์ loading เฉพาะแถวนั้น)

  // state ของ modal "เลือกสินค้าที่จะเพิ่ม"
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทุกหมวดหมู่');
  const [selections, setSelections] = useState({}); // { productId: จำนวนที่เลือกไว้ใน modal } ก่อนกด "เพิ่มเข้ารายการสั่งซื้อ"
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // โหลด inventory + ประวัติ PO พร้อมกันด้วย Promise.all เพราะสองอย่างนี้ไม่เกี่ยวกัน
  useEffect(() => {
    let cancelled = false;

    const loadData = () => {
      Promise.all([getInventory(), getPurchaseOrders()])
        .then(([inventory, orders]) => {
          if (cancelled) return;
          setProducts(inventory);
          setRecentOrders(orders);
        })
        .catch(() => {
          if (!cancelled) setError('โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    loadData();
    // Staff/Manager ต่างคนต่างโหลด inventory เอง (ไม่มี state กลางร่วมกัน) — รีเฟรชอัตโนมัติทุกครั้งที่
    // กลับมาโฟกัสหน้านี้ กันข้อมูลค้างเก่าเวลาอีกฝั่งปรับสต็อกไปแล้ว
    window.addEventListener('focus', loadData);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', loadData);
    };
  }, []);

  // "แจ้งเตือนสินค้าใกล้หมด" กรองจาก products ที่โหลดมา ไม่เรียก /low-stock แยก (logic ซ้ำกับ backend
  // controller — แก้เกณฑ์ต้องแก้ทั้งคู่)
  const lowStockItems = useMemo(() => products.filter((p) => p.stock <= p.threshold), [products]);

  const categoryOptions = useMemo(
    () => ['ทุกหมวดหมู่', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.qty * item.unitCost, 0),
    [orderItems]
  );

  const filteredCatalog = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'ทุกหมวดหมู่' || p.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, productSearch, categoryFilter]);

  const selectedCount = Object.values(selections).filter((qty) => qty > 0).length;

  const openProductModal = () => {
    setSelections({});
    setProductSearch('');
    setCategoryFilter('ทุกหมวดหมู่');
    setShowProductModal(true);
  };

  const closeProductModal = () => setShowProductModal(false);

  const changeSelection = (productId, delta) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) + delta),
    }));
  };

  // เพิ่มสินค้าเข้าร่าง PO — ใช้ทั้งจาก Quick Restock และ modal เลือกสินค้า, ถ้ามีอยู่แล้วบวกจำนวนแทนสร้างแถวซ้ำ
  const mergeIntoOrder = (product, qty) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          supplier: product.supplier,
          currentStock: product.stock, // เก็บ snapshot stock ตอนที่เพิ่มเข้ามา (ถ้า stock จริงเปลี่ยนทีหลัง เลขนี้จะไม่อัปเดตตาม)
          qty,
          unitCost: product.unitCost,
        },
      ];
    });
  };

  // กด "เพิ่มเข้ารายการสั่งซื้อ" ใน modal — ไล่ทุกสินค้าที่มีจำนวนเลือกไว้ > 0 แล้วเพิ่มเข้าร่างทีละตัว
  const addSelectedToOrder = () => {
    products.forEach((p) => {
      const qty = selections[p.id] ?? 0;
      if (qty > 0) mergeIntoOrder(p, qty);
    });
    closeProductModal();
  };

  // "เติมสต็อกด่วน" — สั่ง threshold - stock ปัจจุบัน (อย่างน้อย 1 หน่วย) ปุ่มถูกปิดเองถ้าอยู่ในร่างแล้ว
  // (ดู isInOrder ตรงจุด render) กันกดซ้ำจนจำนวนบวกเพิ่มโดยไม่ตั้งใจ
  const quickRestock = (item) => {
    const qty = Math.max(1, item.threshold - item.stock);
    mergeIntoOrder(item, qty);
  };

  const changeQty = (id, delta) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const openConfirmModal = () => {
    if (orderItems.length === 0) return;
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => setShowConfirmModal(false);

  // กด "ยืนยันการสั่งซื้อ" ใน modal สรุปรายการ — ตรงนี้ถึงยิง API สร้าง PO จริง (ปุ่ม "สร้างใบสั่งซื้อ" แรก
  // แค่เปิด modal ให้ตรวจทานก่อน กันกดพลาด)
  const confirmPurchaseOrder = async () => {
    setSubmitting(true);
    try {
      // ส่งแค่ id/qty ไป backend — backend ไปดึงชื่อ/ราคา/ผู้จัดจำหน่ายจริงมาเติมเอง
      const newOrder = await createPurchaseOrder(
        orderItems.map((item) => ({ id: item.id, qty: item.qty }))
      );
      setRecentOrders((prev) => [newOrder, ...prev]); // โผล่บนสุดของตารางทันที ไม่ต้อง refetch ใหม่ทั้งหมด
      setOrderItems([]); // เคลียร์ร่างใบสั่งซื้อ
      closeConfirmModal();
    } catch {
      setError('สร้างใบสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  // กด "รับสินค้าเข้าคลัง" — จุดที่ผูก PO เข้ากับสต็อกจริง backend บวกสต็อกทุกชิ้นใน PO ให้เอง แล้วส่งทั้ง
  // order/inventory ที่อัปเดตแล้วกลับมา
  const handleReceive = async (id) => {
    setReceivingId(id);
    try {
      const { order, inventory } = await receivePurchaseOrder(id);
      setRecentOrders((prev) => prev.map((po) => (po.id === order.id ? order : po)));
      // อัปเดต products ทั้งชุดจาก inventory ล่าสุด — การ์ด "แจ้งเตือนสินค้าใกล้หมด" หายไปเองถ้าพ้น threshold แล้ว
      setProducts(inventory);
    } catch {
      setError('รับสินค้าเข้าคลังไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="-m-6 min-h-screen bg-background p-10">
      <div className="mb-10 flex items-start justify-between gap-6">
        <h1 className="text-3xl font-bold text-gray-900">
          เติมสต็อกและสั่งซื้อสินค้าใหม่
        </h1>
        <button
          onClick={openConfirmModal}
          disabled={orderItems.length === 0}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-gray-900 shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} />
          สร้างใบสั่งซื้อ
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <AlertTriangle className="text-red-500" size={20} />
          แจ้งเตือนสินค้าใกล้หมด
        </h2>
        {/* ยังไม่มีหน้า "การแจ้งเตือนทั้งหมด" แยกต่างหาก ปิดปุ่มไว้ก่อนกันดูเหมือนกดได้แต่ไม่ทำอะไร */}
        <button
          disabled
          className="flex cursor-not-allowed items-center gap-1 text-sm font-medium text-gray-300"
        >
          ดูการแจ้งเตือนทั้งหมด
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-6">
        {lowStockItems.map((item) => {
          const isInOrder = orderItems.some((oi) => oi.id === item.id);
          return (
          <div key={item.id} className="relative rounded-2xl bg-other p-5">
            {item.stock === 0 && (
              <span className="absolute right-5 top-5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                วิกฤต
              </span>
            )}
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-gray-300">
              <ImageIcon size={22} />
            </span>
            <p className="mb-2 font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">
              คงเหลือปัจจุบัน:{' '}
              <span className="font-semibold text-red-600">{item.stock} หน่วย</span>
            </p>
            <p className="mb-4 text-sm text-gray-600">
              เกณฑ์ขั้นต่ำ: <span className="text-gray-700">{item.threshold} หน่วย</span>
            </p>
            <button
              onClick={() => quickRestock(item)}
              disabled={isInOrder}
              className="w-full rounded-full bg-primary py-2 text-sm font-medium text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isInOrder ? 'เพิ่มเข้ารายการแล้ว' : 'เติมสต็อกด่วน'}
            </button>
          </div>
          );
        })}
        {!loading && lowStockItems.length === 0 && (
          <p className="col-span-3 text-center text-sm text-gray-400">ไม่มีสินค้าที่ใกล้หมดสต็อกตอนนี้</p>
        )}
      </div>

      <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">รายการสั่งซื้อปัจจุบัน</h2>
          <button
            onClick={openProductModal}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Search size={16} />
            ค้นหาเพื่อเพิ่มสินค้า
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="py-3 font-medium">ชื่อสินค้า</th>
              <th className="py-3 font-medium">ผู้จัดจำหน่าย</th>
              <th className="py-3 font-medium">คงเหลือปัจจุบัน</th>
              <th className="py-3 font-medium">จำนวนสั่งซื้อ</th>
              <th className="py-3 font-medium">ราคาต่อหน่วย</th>
              <th className="py-3 font-medium">ยอดรวม</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                      <ImageIcon size={16} />
                    </span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="py-4 text-gray-600">{item.supplier}</td>
                <td className="py-4 text-gray-600">{item.currentStock}</td>
                <td className="py-4">
                  <div className="flex w-fit items-center gap-3 rounded-full bg-gray-100 px-2 py-1">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-medium text-gray-800">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td className="py-4 text-gray-600">{money(item.unitCost)}</td>
                <td className="py-4 font-semibold text-gray-900">
                  {money(item.qty * item.unitCost)}
                </td>
                <td className="py-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {orderItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  ยังไม่มีสินค้าใน order — กด "เติมสต็อกด่วน" หรือ "ค้นหาเพื่อเพิ่มสินค้า"
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-end gap-4 rounded-lg bg-gray-50 px-6 py-4">
          <span className="font-semibold text-gray-700">ยอดรวมคำสั่งซื้อ:</span>
          <span className="text-2xl font-bold text-gray-900">{money(subtotal)}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">ใบสั่งซื้อล่าสุด</h2>
          {/* ยังไม่มีหน้า "ประวัติทั้งหมด" แยกต่างหาก ปิดปุ่มไว้ก่อนกันดูเหมือนกดได้แต่ไม่ทำอะไร */}
          <button disabled className="cursor-not-allowed text-sm font-medium text-gray-300">
            ดูประวัติทั้งหมด
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="py-3 font-medium">เลขที่ใบสั่งซื้อ</th>
              <th className="py-3 font-medium">วันที่สร้าง</th>
              <th className="py-3 font-medium">ผู้จัดจำหน่าย</th>
              <th className="py-3 font-medium">สถานะ</th>
              <th className="py-3 font-medium">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((po) => {
              const pill = STATUS_PILL[po.status];
              return (
                <tr key={po.id} className="border-b border-gray-50">
                  <td className="py-4 font-semibold text-gray-900">{po.id}</td>
                  <td className="py-4 text-gray-600">{formatDateTH(po.createdAt)}</td>
                  <td className="py-4 text-gray-600">{po.supplier}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${pill.bg} ${pill.text}`}
                    >
                      <pill.Icon size={12} />
                      {STATUS_LABELS[po.status]}
                    </span>
                  </td>
                  <td className="py-4 font-medium">
                    {po.status === 'Received' ? (
                      <span className="text-gray-700">ดูใบเสร็จ</span>
                    ) : (
                      <button
                        onClick={() => handleReceive(po.id)}
                        disabled={receivingId === po.id}
                        className="font-medium text-gray-700 underline decoration-dotted hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {receivingId === po.id ? 'กำลังรับสินค้า...' : 'รับสินค้าเข้าคลัง'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="text-2xl font-semibold text-gray-900">เลือกสินค้าที่จะเพิ่ม</h3>
              <button onClick={closeProductModal} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 border-b border-gray-100 px-6 py-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  autoFocus
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="ค้นหาด้วยชื่อหรือ SKU..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredCatalog.map((p) => {
                const qty = selections[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between border-b border-gray-50 px-6 py-4 ${
                      qty > 0 ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                        <ImageIcon size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                        <p className="text-xs text-gray-400">{p.unitLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right text-sm">
                        <p className="text-gray-600">
                          คงเหลือ: <span className={p.stock <= p.threshold ? 'font-semibold text-red-500' : 'text-gray-700'}>{p.stock}</span>
                        </p>
                        <p className="font-medium text-gray-900">{money(p.unitCost)}</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-full bg-gray-100 px-2 py-1">
                        <button
                          onClick={() => changeSelection(p.id, -1)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center font-medium text-gray-800">{qty}</span>
                        <button
                          onClick={() => changeSelection(p.id, 1)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredCatalog.length === 0 && (
                <p className="px-6 py-10 text-center text-sm text-gray-400">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <span className="text-sm text-gray-500">เลือกแล้ว {selectedCount} รายการ</span>
              <div className="flex gap-3">
                <button
                  onClick={closeProductModal}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={addSelectedToOrder}
                  disabled={selectedCount === 0}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  เพิ่มเข้ารายการสั่งซื้อ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="text-2xl font-semibold text-gray-900">ยืนยันการสั่งซื้อ</h3>
              <button onClick={closeConfirmModal} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="mb-4 text-sm text-gray-500">
                กรุณาตรวจสอบรายการสั่งซื้อก่อนยืนยัน — เมื่อยืนยันแล้วจะสร้างใบสั่งซื้อใหม่ทันที
              </p>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.supplier} • {item.qty} x {money(item.unitCost)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {money(item.qty * item.unitCost)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="font-semibold text-gray-700">ยอดรวมคำสั่งซื้อ:</span>
                <span className="text-xl font-bold text-gray-900">{money(subtotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeConfirmModal}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmPurchaseOrder}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={16} />
                {submitting ? 'กำลังสร้างใบสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestockOrder;

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ClipboardCheck,
  AlertTriangle,
  RefreshCcw,
  Pencil,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Package,
  Check,
  CircleCheck,
  Circle,
} from 'lucide-react';
import { getInventory, adjustStock } from '../../services/inventory.service.js';

// สถานะคำนวณจาก stock เทียบ threshold ต่อ SKU (ไม่ใช่ค่าคงที่) — เรียกใหม่ทุกครั้งที่โหลด/ปรับสต็อก
function getStatus(stock, threshold) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= threshold) return 'Low Stock';
  return 'In Stock';
}

const STATUS_LABELS = {
  'In Stock': 'มีสินค้า',
  'Low Stock': 'ใกล้หมด',
  'Out of Stock': 'หมดสต็อก',
};

// สี+ไอคอนป้ายสถานะ — ใช้ pattern เดียวกับ STATUS_PILL ในหน้า Manager (restockOrder.jsx)
const STATUS_PILL = {
  'In Stock': { bg: 'bg-green-100', text: 'text-green-700', Icon: CircleCheck },
  'Low Stock': { bg: 'bg-yellow-100', text: 'text-yellow-700', Icon: AlertTriangle },
  'Out of Stock': { bg: 'bg-red-100', text: 'text-red-600', Icon: Circle },
};

const STATUS_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

const PAGE_SIZE = 10;

// เหตุผลแยกตามทิศทาง เพราะบางอย่างสมเหตุสมผลแค่ทางเดียว: "ลูกค้าคืนสินค้า" มีได้แค่ตอนเพิ่ม,
// "สินค้าเสียหาย/สูญหาย" มีได้แค่ตอนตัดออก — "รับสินค้าใหม่เข้า" ตัดทิ้งแล้ว เพราะต้องรับผ่าน PO ของ Manager เท่านั้น
const ADD_REASONS = ['ลูกค้าคืนสินค้า', 'ปรับแก้ยอดสต็อก', 'อื่นๆ'];
const REMOVE_REASONS = ['สินค้าเสียหาย / สูญหาย', 'ปรับแก้ยอดสต็อก', 'อื่นๆ'];

// backend ไม่ส่ง field "status" มาด้วย (มีแค่ stock/threshold ดิบๆ) — ฟังก์ชันนี้แปะ status ที่คำนวณแล้วให้
// ใช้ทั้งตอนโหลดข้อมูลครั้งแรกและตอนได้ผลลัพธ์กลับมาหลังปรับสต็อก
function withStatus(item) {
  return { ...item, status: getStatus(item.stock, item.threshold) };
}

function StatCard({ bgClass, icon, tag, value, label }) {
  return (
    <div className={`rounded-2xl p-6 ${bgClass}`}>
      <div className="mb-6 flex items-start justify-between text-gray-700">
        {icon}
        <span className="text-xs text-gray-500">{tag}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
}

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionType, setActionType] = useState('add');
  const [adjustment, setAdjustment] = useState('0');
  const [reason, setReason] = useState(ADD_REASONS[0]);
  const [saving, setSaving] = useState(false);

  // โหลดสต็อกจาก backend ตอนเปิดหน้า — cancelled กัน setState หลัง component ถูก unmount ไปแล้ว
  useEffect(() => {
    let cancelled = false;

    const loadInventory = () => {
      getInventory()
        .then((items) => {
          if (!cancelled) setProducts(items.map(withStatus));
        })
        .catch(() => {
          if (!cancelled) setError('โหลดข้อมูลสต็อกไม่สำเร็จ กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    loadInventory();
    // Staff กับ Manager ต่างคนต่างโหลด inventory เอง (ไม่มี state กลางร่วมกัน) — รีเฟรชอัตโนมัติ
    // ทุกครั้งที่กลับมาโฟกัสหน้านี้ กันข้อมูลค้างเก่าเวลาอีกฝั่งรับของเข้าคลังไปแล้ว
    window.addEventListener('focus', loadInventory);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', loadInventory);
    };
  }, []);

  const categoryOptions = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock').length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  // กันกรณี page ค้างเกิน totalPages อยู่ (เช่น ปรับสต็อกจนสินค้าเลื่อนหมวดหมู่ status ไปแล้วรายการหน้าสุดท้ายหายไป)
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openEdit = (product) => {
    setEditingProduct(product);
    setActionType('add');
    setAdjustment('0');
    setReason(ADD_REASONS[0]);
  };

  const closeEdit = () => setEditingProduct(null);

  // แปลงค่าที่พิมพ์ในช่อง input (string) ให้เป็นจำนวนเต็มที่ไม่ติดลบเสมอ
  const adjustmentAmount = Math.max(0, Math.floor(Number(adjustment)) || 0);

  // ยอดคงเหลือใหม่โดยประมาณ แสดงให้ดูก่อนกดยืนยันเฉยๆ (ยังไม่ยิง API) — backend คำนวณตัวจริงเองอีกที
  const projectedTotal = editingProduct
    ? actionType === 'add'
      ? editingProduct.stock + adjustmentAmount
      : Math.max(0, editingProduct.stock - adjustmentAmount)
    : 0;

  const saveEdit = async () => {
    // ถ้าไม่ได้กรอกจำนวนที่จะปรับเลย (0) แค่ปิด modal เฉยๆ ไม่ต้องยิง API ให้เปลืองแรง
    if (!editingProduct || adjustmentAmount === 0) return closeEdit();
    setSaving(true);
    try {
      // ยิง PATCH ไป backend จริง — backend เป็นคนคำนวณสต็อกใหม่และบันทึกลงไฟล์
      const updated = await adjustStock(editingProduct.id, {
        type: actionType,
        amount: adjustmentAmount,
        reason,
      });
      // เอาผลลัพธ์จริงจาก backend มาแทนที่ข้อมูลเดิมใน state (ไม่ใช้ projectedTotal ที่คำนวณเองฝั่งนี้)
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? withStatus(updated) : p))
      );
      closeEdit();
    } catch {
      setError('บันทึกการปรับสต็อกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="-m-6 min-h-screen bg-background p-10">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">จัดการสินค้าคงคลัง</h1>
          <p className="mt-2 max-w-md text-gray-500">
            ตรวจสอบ อัปเดต และจัดการระดับสต็อกสินค้าในคลังของคุณ
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // เปลี่ยนคำค้นหาแล้วต้องกลับไปหน้า 1 เสมอ ไม่งั้นอาจค้างอยู่หน้าที่เกินจำนวนผลลัพธ์ใหม่
            }}
            placeholder="ค้นหาด้วย SKU หรือชื่อสินค้า..."
            className="w-72 rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-3 gap-6">
        <StatCard
          bgClass="bg-other"
          icon={<ClipboardCheck size={22} />}
          tag={`${products.length} รายการ`}
          value={products.length}
          label="จำนวนสินค้าทั้งหมด (SKU)"
        />
        <StatCard
          bgClass="bg-primary"
          icon={<AlertTriangle size={22} />}
          tag="ต้องดำเนินการ"
          value={lowStockCount}
          label="แจ้งเตือนสินค้าใกล้หมด"
        />
        <StatCard
          bgClass="bg-gray-100"
          icon={<RefreshCcw size={22} />}
          tag="อัปเดตล่าสุดเมื่อสักครู่"
          value={products.reduce((sum, p) => sum + p.stock, 0)}
          label="จำนวนหน่วยในคลัง"
        />
      </div>

      <div className="rounded-2xl bg-other shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">รายการสินค้า</h2>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
              showFilters
                ? 'border-primary bg-primary/30 text-gray-900'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={16} />
            ตัวกรอง
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 border-b border-gray-100 p-6">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              หมวดหมู่
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'ทั้งหมด' : c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              สถานะ
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'ทั้งหมด' : STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-700">
              <th className="px-6 py-3 font-medium">สินค้า</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">หมวดหมู่</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">จำนวนคงเหลือ</th>
              <th className="px-6 py-3 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((p) => {
              const pill = STATUS_PILL[p.status];
              return (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                        <ImageIcon size={20} />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{p.id}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-primary/40 px-3 py-1 text-xs text-gray-700">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${pill.bg} ${pill.text}`}
                  >
                    <pill.Icon size={12} />
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{p.stock} หน่วย</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-gray-400 hover:text-gray-700"
                    title="ปรับจำนวนสต็อก"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
              );
            })}
            {!loading && filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา/ตัวกรอง
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  กำลังโหลดข้อมูลสต็อก...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-6 text-sm text-gray-500">
          <span>
            แสดง {pagedProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} จาก {filteredProducts.length} รายการ
          </span>
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
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-xl">
            <div className="flex items-center justify-between bg-other px-6 py-5">
              <h3 className="text-2xl font-semibold text-gray-900">ปรับปรุงระดับสต็อก</h3>
              <button onClick={closeEdit} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-other px-4 py-3">
                {editingProduct.image ? (
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-gray-300">
                    <ImageIcon size={20} />
                  </span>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{editingProduct.name}</p>
                  <p className="text-xs text-gray-500">SKU: {editingProduct.id}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <Package size={14} />
                    <span className="font-semibold">{editingProduct.stock} หน่วย</span> คงเหลือในสต็อก
                  </p>
                </div>
              </div>

              <p className="mb-2 text-sm font-medium text-gray-700">ประเภทการดำเนินการ</p>
              <div className="mb-6 flex gap-2 rounded-full bg-gray-50 p-1">
                <button
                  onClick={() => {
                    setActionType('add');
                    setReason(ADD_REASONS[0]);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                    actionType === 'add' ? 'bg-primary text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Plus size={16} />
                  เพิ่มสต็อก
                </button>
                <button
                  onClick={() => {
                    setActionType('remove');
                    setReason(REMOVE_REASONS[0]);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                    actionType === 'remove' ? 'bg-primary text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Minus size={16} />
                  ตัดสต็อกออก
                </button>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    จำนวนที่ปรับ
                  </label>
                  <input
                    type="number"
                    min="0"
                    autoFocus
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="w-full rounded-xl border border-gray-200 bg-other px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    เหตุผลในการปรับ
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-other px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {(actionType === 'add' ? ADD_REASONS : REMOVE_REASONS).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between rounded-lg bg-other px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  ยอดคงเหลือใหม่โดยประมาณ
                </span>
                <span className="flex items-center gap-2 text-gray-500">
                  {editingProduct.stock}
                  <span>→</span>
                  <span className="text-xl font-bold text-gray-900">{projectedTotal}</span>
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEdit}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-gray-900 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={16} />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการปรับสต็อก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;

import { useEffect, useState, useRef } from 'react';
import { Pencil, Trash2, Plus, Upload, Link, X, ChevronDown, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/product.service';

// ---- constants ----
const PAGE_SIZE = 10;

const CATEGORY_COLORS = {
  'อาหารแห้ง':    'bg-amber-100 text-amber-700',
  'อาหารเปียก':   'bg-blue-100 text-blue-700',
  'ออร์แกนิก':    'bg-green-100 text-green-700',
  'ขนม':          'bg-pink-100 text-pink-700',
  'อุปกรณ์':      'bg-purple-100 text-purple-700',
  'ของเล่น':      'bg-yellow-100 text-yellow-700',
};
function categoryBadge(cat) {
  return CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600';
}

function StockBadge({ stock, threshold }) {
  if (stock === null || stock === undefined) return <span className="text-gray-300 text-xs">—</span>;
  if (stock === 0) return <span className="text-red-500 text-sm font-medium">Out of stock</span>;
  if (stock <= threshold) return (
    <div>
      <span className="text-sm font-semibold text-gray-700">{stock}</span>
      <span className="block text-xs text-amber-600 font-medium">Low stock</span>
    </div>
  );
  return (
    <div>
      <span className="text-sm font-semibold text-gray-700">{stock}</span>
      <span className="block text-xs text-gray-400">in stock</span>
    </div>
  );
}

// ---- Modal ----
const CATEGORIES = ['อาหารแห้ง', 'อาหารเปียก', 'ออร์แกนิก', 'ขนม', 'อุปกรณ์', 'ของเล่น'];

function ProductModal({ open, onClose, onSave, initial }) {
  const [imgTab, setImgTab] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: CATEGORIES[0], sku: '', stock: '0', threshold: '10' });
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({ name: initial.name, description: initial.description || '', price: initial.price, category: initial.category, sku: initial.sku || '', stock: initial.stock ?? '0', threshold: initial.threshold ?? '10' });
        setImageUrl(initial.imageUrl || '');
        setPreviewUrl(initial.imageUrl || '');
      } else {
        setForm({ name: '', description: '', price: '', category: CATEGORIES[0], sku: '', stock: '0', threshold: '10' });
        setImageUrl('');
        setPreviewUrl('');
      }
      setImgTab('upload');
    }
  }, [open, initial]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageUrl(url);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageUrl(url);
  }

  function handleLinkApply() {
    setPreviewUrl(imageUrl);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) return;
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock), threshold: Number(form.threshold), imageUrl: previewUrl || null });
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-other rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{initial ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Image section */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Product Image</label>
            <div className="flex gap-1 mb-3">
              {['upload', 'link'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImgTab(tab)}
                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${imgTab === tab ? 'bg-[#5c6b3a] text-white border-[#5c6b3a]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  {tab === 'upload' ? <><Upload size={12} className="inline mr-1" />Upload File</> : <><Link size={12} className="inline mr-1" />Image Link</>}
                </button>
              ))}
            </div>
            {imgTab === 'upload' ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:border-[#5c6b3a] transition-colors relative overflow-hidden"
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-300 mb-1" />
                    <span className="text-xs text-gray-400">Click to upload or drag and drop</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
                <button type="button" onClick={handleLinkApply} className="px-3 py-2 bg-[#5c6b3a] text-white text-xs rounded-lg hover:bg-[#4a5630]">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ระบุชื่อสินค้า"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">คำอธิบาย</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="อธิบายคุณสมบัติและจุดเด่นของสินค้า"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30 resize-none"
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ราคา (฿)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30 bg-white"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* SKU — แสดงเฉพาะตอนสร้างใหม่ */}
          {!initial && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                SKU <span className="text-gray-400 font-normal text-xs">(ไม่ระบุ = ใช้ Product ID อัตโนมัติ)</span>
              </label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="เช่น NK-SL-12-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
              />
            </div>
          )}

          {/* Stock + Threshold — แสดงเฉพาะตอนสร้างใหม่ */}
          {!initial && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">สต็อกเริ่มต้น</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Threshold <span className="text-gray-400 font-normal text-xs">(แจ้งเตือนเมื่อต่ำกว่า)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder="10"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#5c6b3a] text-white rounded-lg hover:bg-[#4a5630]">
              {initial ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- main page ----
export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All Categories');
  const [filterStock, setFilterStock] = useState('Stock Status');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  function load() {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  // ---- categories list ----
  const allCategories = ['All Categories', ...Array.from(new Set(products.map((p) => p.category)))];

  // ---- filtered ----
  const filtered = products.filter((p) => {
    const catOk = filterCat === 'All Categories' || p.category === filterCat;
    let stockOk = true;
    if (filterStock === 'In Stock') stockOk = p.stock > (p.threshold ?? 0);
    else if (filterStock === 'Low Stock') stockOk = p.stock !== null && p.stock > 0 && p.stock <= (p.threshold ?? 0);
    else if (filterStock === 'Out of Stock') stockOk = p.stock === 0;
    return catOk && stockOk;
  });

  // ---- pagination ----
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ---- handlers ----
  async function handleSave(formData) {
    try {
      if (editTarget) {
        await updateProduct(editTarget.productId, formData);
        Swal.fire({ icon: 'success', title: 'แก้ไขสินค้าสำเร็จ', timer: 1500, showConfirmButton: false });
      } else {
        await createProduct(formData);
        Swal.fire({ icon: 'success', title: 'เพิ่มสินค้าสำเร็จ', timer: 1500, showConfirmButton: false });
      }
      setModalOpen(false);
      setEditTarget(null);
      load();
    } catch {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'กรุณาลองใหม่อีกครั้ง' });
    }
  }

  async function handleDelete(product) {
    const result = await Swal.fire({
      title: 'ลบสินค้า?',
      text: `"${product.name}" จะถูกลบออกจากระบบ`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5c6b3a',
      cancelButtonText: 'ยกเลิก',
      confirmButtonText: 'ลบ',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProduct(product.productId);
      Swal.fire({ icon: 'success', title: 'ลบสินค้าสำเร็จ', timer: 1500, showConfirmButton: false });
      load();
    } catch {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด' });
    }
  }

  function handleExportCSV() {
    const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
    const rows = products.map((p) => [p.productId, `"${p.name}"`, p.sku || '', p.category, p.price, p.stock ?? '', p.status]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- page numbers ----
  function pageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, '...', totalPages];
    if (safePage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">View:</span>
          <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-other hover:bg-gray-50">
            Products <ChevronDown size={14} />
          </button>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5c6b3a] text-white text-sm rounded-xl hover:bg-[#4a5630] transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter by:</span>
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-other focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
          >
            {allCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
          {/* Stock status filter */}
          <select
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-other focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
          >
            {['Stock Status', 'In Stock', 'Low Stock', 'Out of Stock'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-other rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">กำลังโหลดข้อมูล...</td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">ไม่พบสินค้า</td>
              </tr>
            ) : pageItems.map((p) => (
              <tr key={p.productId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                {/* Product */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#f0f2ea] overflow-hidden shrink-0 flex items-center justify-center">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="text-lg">🐾</span>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{p.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* SKU */}
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                {/* Category */}
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryBadge(p.category)}`}>
                    {p.category}
                  </span>
                </td>
                {/* Price */}
                <td className="px-4 py-3 text-right font-semibold text-gray-700">
                  ฿{Number(p.price).toLocaleString('th-TH')}
                </td>
                {/* Stock */}
                <td className="px-4 py-3 text-right">
                  <StockBadge stock={p.stock} threshold={p.threshold} />
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setEditTarget(p); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#5c6b3a] hover:bg-[#f0f2ea] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          {pageNumbers().map((n, i) =>
            n === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${safePage === n ? 'bg-[#5c6b3a] text-white border-[#5c6b3a]' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </div>
  );
}

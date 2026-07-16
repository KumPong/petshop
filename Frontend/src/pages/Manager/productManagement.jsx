import { useEffect, useState, useRef } from 'react';
import { Pencil, Trash2, Plus, Upload, Link, X, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../../services/product.service';

// ---- constants ----
const PAGE_SIZE = 10;

const CATEGORY_COLORS = {
  'อาหารแห้ง': 'bg-amber-100 text-amber-700',
  'อาหารเปียก': 'bg-blue-100 text-blue-700',
  'ออร์แกนิก': 'bg-green-100 text-green-700',
  'ขนม': 'bg-pink-100 text-pink-700',
  'อุปกรณ์': 'bg-purple-100 text-purple-700',
  'ของเล่น': 'bg-yellow-100 text-yellow-700',
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
  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', category: CATEGORIES[0], sku: '', stock: '0', threshold: '10' });
  // specifications: array of {key, value} pairs for the UI
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  // careInstructions: array of strings
  const [careList, setCareList] = useState(['']);
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({ name: initial.name, description: initial.description || '', price: initial.price, cost: initial.cost ?? '', category: initial.category, sku: initial.sku || '', stock: initial.stock ?? '0', threshold: initial.threshold ?? '10' });
        setImageUrl(initial.imageUrl || '');
        setPreviewUrl(initial.imageUrl || '');
        // Convert specifications object to array of {key,value}
        const specEntries = Object.entries(initial.specifications || {});
        setSpecs(specEntries.length > 0 ? specEntries.map(([k, v]) => ({ key: k, value: String(v) })) : [{ key: '', value: '' }]);
        const care = initial.careInstructions || [];
        setCareList(care.length > 0 ? care : ['']);
      } else {
        setForm({ name: '', description: '', price: '', cost: '', category: CATEGORIES[0], sku: '', stock: '0', threshold: '10' });
        setImageUrl('');
        setPreviewUrl('');
        setSpecs([{ key: '', value: '' }]);
        setCareList(['']);
      }
      setImgTab('upload');
    }
  }, [open, initial]);

  // blob: URL จาก createObjectURL ใช้ preview ได้แค่ชั่วคราวในเบราว์เซอร์เดียวกัน ไม่ persist ข้าม reload
  // ต้องอัปโหลดไฟล์ขึ้น backend จริงแล้วเก็บ URL ที่เซิร์ฟเวอร์คืนมาแทน
  async function uploadFile(file) {
    setPreviewUrl(URL.createObjectURL(file)); // preview ทันทีระหว่างรออัปโหลด
    try {
      const { imageUrl: uploadedUrl } = await uploadProductImage(file);
      setImageUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);
    } catch {
      Swal.fire({ icon: 'error', title: 'อัปโหลดรูปไม่สำเร็จ', text: 'กรุณาลองใหม่อีกครั้ง' });
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  function handleLinkApply() {
    setPreviewUrl(imageUrl);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) return;
    // Convert specs array back to object, skip empty keys
    const specsObj = {};
    specs.forEach(({ key, value }) => { if (key.trim()) specsObj[key.trim()] = value; });
    // Filter out empty care instructions
    const careArr = careList.filter((s) => s.trim() !== '');
    onSave({
      ...form,
      price: Number(form.price),
      cost: form.cost === '' ? undefined : Number(form.cost),
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      imageUrl: previewUrl || null,
      specifications: specsObj,
      careInstructions: careArr,
    });
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-other rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 text-base">{initial ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 bg-background overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="space-y-4">

            {/* Row 1: Image + Name/Description side by side */}
            <div className="flex gap-4">
              {/* Image (compact) */}
              <div className="shrink-0 w-36">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Image</label>
                <div className="flex gap-1 mb-2">
                  {['upload', 'link'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setImgTab(tab)}
                      className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${imgTab === tab ? 'bg-[#5c6b3a] text-white border-[#5c6b3a]' : 'border-gray-200 text-gray-500 hover:bg-secondary'}`}
                    >
                      {tab === 'upload' ? <><Upload size={10} className="inline mr-0.5" />Upload</> : <><Link size={10} className="inline mr-0.5" />Link</>}
                    </button>
                  ))}
                </div>
                {imgTab === 'upload' ? (
                  <div
                    className="border-2 border-dashed bg-other border-gray-200 rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-[#5c6b3a] transition-colors relative overflow-hidden"
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-300 mb-1" />
                        <span className="text-[10px] text-gray-400 text-center px-1">Click or drag</span>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                    />
                    <button type="button" onClick={handleLinkApply} className="w-full px-2 py-1 bg-[#5c6b3a] text-white text-xs rounded-lg hover:bg-[#4a5630]">
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Name + Description (fills remaining space) */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ระบุชื่อสินค้า"
                    className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">คำอธิบาย</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="อธิบายคุณสมบัติและจุดเด่นของสินค้า"
                    className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Price + Cost */}
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
                  className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ต้นทุน (฿) <span className="text-gray-400 font-normal text-xs">(ถ้าไม่ระบุ=ราคาขาย)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
            </div>

            {/* Row 3: Stock + Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">สต็อก</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Threshold <span className="text-gray-400 font-normal text-xs">(แจ้งเตือน)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder="10"
                  className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                />
              </div>
            </div>

            {/* Row 3: Category + SKU (SKU only on create) */}
            <div className={`grid gap-3 ${!initial ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {!initial && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    SKU <span className="text-gray-400 font-normal text-xs">(ไม่ระบุ = ใช้ Product ID อัตโนมัติ)</span>
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="เช่น NK-SL-12-001"
                    className="w-full border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                  />
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ข้อมูลจำเพาะ <span className="text-gray-400 font-normal text-xs">(เช่น type)</span>
              </label>
              <div className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={spec.key}
                      onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], key: e.target.value }; setSpecs(s); }}
                      placeholder="หัวข้อ (เช่น type)"
                      className="flex-1 border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                    />
                    <input
                      value={spec.value}
                      onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], value: e.target.value }; setSpecs(s); }}
                      placeholder="ค่า (เช่น อาหารแห้ง)"
                      className="flex-1 border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-colors shrink-0"
                      title="ลบแถวนี้"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                  className="text-xs text-[#5c6b3a] hover:underline mt-1"
                >
                  + เพิ่มข้อมูลจำเพาะ
                </button>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">วิธีดูแล</label>
              <div className="space-y-2">
                {careList.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={(e) => { const c = [...careList]; c[i] = e.target.value; setCareList(c); }}
                      placeholder={`คำแนะนำที่ ${i + 1}`}
                      className="flex-1 border bg-other border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setCareList(careList.filter((_, j) => j !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-red-500 transition-colors shrink-0"
                      title="ลบแถวนี้"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCareList([...careList, ''])}
                  className="text-xs text-[#5c6b3a] hover:underline mt-1"
                >
                  + เพิ่มคำแนะนำ
                </button>
              </div>
            </div>

          </div>{/* end space-y-4 */}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
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
          <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-other hover:bg-background">
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
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-other hover:bg-background focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
          >
            {allCategories.map((c) => <option key={c}>{c}</option>)}
          </select>
          {/* Stock status filter */}
          <select
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-other hover:bg-background focus:outline-none focus:ring-2 focus:ring-[#5c6b3a]/30"
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
      <div className="bg-other rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-700 uppercase">
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
              <tr key={p.productId} className="border-b border-gray-50 last:border-0 hover:bg-background transition-colors">
                {/* Product */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="text-lg">🐾</span>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-black leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-55">{p.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* SKU */}
                <td className="px-4 py-3 text-gray-500 text-sm">{p.sku || '—'}</td>
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
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-secondary"
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
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${safePage === n ? 'bg-[#5c6b3a] text-white border-[#5c6b3a]' : 'border-gray-200 hover:bg-secondary'}`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-secondary"
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

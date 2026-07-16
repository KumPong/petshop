import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom'
import { getInventory } from '../../services/inventory.service.js'
import { getProducts } from '../../services/product.service.js'
import { addToCart } from '../../services/cart.service.js'

function ProductListing({ selectedSegment = 'all' }) {
  const [sort, setSort] = useState('all')
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const titleMap = {
    all: 'สินค้าทั้งหมด',
    dogs: 'สินค้าสุนัข',
    cats: 'สินค้าแมว',
    accessories: 'อุปกรณ์อื่นๆ',
    birds: 'สินค้านก',
  }
  const title = titleMap[selectedSegment] || titleMap.all

  return (
    <div className="min-h-screen bg-background text-gray-800">
      <div className="container mx-auto p-4 flex gap-8">
        {/* Sidebar for Categories */}
        <aside className="w-1/4 bg-other rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">หมวดหมู่</h2>
          <nav>
            <ul className="space-y-1">
              {[
                { to: '/products',            segment: 'all',         label: 'ทั้งหมด' },
                { to: '/products/dogs',       segment: 'dogs',        label: 'หมา' },
                { to: '/products/cats',       segment: 'cats',        label: 'แมว' },
                { to: '/products/accessories',segment: 'accessories', label: 'อุปกรณ์อื่นๆ' },
              ].map(({ to, segment, label }) => (
                <li key={segment}>
                  <Link
                    to={to}
                    className={`block py-2 px-4 rounded-md transition duration-200 font-medium
                      ${selectedSegment === segment
                        ? 'bg-primary text-white'
                        : 'hover:bg-secondary text-gray-700'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area for Products */}
        <main className="w-3/4">
          {/* Product List Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">จัดเรียง:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">ทั้งหมด</option>
                <option value="price-asc">ราคา: ต่ำไปสูง</option>
                <option value="price-desc">ราคา: สูงไปต่ำ</option>
                <option value="name-asc">เรียงตามชื่อ</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InventoryGrid sort={sort} selectedSegment={selectedSegment} search={search} />
          </div>
        </main>
      </div>
    </div>
  );
}


function InventoryGrid({ sort, selectedSegment, search }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    let canceled = false
    async function load() {
      setLoading(true)
      try {
        const [inventory, products] = await Promise.all([getInventory(), getProducts()])
        // inventory.json ไม่มี field ราคาขายจริง (มีแค่ unitCost = ต้นทุน) ราคาขายจริงอยู่ใน product.json เท่านั้น
        const priceByProductId = new Map(products.map((p) => [p.productId, p.price]))
        const data = inventory.map((item) => ({ ...item, price: priceByProductId.get(item.productId) }))
        if (!canceled) setItems(data)
      } catch (err) {
        if (!canceled) setError(err.message || 'ไม่สามารถโหลดสินค้าจาก inventory ได้')
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    load()
    return () => { canceled = true }
  }, [])

  // reset page when sort/segment/search changes
  useEffect(() => {
    setPage(1)
  }, [sort, selectedSegment, search])

  const segmentFiltered = selectedSegment === 'all'
    ? items
    : items.filter((item) => item['id-type'] === selectedSegment)

  const q = search.trim().toLowerCase()
  const filteredItems = q
    ? segmentFiltered.filter((item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.subtitle || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      )
    : segmentFiltered

  if (loading) return <div className="col-span-full p-6">กำลังโหลดข้อมูลสินค้า...</div>
  if (error) return <div className="col-span-full p-6 text-red-600">{error}</div>

  // apply sorting — Best Seller items always first, then apply chosen sort within each group
  let sorted = [...filteredItems]
  sorted.sort((a, b) => {
    // Best Seller items always come first
    const bsDiff = (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0)
    if (bsDiff !== 0) return bsDiff
    // Then apply chosen sort
    if (sort === 'price-asc') return (a.price ?? a.unitCost ?? 0) - (b.price ?? b.unitCost ?? 0)
    if (sort === 'price-desc') return (b.price ?? b.unitCost ?? 0) - (a.price ?? a.unitCost ?? 0)
    if (sort === 'name-asc') return (a.name || '').localeCompare(b.name || '', 'th')
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const start = (page - 1) * ITEMS_PER_PAGE
  const pagedItems = sorted.slice(start, start + ITEMS_PER_PAGE)

  function goTo(newPage) {
    const p = Math.min(Math.max(1, newPage), totalPages)
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAddToCart(e, item) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ productId: item.productId, name: item.name, price: item.price ?? item.unitCost, image: item.image })
  }

  return (
    <>
      {pagedItems.map((p) => (
        <Link key={p.id} to={`/products/${p.id}`} className="flex flex-col bg-other rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img src={p.image || 'https://placehold.co/400x300?text=Product+Image'} alt={p.name} className="w-full h-48 object-contain bg-white p-2" />
            {p.bestSeller && (
              <span className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Best Seller</span>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">{p.name}</h3>
            <p className="text-gray-700 text-sm mb-3 line-clamp-2 flex-1">{p.subtitle || p.description || ''}</p>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <span className="text-xl font-bold text-green-700">{p.price ? `฿${p.price}` : (p.unitCost ? `฿${p.unitCost}` : 'ราคาไม่ระบุ')}</span>
              <button
                aria-label="Add to cart"
                onClick={(e) => handleAddToCart(e, p)}
                disabled={p.stock === 0}
                className="bg-primary hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 6h15l-1.5 9h-13z" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                <span className="sr-only">เพิ่มลงตะกร้า</span>
              </button>
            </div>
          </div>
        </Link>
      ))}

      <div className="col-span-full flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">แสดง {start + 1} - {Math.min(start + ITEMS_PER_PAGE, sorted.length)} จาก {sorted.length} รายการ</div>

        <div className="flex items-center gap-2">
          <button onClick={() => goTo(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => goTo(p)} className={`px-3 py-1 border rounded ${p === page ? 'bg-primary text-white' : ''}`}>{p}</button>
            )
          })}

          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </>
  )
}

export default ProductListing;
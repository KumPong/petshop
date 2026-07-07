import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { getInventory } from '../../services/inventory.service.js'

function ProductListing({ selectedSegment = 'all' }) {
  const [sort, setSort] = useState('all')
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
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <nav>
            <ul>
              <li>
                <Link to="/products" className="block py-2 px-4 hover:bg-secondary rounded-md transition duration-200">ทั้งหมด</Link>
              </li>
              <li>
                <Link to="/products/dogs" className="block py-2 px-4 hover:bg-secondary rounded-md transition duration-200">หมา</Link>
              </li>
              <li>
                <Link to="/products/cats" className="block py-2 px-4 hover:bg-secondary rounded-md transition duration-200">แมว</Link>
              </li>
              <li>
                <Link to="/products/accessories" className="block py-2 px-4 hover:bg-secondary rounded-md transition duration-200">อุปกรณ์อื่นๆ</Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area for Products */}
        <main className="w-3/4">
          {/* Product List Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InventoryGrid sort={sort} selectedSegment={selectedSegment} />
          </div>
        </main>
      </div>
    </div>
  );
}


function InventoryGrid({ sort, selectedSegment }) {
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
        const data = await getInventory()
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

  // reset page when sort changes
  useEffect(() => {
    setPage(1)
  }, [sort, selectedSegment])

  const filteredItems = selectedSegment === 'all'
    ? items
    : items.filter((item) => item['id-type'] === selectedSegment)

  if (loading) return <div className="col-span-full p-6">กำลังโหลดข้อมูลสินค้า...</div>
  if (error) return <div className="col-span-full p-6 text-red-600">{error}</div>

  // apply sorting
  let sorted = [...filteredItems]
  if (sort === 'price-asc') {
    sorted.sort((a, b) => (a.unitCost ?? a.price ?? 0) - (b.unitCost ?? b.price ?? 0))
  } else if (sort === 'price-desc') {
    sorted.sort((a, b) => (b.unitCost ?? b.price ?? 0) - (a.unitCost ?? a.price ?? 0))
  } else if (sort === 'name-asc') {
    sorted.sort((a, b) => ('' + (a.name || '')).localeCompare('' + (b.name || ''), undefined, { sensitivity: 'base' }))
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const start = (page - 1) * ITEMS_PER_PAGE
  const pagedItems = sorted.slice(start, start + ITEMS_PER_PAGE)

  function goTo(newPage) {
    const p = Math.min(Math.max(1, newPage), totalPages)
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {pagedItems.map((p) => (
        <Link key={p.id} to={`/products/${p.id}`} className="block bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img src={p.image || 'https://via.placeholder.com/400x300?text=Product+Image'} alt={p.name} className="w-full h-48 object-cover" />
            <span className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">favorite</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
            <p className="text-gray-700 text-sm mb-2">{p.subtitle || p.description || ''}</p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span className="text-yellow-500">★★★★☆</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-700">{p.unitCost ? `$${p.unitCost}` : (p.price ? `$${p.price}` : 'ราคาไม่ระบุ')}</span>
              <button aria-label="Add to cart" className="bg-primary hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2">
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
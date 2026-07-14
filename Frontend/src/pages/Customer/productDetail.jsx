import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import { getInventory } from '../../services/inventory.service.js'
import { addToCart } from '../../services/cart.service.js'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('specs')

  useEffect(() => {
    let canceled = false

    async function fetchProduct() {
      setLoading(true)
      setError(null)
      try {
        // พยายามเรียก endpoint /products/:id ก่อน (ถ้ามี)
        const resp = await api.get(`/products/${id}`).catch(() => null)
        if (resp && resp.data) {
          if (!canceled) setProduct(resp.data)
          return
        }

        // ถ้าไม่มี /products/:id ให้ fallback ไปดึงจาก inventory และแมปข้อมูลมาใช้
        const inventory = await getInventory()
        const item = inventory.find((i) => i.id === id || i.sku === id)
        if (!item) {
          if (!canceled) setError(`ไม่พบสินค้า id "${id}"`)
          return
        }

        // สร้างออบเจ็กต์ product แบบง่ายจากข้อมูล inventory
        // เก็บ productId (PD-xxx) แยกจาก id (SKU ของ inventory) — ตะกร้า/checkout ต้องใช้ productId เพราะ
        // order.controller.js อ้างอิง product.json ด้วย productId ไม่ใช่ SKU ของ inventory
        const productFromInventory = {
          id: item.id,
          productId: item.productId,
          name: item.name,
          description: item.subtitle || item.description || '',
          price: item.unitCost,
          image: item.image || null,
          stock: item.stock,
          specifications: item.specifications || {},
          careInstructions: item.careInstructions || []
        }
        if (!canceled) setProduct(productFromInventory)
      } catch (err) {
        if (!canceled) setError(err.message || 'ไม่สามารถดึงข้อมูลสินค้านี้ได้')
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    if (id) fetchProduct()

    return () => {
      canceled = true
    }
  }, [id])

  // เพิ่มสินค้าลงตะกร้า
  const handleAddToCart = () => {
    if (quantity <= 0) {
      alert('กรุณากำหนดจำนวนสินค้า')
      return
    }
    
    addToCart(product, quantity)

    // แสดงข้อความยืนยัน
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      // ปล่อยให้ user อยู่ในหน้านี้ เพื่อให้เขาสามารถดำเนินการต่อ
    }, 2000)
  }

  if (loading) return <div className="p-6">กำลังโหลดข้อมูลสินค้า...</div>
  if (error) return <div className="p-6 text-red-600">ข้อผิดพลาด: {error}</div>
  if (!product) return <div className="p-6">ไม่พบบันทึกรายการสินค้า</div>

  return (
    <div className="min-h-screen bg-background text-gray-800 p-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <img src={product.image || 'https://placehold.co/800x600?text=Product'} alt={product.name} className="w-full h-96 object-contain bg-white p-4 rounded-md mb-4" />
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description || 'ไม่มีคำอธิบายสำหรับสินค้านี้'}</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-extrabold text-green-700">{product.price ? `฿${product.price}` : 'ราคาไม่ระบุ'}</span>
            <span className="text-sm text-gray-500">(รหัสสินค้า: {product.id || id})</span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('specs')}
                className={`pb-4 font-medium transition-colors ${activeTab === 'specs' ? 'text-gray-900 border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ข้อมูลจำเพาะ
              </button>
              <button 
                onClick={() => setActiveTab('care')}
                className={`pb-4 font-medium transition-colors ${activeTab === 'care' ? 'text-gray-900 border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              >
                วิธีดูแล
              </button>
            </div>
          </div>

          {/* Specifications Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600 capitalize">{key}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
                {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    ไม่มีข้อมูลจำเพาะสำหรับสินค้านี้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Care Instructions Tab */}
          {activeTab === 'care' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-900 mb-3">วิธีดูแลรักษา</h3>
                {product.careInstructions && product.careInstructions.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={index}>• {instruction}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">ไม่มีข้อมูลวิธีดูแลสำหรับสินค้านี้</p>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold mb-3">รายละเอียดการสั่งซื้อ</h3>
          
          {/* Product Details */}
          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">สต็อก:</span>
              <span className={`font-semibold ฿{product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} ชิ้น` : 'สินค้าหมด'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">รวม:</span>
              <span className="font-bold text-green-700 text-lg">฿{(product.price * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">จำนวนสินค้า</label>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
                className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-bold py-2 px-4 rounded-md w-12 h-12 flex items-center justify-center"
              >
                −
              </button>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setQuantity(Math.max(1, Math.min(val, product.stock)))
                }}
                disabled={product.stock === 0}
                className="w-16 border border-gray-300 rounded-md py-2 px-3 text-center font-semibold disabled:bg-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ MozAppearance: 'textfield' }}
              />
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0 || quantity >= product.stock}
                className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-bold py-2 px-4 rounded-md w-12 h-12 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 px-4 rounded-md mb-2 flex items-center justify-center gap-2 font-semibold transition-all ${
              addedToCart 
                ? 'bg-green-500 text-white' 
                : product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6h15l-1.5 9h-13z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {addedToCart ? 'เพิ่มลงตะกร้าแล้ว ✓' : 'เพิ่มลงตะกร้า'}
          </button>
          
          <Link to="/products" className="block text-center text-sm text-gray-600 hover:text-gray-800 transition">กลับไปยังรายการสินค้า</Link>
        </aside>
      </div>
    </div>
  )
}

export default ProductDetail

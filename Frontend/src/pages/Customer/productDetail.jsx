import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api.js'
import { getInventory } from '../../services/inventory.service.js'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        const productFromInventory = {
          id: item.id,
          name: item.name,
          description: item.subtitle || item.description || '',
          price: item.unitCost,
          image: item.image || null,
          stock: item.stock,
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

  if (loading) return <div className="p-6">กำลังโหลดข้อมูลสินค้า...</div>
  if (error) return <div className="p-6 text-red-600">ข้อผิดพลาด: {error}</div>
  if (!product) return <div className="p-6">ไม่พบบันทึกรายการสินค้า</div>

  return (
    <div className="min-h-screen bg-background text-gray-800 p-6">
      <div className="container mx-auto mb-4">
        <Link to="/products" className="inline-block text-sm text-gray-700 hover:underline">← กลับไปยังรายการสินค้า</Link>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <img src={product.image || 'https://via.placeholder.com/800x600?text=Product'} alt={product.name} className="w-full h-96 object-cover rounded-md mb-4" />
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description || 'ไม่มีคำอธิบายสำหรับสินค้านี้'}</p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-extrabold text-green-700">{product.price ? `$${product.price}` : 'ราคาไม่ระบุ'}</span>
            <span className="text-sm text-gray-500">(รหัสสินค้า: {product.id || id})</span>
          </div>
        </div>

        <aside className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">รายละเอียดการสั่งซื้อ</h3>
            <p className="text-sm text-gray-600">สต็อก: {product.stock ?? 'ไม่ระบุ'}</p>
          </div>
          <button className="w-full bg-primary text-white py-2 px-4 rounded-md mb-2 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6h15l-1.5 9h-13z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            เพิ่มลงตะกร้า
          </button>
          <Link to="/products" className="block text-center text-sm text-gray-600">กลับไปยังรายการสินค้า</Link>
        </aside>
      </div>
    </div>
  )
}

export default ProductDetail

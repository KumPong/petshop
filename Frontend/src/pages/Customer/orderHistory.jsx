import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/customerSidebar";
import api from "../../services/api";
import { addToCart, getCart } from "../../services/cart.service.js";
import { getProducts } from "../../services/product.service.js";
import Swal from 'sweetalert2';

// สีของ badge อิงตามข้อความ shipping.statusLabel ที่ backend คำนวณให้ (ตัวเดียวกับที่หน้า Tracking ใช้)
// ดู attachLiveTimeline()/STATUS_BADGE_LABEL ใน Backend/controllers/order.controller.js
const STATUS_LABEL_COLOR = {
    'ชำระเงินสำเร็จ': 'bg-blue-100 text-blue-700',
    'กำลังเตรียมสินค้า': 'bg-lime-100 text-lime-800',
    'อยู่ระหว่างการขนส่ง': 'bg-yellow-100 text-yellow-800',
    'จัดส่งสำเร็จ': 'bg-emerald-100 text-emerald-700',
};

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = sessionStorage.getItem('token');

                // เรียกข้อมูลออเดอร์ทั้งหมดจาก Backend
                const response = await api.get('/orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // แสดงออเดอร์ทั้งหมดของลูกค้าคนนี้ ตั้งแต่ชำระเงินสำเร็จ (สร้างออเดอร์ = ชำระเงินสำเร็จแล้วในระบบนี้)
                // ไม่กรองเฉพาะ Delivered อีกต่อไป
                const myOrders = response.data.filter(order => order.customerId === currentUser.id);
                setOrders(myOrders);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, [currentUser.id]);

    // ฟังก์ชันสั่งซื้อซ้ำ — เพิ่มสินค้าจากออเดอร์เก่าเข้าตะกร้าจริงผ่าน cart.service.js (เดิม navigate ไปหน้า
    // payment เฉยๆ แต่ payment.jsx ไม่เคยอ่าน state ที่ส่งไปเลย เลยไม่มีอะไรเกิดขึ้น) แล้วค่อยพาไปหน้าชำระเงิน
    // ดึงสต็อกจริงมาก่อนเพื่อส่งให้ addToCart คลัมป์จำนวนไม่ให้เกินของจริง (เมื่อก่อนสั่งซ้ำได้เกินสต็อกเพราะ
    // ไม่เคยส่ง stock ไปเลย ต้องรอ backend เช็คตอนกดสั่งซื้อสุดท้ายเท่านั้น)
    const handleReorder = async (orderItems) => {
        try {
            const products = await getProducts();
            const stockByProductId = {};
            products.forEach((p) => { stockByProductId[p.productId] = p.stock; });

            // เก็บรายการที่โดนคลัมป์ไว้แจ้งเตือน (เทียบจำนวนที่ต้องการเพิ่มจริงกับสต็อกที่มี ก่อนเรียก addToCart)
            const clampedItems = [];
            orderItems.forEach((item) => {
                const stock = stockByProductId[item.productId];
                if (typeof stock === 'number') {
                    const existingQty = getCart().find((c) => c.productId === item.productId)?.quantity || 0;
                    if (existingQty + item.quantity > stock) {
                        clampedItems.push({ name: item.name, stock });
                    }
                }
                addToCart(
                    { productId: item.productId, name: item.name, price: item.unitPrice, image: item.imageUrl, stock },
                    item.quantity
                );
            });

            if (clampedItems.length > 0) {
                // รอให้ผู้ใช้กดปิด alert ก่อน ค่อย navigate ไม่งั้นหน้าจะเปลี่ยนทับ alert ทันที
                await Swal.fire({
                    icon: 'warning',
                    title: 'สินค้าบางรายการเหลือไม่พอ',
                    html: clampedItems.map((i) => `${i.name} — เพิ่มให้สูงสุดเท่าที่มีสต็อก (${i.stock} ชิ้น)`).join('<br/>'),
                    confirmButtonText: 'ตกลง',
                });
            }
        } catch (error) {
            console.error(error);
        }
        navigate('/payment');
    };



    if (loading) {
        return(
            <div className="min-h-[70vh] flex justify-center items-center text-gray-500">
                กำลังโหลดประวัติการสั่งซื้อ...
            </div>
        );
    } 
    
    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8 min-h-[70vh]">
            <div className="w-1/4">
                <CustomerSidebar />
            </div>

            <div className="grow max-w-7xl mx-auto px-4 py-8 w-full flex gap-8">
                <div className="w-3/4">
                    <h2 className="text-2xl font-bold text-black mb-2">ประวัติการสั่งซื้อ</h2>
                    <p className="text-gray-600 mb-6">ตรวจสอบสถานะและประวัติการสั่งซื้อสินค้าทั้งหมดของคุณ</p>

                    {/* Toolbar */}
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-other p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                                ยังไม่มีประวัติการสั่งซื้อ
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.orderId} className="bg-other p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-black">{order.orderNo}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_LABEL_COLOR[order.shipping?.statusLabel] || 'bg-secondary text-gray-700'}`}>
                                                {order.shipping?.statusLabel || 'กำลังดำเนินการ'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {new Date(order.orderDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-gray-600 flex flex-col gap-1 mt-3">
                                            <span className="font-medium text-gray-800">รายการสินค้า:</span>
                                            <ul className="list-disc list-inside text-gray-500 ml-2">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx}>{item.name} (x{item.quantity})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col justify-between h-full shrink-0 ml-6">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">ยอดรวมสุทธิ</div>
                                            <div className="font-bold text-xl text-black">
                                                ฿{order.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                            </div>
                                        </div>
                                        {/* ปุ่มสั่งซื้อซ้ำ */}
                                        <button
                                            onClick={() => handleReorder(order.items)}
                                            className="mt-6 px-6 py-2 rounded-lg text-sm font-medium transition bg-primary text-gray-700 hover:bg-secondary hover:text-black shadow-sm"
                                        >
                                            สั่งซื้อซ้ำ
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
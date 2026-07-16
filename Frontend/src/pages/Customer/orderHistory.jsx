import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/customerSidebar";
import api from "../../services/api";

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

                // กรองเอาเฉพาะออเดอร์ที่มีสถานะ "Delivered" (จัดส่งสำเร็จ) เท่านั้น
                const deliveredOrders = response.data.filter(order => 
                    order.status === 'Delivered' && order.customerId === currentUser.id
                );
                setOrders(deliveredOrders);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, [currentUser.id]);

    // ฟังก์ชันสั่งซื้อซ้ำ
    const handleReorder = (orderItems) => {
        // ส่งข้อมูลสินค้าในออเดอร์เก่าแนบไปกับ state แล้วพุ่งไปหน้า payment
        navigate('/payment', { state: { reorderItems: orderItems } });
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
                                ยังไม่มีประวัติการสั่งซื้อที่จัดส่งสำเร็จ
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.orderId} className="bg-other p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-black">{order.orderNo}</h3>
                                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-secondary text-gray-700">
                                                จัดส่งสำเร็จ
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
import { useState, useEffect } from "react";
import CustomerSidebar from "../../components/customerSidebar";

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // API ดึงประวัติของ User
                const response = await fetch('http://localhost:xxxx/api/customers/orders', {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    // Mock data
                    setOrders([
                        { orderNo: '#PS-12482', date: '24 Oct 2024', status: 'Completed', items: '2 items: Organic Puppy Kibble, Zen Water Bowl', totalAmount: 2450.00 },
                        { orderNo: '#PS-12490', date: '26 Oct 2024', status: 'Shipped', items: '1 item: Calming Lavender Pet Bed (Large)', totalAmount: 1890.00 },
                        { orderNo: '#PS-12503', date: '28 Oct 2024', status: 'Processing', items: '3 items: Catnip Toys, Dental Treats, Grooming Kit', totalAmount: 1120.00 },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Completed': return 'bg-secondary text-primary';
            case 'Shipped': return 'bg-secondary text-primary';
            case 'Processing': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center">กำลังโหลดประวัติการสั่งซื้อ...</div>;
    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8">
            <div className="w-1/4">
                <CustomerSidebar />
            </div>

            <div className="grow max-w-7xl mx-auto px-4 py-8 w-full flex gap-8">
                <div className="w-3/4">
                    <h2 className="text-2xl font-bold text-black mb-2">ประวัติการสั่งซื้อ</h2>
                    <p className="text-gray-600 mb-6">ตรวจสอบสถานะและประวัติการสั่งซื้อสินค้าทั้งหมดของคุณ</p>

                    {/* Toolbar */}
                    <div className="flex justify-between mb-6">
                        <div className="relative">
                            <input type="text" placeholder="ค้นหารหัสคำสั่งซื้อ..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 text-sm focus:outline-none focus:border-primary" />
                            <svg className="w-4 h-4 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <div className="flex gap-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                            {['All', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(tab => (
                                <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                                        filter === tab
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order.orderNo} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-black">{order.orderNo}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        {order.date}
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                        {order.items}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-between h-full">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                                        <div className="font-bold text-xl text-black">{order.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                    </div>
                                    <button className={`mt-4 px-6 py-2 rounded-lg text-sm font-medium transition ${order.status === 'Shipped' ? 'bg-white border border-gray-300 text-black hover:bg-gray-50' : 'bg-other text-secondary hover:bg-background'}`}>
                                        {order.status === 'Shipped' ? 'ติดตามสินค้า' : 'ดูรายละเอียด'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
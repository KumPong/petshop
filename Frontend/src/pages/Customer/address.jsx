import { useState, useEffect } from "react";
import CustomerSidebar from "../../components/customerSidebar";

function Address() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                // ดึง token ที่เก็บไว้ใน localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    setLoading(false);
                    return;
                }

                // API ไปยัง Backend
                const response = await fetch('http://localhost:xxxx/api/customers/addresses', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // แนบ Token ไปใน Header เพื่อระบุตัวตนผู้ใช้
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAddresses(data);
                } else {
                    console.error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error )
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูลที่อยู่...</div>
    }

    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8">
            <div className="w-1/4">
                <CustomerSidebar/>
            </div>

            <div className="w-3/4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-1">ที่อยู่ของฉัน</h2>
                        <p className="text-gray-600">จัดการที่อยู่สำหรับการจัดส่งของคุณ</p>
                    </div>
                    <button className="bg-primary hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg transition">
                        + เพิ่มที่อยู่ใหม่
                    </button>
                </div>

                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                            คุณยังไม่ได้เพิ่มที่อยู่จัดส่งสินค้า
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* ปรับฟิลด์ชื่อตาม Object ที่ส่งมาจาก Database */}
                                            <h3 className="font-bold text-lg text-black">
                                                {addr.fullName || `${addr.firstName} ${addr.lastName}`}
                                            </h3>
                                            <span className="text-gray-600">{addr.phone}</span>
                                            {addr.isDefault && (
                                                <span className="px-2 py-0.5 bg-secondary text-primary text-sm rounded-full font-medium">ค่าเริ่มต้น</span>
                                            )}
                                        </div>
                                        {/* ปรับการต่อข้อความที่อยู่ตาม Fields ในตาราง Address ของคุณ */}
                                        <p className="text-gray-600 text-sm max-w-2xl">
                                            {addr.addressLine1} {addr.addressLine2 || ''}  {addr.district} {addr.amphoe} {addr.province} {addr.zipcode}
                                        </p>
                                    </div>
                                    <div className="text-sm">
                                        <button className="text-gray-500 hover:text-black">แก้ไข</button>
                                        {!addr.isDefault && (
                                            <>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <button className="text-red-500 hover:text-red-700">ลบ</button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <button
                                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${addr.isDefault ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        disabled={addr.isDefault}
                                    >
                                        ตั้งเป็นค่าเริ่มต้น
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Address;
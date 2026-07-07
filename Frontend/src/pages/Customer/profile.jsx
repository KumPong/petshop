import { useState, useEffect } from "react";
import CustomerSidebar from "../../components/customerSidebar";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    setLoading(false);
                    return;
                }

                // API User
                const response = await fetch('http://localhost:xxxx/api/customers/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfile({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: data.phone || 'ยังไม่ได้ระบุ',
                        dateOfBirth: data.dateOfBirth || 'ยังไม่ได้ระบุ',
                        mainAddress: data.defaultAddress?.addressLine1 || 'ยังไม่ได้ระบุ'
                    });
                } else {
                    // ถ้า API พัง หรือยังไม่มีใช้ Mock
                    setProfile({
                        firstName: 'เจน',
                        lastName: 'โด',
                        email: 'jane.doe@example.com',
                        phone: '081-234-5678',
                        dateOfBirth: '15 พฤษภาคม 2538', // แก้คำผิด พฤษภาคน
                        mainAddress: 'กรุงเทพมหานคร'
                    });
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="min-h-screen flex justify-center items-center">กำลังโหลดข้อมูล...</div>
    if (!profile) return <div className="min-h-screen flex justify-center items-center">ไม่พบข้อมูลผู้ใช้</div>

    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8">
            <div className="w-1/4">
                <CustomerSidebar />
            </div>
            
            <div className="grow max-w-7xl mx-auto px-4 py-8 w-full flex gap-8">
                {/* Content */}
                <div className="w-3/4 space-y-6">
                    {/* Head Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-gray-100">
                        <div className="relative">
                            <img src="https://via.placeholder.com/100" alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-secondary" />
                            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-secondary transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-black">{profile.firstName} {profile.lastName}</h2>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-black">ข้อมูลส่วนตัว</h3>
                            <button className="text-sm text-gray-600 hover:text-black underline">แก้ไข</button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">ชื่อ-นามสกุล</label>
                                <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.firstName} {profile.lastName}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">เบอร์โทรศัพท์</label>
                                <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.phone}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">วันเกิด</label>
                                <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.dateOfBirth}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">ที่อยู่หลัก</label>
                                <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.mainAddress}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
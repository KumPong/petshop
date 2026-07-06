import { useState } from "react";
import CustomerSidebar from "../../components/customerSidebar";

function ChangePassword() {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleChange = (e) => {
        setPasswords({...passwords, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validation เบื้องต้น
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("ไม่พบข้อมูลยืนยันตัวตน");

            // API อัปเดตรหัสผ่านใหม่
            const response = await fetch('http://localhost:xxxx/api/users/change-password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            if(response.ok) {
                setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const errorData = await response.json();
                setMessage({type: 'error', text: errorData.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง'})
            }
        } catch (error) {
            console.error("Error", error);
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8">
            <div className="w-1/4">
                <CustomerSidebar />
            </div>
            
            <div className="grow max-w-7xl mx-auto w-full flex gap-8">
                <div className="w-3/4 space-y-6">
                    {/* Mock Header as Profile */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-gray-100">
                        <img src="https://via.placeholder.com/100" alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-background" />
                        <div>
                            <h2 className="text-2xl font-bold text-black">เจน โด</h2>
                            <p className="text-gray-600">jane.doe@example.com</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-black mb-6">เปลี่ยนรหัสผ่าน</h3>
                        
                        {/* แสดงข้อความแจ้งเตือน */}
                        {message.text && (
                            <div className={`p-4 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">รหัสผ่านปัจจุบัน</label>
                                <div className="relative">
                                    <input type="password" name="current" value={passwords.current} onChange={handleChange} className="w-full bg-background px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">รหัสผ่านใหม่</label>
                                <input type="password" name="new" value={passwords.new} onChange={handleChange} className="w-full bg-background px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="อย่างน้อย 8 ตัว" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">ยืนยันรหัสผ่านใหม่</label>
                                <input type="password" name="confirm" value={passwords.confirm} onChange={handleChange} className="w-full bg-background px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง" required />
                            </div>

                            <button type="submit" className="mt-4 bg-primary hover:bg-secondary text-white font-medium py-3 px-8 rounded-lg transition-colors">
                                {isLoading ? 'กำลังอัปเดต...' : 'อัปเดตรหัสผ่าน'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
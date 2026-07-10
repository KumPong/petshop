import { useState } from "react";
import CustomerSidebar from "../../components/customerSidebar";
import { changeUserPassword } from "../../services/auth.service";
import { Eye, EyeOff } from "lucide-react";

function ChangePassword() {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' })

    // States สำหรับซ่อน/แสดงรหัสผ่านแต่ละช่อง
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
            await changeUserPassword(token, {
                oldPassword: passwords.current,
                newPassword: passwords.new
            });

            setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
            setPasswords({ current: '', new: '', confirm: '' });

        } catch (error) {
            console.error("Error", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
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
                    <div className="bg-other p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-black mb-6">เปลี่ยนรหัสผ่าน</h3>
                        
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
                                    <input type={showCurrent ? "text" : "password"} name="current" value={passwords.current} onChange={handleChange} className="w-full bg-background px-4 py-3 pr-10 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" required />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">รหัสผ่านใหม่</label>
                                <div className="relative">
                                    <input type={showNew ? "text" : "password"} name="new" value={passwords.new} onChange={handleChange} className="w-full bg-background px-4 py-3 pr-10 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="อย่างน้อย 8 ตัว" required />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2 font-medium">ยืนยันรหัสผ่านใหม่</label>
                                <div className="relative">
                                    <input type={showConfirm ? "text" : "password"} name="confirm" value={passwords.confirm} onChange={handleChange} className="w-full bg-background px-4 py-3 pr-10 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-primary" placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง" required />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="mt-4 bg-primary hover:bg-secondary text-black font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-70">
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
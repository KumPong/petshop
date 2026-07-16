import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../assets/Logo.png'
import { registerUser } from "../services/auth.service";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', email: '', password:'', confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณายืนยันรหัสผ่านใหม่อีกครั้ง',
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }

        setIsLoading(true);

        // แยก FullName เป็น firstName และ lastName ให้ Backend
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || ''; // เอาคำที่เหลือทั้งหมดเป็นนามสกุล

        try {
            const payload = {
                firstName,
                lastName,
                email: formData.email,
                password: formData.password
            };

            const data = await registerUser(payload);

            Swal.fire({
                icon: 'success',
                title: 'สมัครสมาชิกสำเร็จ',
                text: data.message || 'ระบบจะพาคุณไปยังหน้าเข้าสู่ระบบ',
                timer: 2000,
                showConfirmButton: false
            });

            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error) {
            console.error('Register failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'สมัครสมาชิกไม่สำเร็จ',
                text: error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                timer: 2500,
                showConfirmButton: false
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="max-w-md w-full bg-other rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-secondary p-3 rounded-full text-black mb-4">
                        <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                    </div>
                    <h2 className="text-2xl font-bold text-black">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-1">Join PetStop today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={isLoading} required 
                                placeholder="Full Name"
                                className="w-full px-4 py-2 border border-gray-300 bg-background rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" name="email" onChange={handleChange} disabled={isLoading} required
                                placeholder="test@example.com"
                                className="w-full px-4 py-2 border border-gray-300 bg-background  rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                            />
                        </div>
                        
                        {/* จับ Password กับ Confirm Password มัดรวมกันให้อยู่บรรทัดเดียวกัน */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} name="password" onChange={handleChange} disabled={isLoading} required
                                        placeholder="**********"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 bg-background  rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} name="confirmPassword" onChange={handleChange} disabled={isLoading} required
                                        placeholder="**********"
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 bg-background  rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full font-semibold py-2.5 rounded-lg transition duration-200 mt-6 flex justify-center items-center gap-2
                            ${isLoading 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-primary hover:bg-secondary text-black'
                            }`
                        }
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                กำลังดำเนินการ...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account? <Link to='/login' className="text-black font-semibold hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
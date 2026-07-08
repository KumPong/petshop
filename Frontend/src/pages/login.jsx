import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader2 } from 'lucide-react';
import Logo from '../assets/Logo.png';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // เช็กว่ามาจาก Route พนักงานหรือไม่ (ถ้าเข้า /login ตรงๆ จะเป็น undefined ซึ่งถือว่า false)
    const isEmployee = location.state?.isEmployeeRoute || false;

    const [formData, setFormData] = useState({ email: '', password: ''});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', formData);
            const data = response.data;

            // Pop-up แบบสำเร็จ
            Swal.fire({
                icon: 'success',
                title: 'เข้าสู่ระบบสำเร็จ',
                text: data.message,
                timer: 1500,
                showConfirmButton: false
            });

            // เก็บข้อมูลลงเครื่อง
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // รอให้ Pop-up โชว์ก่อนแล้วค่อยเปลี่ยนหน้า
            setTimeout(() => {
                if (data.user.role === 'Manager') {
                    navigate('/manager');
                } else if (data.user.role === 'Staff') {
                    navigate('/staff')
                } else {
                    navigate('/');
                }
            }, 1000);

        } catch (error) {
            console.error("Login failed:", error);
            // Pop-up
            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบล้มเหลว',
                text: error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                timer: 2500,
                showConfirmButton: false
            });
        } finally{
            setIsLoading(false); 
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary p-3 rounded-full text-black mb-4">
                        <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                    </div>
                    <h2 className="text-2xl font-bold text-black">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1">Please login to your PetStop account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Enter your password"
                            required
                        />
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
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {!isEmployee && (
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account? <Link to='/register' className="text-primary font-semibold hover:underline">Register here</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
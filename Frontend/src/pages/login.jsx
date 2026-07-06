import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.png';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // เช็กว่ามาจาก Route พนักงานหรือไม่ (ถ้าเข้า /login ตรงๆ จะเป็น undefined ซึ่งถือว่า false)
    const isEmployee = location.state?.isEmployeeRoute || false;

    const [formData, setFormData] = useState({ email: '', password: ''});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt with:', formData);
        // ต่อ API Backend ตรงนี้ 
        // ถ้ายิง API ผ่าน ก็เช็ก Role ว่าเป็น Staff, Manager หรือ Customer แล้ว navigate ไปหน้านั้นๆ
        // สมมติว่าล็อกอินสำเร็จเป็น Manager:
        // navigate('/manager');
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-6"
                    >
                        Login
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
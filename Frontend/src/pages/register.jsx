import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from '../assets/Logo.png'

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password:'', confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        console.log('Register attempt with:', formData);
        // ต่อ API Backend สมัครสมาชิก (สร้าง Prisma Record)
        // พอสำเร็จค่อยเด้งไปหน้า Login
        // navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-secondary p-3 rounded-full text-black mb-4">
                        <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                    </div>
                    <h2 className="text-2xl font-bold text-black">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-1">Join PetStop today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input 
                                type="text" name="firstName" onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input 
                                type="text" name="lastName" onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" name="email" onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password" name="password" onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input 
                                type="password" name="confirmPassword" onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-6">
                            Register
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account? <Link to='/login' className="text-black font-semibold hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
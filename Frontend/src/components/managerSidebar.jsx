import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, 
    Users, 
    Package, 
    Truck, 
    FileBarChart, 
    LogOut
} from 'lucide-react'
import Logo from '../assets/Logo.png'

function ManagerSidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // ใส่โค้ดเคลียร์ Token/Session ของ Node.js ตรงนี้
            // เช่น localStorage.removeItem('token');
            // await axios.post('/api/auth/logout');
            console.log('Manager logged out successfully');
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/manager', icon: <LayoutDashboard size={20} /> },
        { name: 'Manage Users', path: '/manager/users', icon: <Users size={20} /> },
        { name: 'Products', path: '/manager/products', icon: <Package size={20} /> },
        { name: 'Suppliers', path: '/manager/suppliers', icon: <Truck size={20} /> },
        { name: 'Report', path: '/manager/reports', icon: <FileBarChart size={20} /> },
    ]

    return(
        <aside className="w-64 h-screen bg-other flex flex-col border-r border-gray-200">
            {/* Header & Logo */}
            <div className="p-6 flex items-center gap-3">
                <NavLink className="shrink-0">
                    <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                </NavLink>
                <div>
                    <h1 className="text-xl text-fontgreen font-bold leading-tight">PetStop</h1>
                    <p className="text-sm">PetStop Manager</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/manager'} // ไม่ให้มันทำงานค้างเวลาไปหน้าอื่นๆ
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-secondary text-black font-medium'
                                    : 'text-black hover:bg-secondary hover:text-gray-900' 
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 mb-4">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-primary text-fontgreen font-medium rounded-xl transition-colors"
                >
                    <LogOut size={24}/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default ManagerSidebar;

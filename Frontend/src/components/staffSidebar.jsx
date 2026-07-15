import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, 
    ShoppingCart, 
    Archive, 
    LogOut
} from 'lucide-react'
import Logo from '../assets/Logo.png'

function StaffSidebar() {
    const navigate = useNavigate();    

    const handleLogout = async () => {
        try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            
            console.log('Manager logged out successfully');
            navigate('/login'); // เปลี่ยนเส้นทางไปหน้า Login
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={20} /> },
        { name: 'Orders', path: '/staff/orders', icon: <ShoppingCart size={20} /> },
        { name: 'Inventory', path: '/staff/inventory', icon: <Archive size={20} /> },
    ];

    return(
        <aside className="w-64 h-screen bg-other flex flex-col border-r border-gray-200">
            {/* Header & Logo */}
            <div className="p-6 flex items-center gap-3">
                <NavLink>
                    <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                </NavLink>
                <div>
                    <h1 className="text-xl font-bold text-fontgreen leading-tight">PetStop</h1>
                    <p className="text-sm text-gray-600">PetStop Staff</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/staff'}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-secondary text-black font-medium'
                                    : 'text-gray-600 hover:bg-secondary hover:text-black'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout BT */}
            <div className="p-4 mb-4">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-primary text-fontgreen font-medium rounded-xl transition-colors"
                >
                    <LogOut size={20}/>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default StaffSidebar;

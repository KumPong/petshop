import { Link, useLocation } from "react-router-dom";

function CustomerSidebar() {
    const location = useLocation();

    // ฟังก์ชั่นเช็๕ว่าหน้าปัจจุบันตรงกับเมนูไหน เพื่อทำสีไฮไลด์
    const isActive = (path) => location.pathname === path;

    return(
        <div className="w-64 bg-other rounded-xl p-6 h-fit shadow-sm">
            <h3 className="text-gray-500 font-medium mb-4 text-sm">เมนูผู้ใช้งาน</h3>
            <ul className="space-y-2">
                <li>
                    <Link 
                        to='/profile' 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive('/profile') 
                                ? 'bg-secondary text-black font-medium' 
                                : 'text-gray-600 hover:bg-secondary/50'}
                        `}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            โปรไฟล์ของฉัน
                    </Link>
                </li>
                <li>
                    <Link 
                        to='/address' 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive('/address') 
                                ? 'bg-secondary text-black font-medium' 
                                : 'text-gray-600 hover:bg-secondary/50'}
                        `}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            ที่อยู่
                    </Link>
                </li>
                <li>
                    <Link 
                        to='/orders' 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive('/orders') 
                                ? 'bg-secondary text-black font-medium' 
                                : 'text-gray-600 hover:bg-secondary/50'}
                        `}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ประวัติการสั่งซื้อ
                    </Link>
                </li>
                <li>
                    <Link 
                        to='/change-password'
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive('/change-password')
                                ? 'bg-secondary text-black font-medium' 
                                : 'text-gray-600 hover:bg-secondary/50'}
                        `}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            เปลี่ยนรหัสผ่าน
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default CustomerSidebar;
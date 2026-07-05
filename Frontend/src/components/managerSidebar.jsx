import { NavLink } from 'react-router-dom';
import { PawPrint, LayoutGrid, User, Box, Truck, FileBarChart2, LogOut } from 'lucide-react';

// เมนูที่มี disabled: true คือหน้าที่ยังไม่มีอยู่จริงในโปรเจกต์ (Manage Users, Products, Report)
// จงใจใส่ไว้ให้เห็นครบตาม design แต่กดไม่ได้ (เทาๆ) กันไม่ให้เป็นลิงก์ที่พาไปหน้าเปล่า/error
// ส่วน "ผู้จัดจำหน่าย" (Suppliers) คือเมนูเดียวที่ใช้งานได้จริง ลิงก์ไปหน้า Restock ที่ /manager/inventory
const NAV_ITEMS = [
  { to: '/manager', label: 'แดชบอร์ด', icon: LayoutGrid, end: true },
  { label: 'จัดการผู้ใช้งาน', icon: User, disabled: true },
  { label: 'สินค้า', icon: Box, disabled: true },
  { to: '/manager/inventory', label: 'ผู้จัดจำหน่าย', icon: Truck },
  { label: 'รายงาน', icon: FileBarChart2, disabled: true },
];

function ManagerSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <PawPrint size={18} className="text-gray-700" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">PetStop</p>
            <p className="text-xs text-gray-400 leading-tight">ผู้จัดการ PetStop</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {/* เมนูแต่ละอันเลือก render เป็น <span> เฉยๆ (กดไม่ได้) หรือ <NavLink> (กดได้จริง)
              แล้วแต่ว่ามี flag disabled หรือไม่ */}
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, disabled }) =>
            disabled ? (
              <span
                key={label}
                title="เร็ว ๆ นี้"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300"
              >
                <Icon size={18} />
                {label}
              </span>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            )
          )}
        </nav>
      </div>

      <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
        <LogOut size={18} />
        ออกจากระบบ
      </button>
    </aside>
  );
}

export default ManagerSidebar;

import { NavLink } from 'react-router-dom';
import { PawPrint, LayoutGrid, Archive, LogOut } from 'lucide-react';

// รายการเมนูใน sidebar ของ Staff — วนลูป render จาก array นี้แทนเขียน <NavLink> ซ้ำๆ ทีละอัน
// end: true หมายถึงจะ highlight ว่า active เฉพาะตอน path ตรงเป๊ะ (ไม่ใช่ prefix)
// ใช้กับ "/staff" เพราะไม่งั้น "/staff/inventory" จะ match กับ "/staff" ด้วย ทำให้ Dashboard ค้าง highlight ตลอด
const NAV_ITEMS = [
  { to: '/staff', label: 'แดชบอร์ด', icon: LayoutGrid, end: true },
  { to: '/staff/inventory', label: 'คลังสินค้า', icon: Archive },
];

function StaffSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-100 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <PawPrint size={18} className="text-gray-700" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">PetStop</p>
            <p className="text-xs text-gray-400 leading-tight">พนักงาน PetStop</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            // NavLink พิเศษกว่า Link ตรงที่รู้ว่าตัวเองกำลัง "active" อยู่หรือไม่
            // (isActive มาจาก react-router เอง) เลยใช้ทำ highlight เมนูปัจจุบันได้โดยไม่ต้องเช็คเอง
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
          ))}
        </nav>
      </div>

      {/* ปุ่ม Logout ยังเป็นแค่ UI เฉยๆ ยังไม่ได้ผูก action จริง เพราะทั้งโปรเจกต์ยังไม่มีระบบ login */}
      <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
        <LogOut size={18} />
        ออกจากระบบ
      </button>
    </aside>
  );
}

export default StaffSidebar;

import { NavLink } from 'react-router-dom';
import { PawPrint, LayoutGrid, Archive, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/staff', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/staff/inventory', label: 'Inventory', icon: Archive },
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
            <p className="text-xs text-gray-400 leading-tight">PetStop Staff</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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

      <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default StaffSidebar;

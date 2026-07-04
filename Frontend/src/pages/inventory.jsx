import { useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ClipboardCheck,
  AlertTriangle,
  RefreshCcw,
  Pencil,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// จำลองข้อมูล (Mock Data) รอการเชื่อมต่อ Backend
const PRODUCTS = [
  {
    id: 'NK-SL-12-001',
    name: 'Nomad Kitchen: Salmon & Sweet Potato',
    subtitle: 'Dry Dog Food • 12 lb',
    category: 'Dry Food',
    status: 'In Stock',
    stock: 84,
  },
  {
    id: 'OH-BF-12-552',
    name: 'Oak & Harvest: Organic Beef & Rice',
    subtitle: 'Premium Dry Food • 12 lb',
    category: 'Organic',
    status: 'Low Stock',
    stock: 12,
  },
  {
    id: 'BW-CK-12-890',
    name: 'Barkwell: Chicken & Garden Veg',
    subtitle: 'Grain-Free Mix • 12 lb',
    category: 'Grain Free',
    status: 'Out of Stock',
    stock: 0,
  },
  {
    id: 'PS-PY-05-121',
    name: 'PetStop Essential: Puppy Formula',
    subtitle: 'Starter Kibble • 5 lb',
    category: 'Dry Food',
    status: 'In Stock',
    stock: 210,
  },
];

const STATUS_STYLES = {
  'In Stock': 'text-green-600',
  'Low Stock': 'text-yellow-700',
  'Out of Stock': 'text-red-600',
};

const STATUS_DOT = {
  'In Stock': 'bg-green-500',
  'Low Stock': 'bg-yellow-600',
  'Out of Stock': 'bg-red-500',
};

function StatCard({ bgClass, icon, tag, value, label }) {
  return (
    <div className={`rounded-2xl p-6 ${bgClass}`}>
      <div className="mb-6 flex items-start justify-between text-gray-700">
        {icon}
        <span className="text-xs text-gray-500">{tag}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
}

function Inventory() {
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="-m-6 min-h-screen bg-[#FEFAE0] p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 max-w-md text-gray-500">
              Monitor, update, and manage product stock levels for your warehouse.
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU or name..."
              className="w-72 rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <StatCard
            bgClass="bg-other"
            icon={<ClipboardCheck size={22} />}
            tag="+12 this week"
            value="1,284"
            label="Total SKU Items"
          />
          <StatCard
            bgClass="bg-primary"
            icon={<AlertTriangle size={22} />}
            tag="Requires attention"
            value="24"
            label="Low Stock Alerts"
          />
          <StatCard
            bgClass="bg-gray-100"
            icon={<RefreshCcw size={22} />}
            tag="Updated 2m ago"
            value="342"
            label="Orders Fulfilled Today"
          />
        </div>

        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Stock Level</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                        <ImageIcon size={20} />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.id}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-primary/40 px-3 py-1 text-xs text-gray-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 font-medium ${STATUS_STYLES[p.status]}`}>
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[p.status]}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.stock} units</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-700">
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-6 text-sm text-gray-500">
            <span>
              Showing 1 to {filteredProducts.length} of 1,284 entries
            </span>
            <div className="flex items-center gap-2">
              <button className="rounded p-1 hover:bg-gray-50">
                <ChevronLeft size={16} />
              </button>
              <button className="rounded-md bg-primary px-3 py-1 font-medium text-gray-900">1</button>
              <button className="rounded-md px-3 py-1 hover:bg-gray-50">2</button>
              <button className="rounded-md px-3 py-1 hover:bg-gray-50">3</button>
              <button className="rounded p-1 hover:bg-gray-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default Inventory;

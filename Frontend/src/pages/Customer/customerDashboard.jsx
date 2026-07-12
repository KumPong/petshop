import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInventory } from "../../services/inventory.service.js";

function CustomerDashboard() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    getInventory()
      .then((data) => setBestSellers(data.filter((item) => item.bestSeller).slice(0, 6)))
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-background text-gray-800">
      {/* Hero Section */}
      <section className="relative h-125 bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: "url('https://via.placeholder.com/1500x500?text=Hero+Image')" }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Quality Time for Your Best Friend</h1>
          <p className="text-lg mb-8">Discover our exclusive range of organic treats and eco-friendly toys designed for lasting happiness</p>
        </div>
      </section>

      {/* Categories and Promos */}
      <section className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Area - Temporarily using a placeholder for the large image */}
          <div className="md:col-span-2 bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-full" style={{ backgroundImage: "url('https://via.placeholder.com/900x400?text=Main+Content')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* The main hero section already covers this, so this div can be simplified or removed based on final design */}
            <h2 className="text-3xl font-bold text-gray-800"></h2>
            <p className="text-gray-600"></p>
          </div>

          {/* Side Promos */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-secondary rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Nutritious Bites</h3>
              <p className="text-gray-700">Premium food up to 20% off</p>
            </div>
            <div className="bg-other rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Cozy Corners</h3>
              <p className="text-gray-700">Find the perfect bed for naps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Best Seller</h2>
          <Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-primary hover:underline">Explore All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {bestSellers.map((item) => (
            <Link key={item.id} to={`/products/${item.id}`} className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-3 overflow-hidden">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                }
              </div>
              <p className="text-sm font-medium text-center line-clamp-2">{item.name}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default CustomerDashboard;

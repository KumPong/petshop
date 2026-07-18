import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInventory } from "../../services/inventory.service.js";
import { getBestSellers } from "../../services/product.service.js";
import PromoBanner from "../../assets/promo-banner.png"

function CustomerDashboard() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    Promise.all([getInventory(), getBestSellers()])
      .then(([inventory, topSellers]) => {
        const topItems = topSellers
          .slice(0, 5)
          .map(({ productId }) => inventory.find(i => i.productId === productId))
          .filter(Boolean);
        setBestSellers(topItems);
      })
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-background text-gray-800">
      {/* Hero Section */}
      <section className="relative h-125 bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: "url('/hero-pets.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Quality Time for Your Best Friend</h1>
          <p className="text-lg mb-8">ค้นพบความพิเศษของขนมออร์แกนิกและของเล่นที่เป็นมิตรต่อสิ่งแวดล้อม ที่คัดสรรมาเพื่อความสุขที่ยาวนาน</p>
        </div>
      </section>

      {/* Categories and Promos */}
      <section className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className="md:col-span-2 rounded-lg shadow-md p-8 flex flex-col justify-center h-full relative overflow-hidden group min-h-75" 
            style={{ backgroundImage: `url(${PromoBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* แผ่นฟิล์มสีดำจางๆ ช่วยให้ตัวหนังสือสีขาวอ่านง่ายขึ้น ไม่กลืนไปกับรูป */}
            <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition-opacity"></div>
            
            {/* ข้อความบนรูป */}
            <div className="relative z-10 text-white max-w-md ml-4">
              <h2 className="text-4xl font-bold mb-3 drop-shadow-md">Playtime Essentials</h2>
              <p className="text-lg mb-6 drop-shadow-md">
                เติมเต็มทุกช่วงเวลาสนุกด้วยของเล่นเสริมทักษะ คอลเลกชันใหม่ล่าสุดสำหรับเพื่อนซี้สี่ขาของคุณ
              </p>
              <Link 
                to="/products/accessories" 
                className="inline-block bg-primary text-black font-semibold px-6 py-2.5 rounded-full hover:bg-secondary transition shadow-sm"
              >
                ช้อปคอลเลกชันของเล่น
              </Link>
            </div>
          </div>

          {/* Side Promos */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-secondary rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Nutritious Bites</h3>
              <p className="text-gray-700">อาหารเกรดพรีเมียม</p>
            </div>
            <div className="bg-other rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Cozy Corners</h3>
              <p className="text-gray-700">ค้นหาที่นอนที่เหมาะที่สุดสำหรับการงีบหลับ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Best Seller</h2>
          <Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-500 hover:underline">Explore All</Link>
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

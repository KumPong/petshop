import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Logo from "../assets/Logo.png"

function Navbar() {
    // จำลอง State สำหรับการ Login (ค่าเริ่มต้นให้เป็น false คือยังไม่ Login)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // State สำหรับจัดการ Dropdown แบบกดคลิก
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [IsProfileOpen, setIsProfileOpen] = useState(false);

    // จำลองข้อมูลตะกร้าสินค้า (ในของจริงคุณอาจจะดึงมาจาก Context API หรือ Redux)
    // พอ Logout ไป ข้อมูลนี้ยังอยู่ แต่เราแค่เช็คเงื่อนไขไม่ให้แสดงผล
    const [cartItems, setCartItems] = useState([]);

    // ระบบค้นหา
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSeartchOpen] = useState(false);
    const searchRef = useRef(null) // ไว้เช็คการคลิกนอกกรอบ

    // สร้าง State สำหรับเก็บข้อมูลสินค้าที่จะดึงจาก Backend
    const [products, setProducts] = useState([]);

    // เตรียม useEffect สำหรับ Fetch ข้อมูลจาก Backend
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                /*
                const response = await fetch('http://localhost:XXXX/api/products'); // ใส่ URL ของ Backend
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data); // นำข้อมูลจาก JSON มาใส่ใน State
                }
                */
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล", error)
            }
        };

        fetchProduct();
    }, [])

    // ฟังก์ชั่น ค้นหา
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setIsSeartchOpen(false);
            return;
        }

        setIsSeartchOpen(true);

        // เช็คคำกว้างๆ
        const isDogFoodKeyword = ["อาหารหมา", "อาหารสุนัข", "หมา", "สุนัข"].some((kw) => 
            query.toLowerCase().includes(kw)
        );

        const finalResults = isDogFoodKeyword 
            // ถ้าหาหมวดหมู่ ให้ดึงเฉพาะ ประเภท เรียงตามยอดขาย จากมากไปน้อย
            ? products
                .filter((p) => p.category === "อาหารหมา")
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5)
            // ถ้าเป็นการพิมแบบเจาะจงสินค้า 
            : products
            .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
    

        setSearchResults(finalResults);
    };

    // ปิดกล่องค้นหาเมื่อคลิกจุดอื่น
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSeartchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ฟังก์ชันจำลองการ Login / Logout
    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsProfileOpen(false);
        setIsCartOpen(false);
    };

    // ฟังก์ชันจำลองการชำระเงิน (เคลียร์ตะกร้า)
    const handleCheckout = () => {
        setCartItems([]);
        setIsCartOpen(false);
        alert("ชำระเงินแล้ว");
    };


    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-secondary shadow-sm border-b border-gray-200">
            {/* Logo */}
            <div className="shrink-0">
                <Link>
                    <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                </Link>
            </div>
            
            {/* menu */}
            <div className="flex gap-8 font-medium">
                <Link to='/' className="hover:text-green-700 hover:underline transition-all">
                    หน้าแรก
                </Link>

                {/* Dropdown */}
                <div className="relative group">
                    <Link to='/products' className="hover:text-green-700 hover:underline transition-all pb-4">
                        รายการสินค้า
                    </Link>
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full mt-1 w-48 bg-other border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <ul>
                            <li><Link to='/products/dogs' className="block px-4 py-2 hover:bg-background rounded-lg text-sm">สินค้าสุนัข</Link></li>
                            <li><Link to='/products/cats' className="block px-4 py-2 hover:bg-background rounded-lg text-sm">สินค้าแมว</Link></li>
                            <li><Link to='/products/accessories' className="block px-4 py-2 hover:bg-background rounded-lg text-sm">อุปกรณ์อื่นๆ</Link></li>
                        </ul>
                    </div>
                </div>

                <Link to='/tracking' className="hover:text-green-700 hover:underline transition-all">
                    ติดตามสินค้า
                </Link>
            </div>

            {/* Search, Profile and Cart */}
            <div className="flex items-center gap-4 shrink-0">
                
                {/* Search */}
                <div className="relative" ref={searchRef}>
                    <input 
                        type="text"
                        onChange={handleSearch}
                        onFocus={() => searchQuery.trim() && setIsSeartchOpen(true)}
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-orange-50 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-orange-200 w-48"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>

                    {/* Dropdown Result Search */}
                    {isSearchOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-md shadow-lg z-50 overflow-hidden">
                            {searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                onClick={() => setIsSeartchOpen(false)}
                                            >
                                                <span className="text-sm text-gray-700 truncate w-3/4">{product.name}</span>
                                                <span className="text-xs font-semibold text-green-700">฿{product.price}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    ไม่พบสินค้าที่คุณค้นหา
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile or Login/Register */}
                {isLoggedIn ? (
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!IsProfileOpen)}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        {IsProfileOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-md shadow-lg z-50">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to='/profile'
                                            onClick={() => setIsProfileOpen(false)}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                        >
                                            Setting
                                        </Link>
                                    </li>
                                    <li><hr className="my-1 border-gray-100"/></li>
                                    <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">Logout</button></li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={handleLogin} className="text-sm font-medium hover:underline px-2">
                        Login / Register
                    </button>
                )}

                {/* Cart Button & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="flex items-center gap-2 bg-secondary hover:bg-other text-black px-4 py-2 rounded-md transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">Cart</span>
                        {/* Show Count in Cart */}
                        {isLoggedIn && cartItems.length > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-2 -right-2">
                                {cartItems.length}
                            </span>
                        )}
                    </button>

                    {/* Cart DropDown */}
                    {isCartOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-md shadow-lg z-50 p-4">
                            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">ตะกร้าสินค้าของคุณ</h3>

                            {!isLoggedIn || cartItems.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">ตะกร้าสินค้าว่างเปล่า</p>
                            ) : (
                                <div className="space-y-3">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate w-3/4">{item.name}</span>
                                            <span className="font-medium w-1/4 text-right">${item.price}</span>
                                        </div>
                                    ))}
                                    <hr className="my-2"/>
                                    <div className="flex justify-between font-bold text-sm mb-4">
                                        <span>ยอดรวม:</span>
                                        <span>฿{cartItems.reduce((acc, curr) => acc + curr.price, 0)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-secondary hover:bg-other text-black py-2 rounded-md transition text-sm font-medium"
                                    >
                                        ไปหน้าชำระเงิน
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Logo from "../assets/Logo.png";

function Navbar() {
    const navigate = useNavigate();

    // State สำหรับการ Login 
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    // State สำหรับจัดการ Dropdown แบบกดคลิก
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [IsProfileOpen, setIsProfileOpen] = useState(false);

    // จำลองข้อมูลตะกร้าสินค้า
    const [cartItems, setCartItems] = useState([]);

    // โหลดตะกร้าจาก localStorage เมื่อ component mount
    useEffect(() => {
        const loadCart = () => {
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const parsed = JSON.parse(savedCart);
                    setCartItems(parsed);
                } else {
                    setCartItems([]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartItems([]);
            }
        };

        loadCart();

        // ฟังการเปลี่ยนแปลงใน localStorage (เมื่ออื่น tab เปลี่ยนแปลง)
        const handleStorageChange = (e) => {
            if (e.key === 'cart') {
                loadCart();
            }
        };

        // สร้าง custom event listener สำหรับการอัพเดตตะกร้าจากหน้าเดียวกัน
        const handleCustomCartUpdate = () => {
            loadCart();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdated', handleCustomCartUpdate);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', handleCustomCartUpdate);
        };
    }, []); // เอา setCartItems ออกจาก dependency เพราะเป็น stable reference

    // ฟังก์ชันปรับจำนวนสินค้า
    const handleUpdateQuantity = (e, targetId, change) => {
        e.preventDefault();
        e.stopPropagation(); // ป้องกันการคลิกแล้วไปปิด Dropdown
        const updatedCart = cartItems.map(item => {
            const currentId = item.productId || item.id;
            if (currentId === targetId) {
                const newQuantity = item.quantity + change;
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated')); 
    };

    // ฟังก์ชันลบสินค้าออกจากตะกร้า
    const handleRemoveItem = (e, targetId) => {
        e.preventDefault();
        e.stopPropagation(); // ป้องกันการคลิกแล้วไปปิด Dropdown
        const updatedCart = cartItems.filter(item => (item.productId || item.id) !== targetId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // ระบบค้นหา
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSeartchOpen] = useState(false);
    const searchRef = useRef(null);

    // สร้าง State สำหรับเก็บข้อมูลสินค้าที่จะดึงจาก Backend
    const [products, setProducts] = useState([]);

    // State สำหรับเก็บรูปโปรไฟล์
    const [profileImage, setProfileImage] = useState(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.profileImage || null;
    });

    // เตรียม useEffect สำหรับ Fetch ข้อมูลจาก Backend
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                /*
                const response = await fetch('http://localhost:XXXX/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
                */
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล", error);
            }
        };

        fetchProduct();
    }, []);

    // เช็กและอัปเดตรูปโปรไฟล์
    useEffect(() => {
        const updateImage = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) setProfileImage(user.profileImage);
        };

        // ดักฟังเมื่อมีการสลับ Tab
        window.addEventListener('storage', updateImage);
        // ดักฟัง Custom Event เวลาเราเปลี่ยนรูปในหน้าเว็บเดียวกัน
        window.addEventListener('profileUpdated', updateImage); 
        
        updateImage();

        return () => {
            window.removeEventListener('storage', updateImage);
            window.removeEventListener('profileUpdated', updateImage);
        };
    }, []);

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

        const isDogFoodKeyword = ["อาหารหมา", "อาหารสุนัข", "หมา", "สุนัข"].some((kw) => 
            query.toLowerCase().includes(kw)
        );

        const finalResults = isDogFoodKeyword 
            ? products
                .filter((p) => p.category === "อาหารหมา")
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5)
            : products
                .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);

        setSearchResults(finalResults);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsSeartchOpen(false);
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
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

    // ฟังก์ชันจำลองการ Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setIsProfileOpen(false);
        setIsCartOpen(false);
        navigate('/');
        window.location.reload();
    };

    // ฟังก์ชันจำลองการชำระเงิน (ไปหน้า Payment)
    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
            navigate('/login');
            return;
        }
        navigate('/payment');
        setIsCartOpen(false);
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-secondary shadow-sm border-b border-gray-200">
            {/* Logo */}
            <div className="shrink-0">
                <Link to='/'>
                    <img src={Logo} alt="PetStop" className="h-8 cursor-pointer" />
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
                        value={searchQuery}
                        onChange={handleSearch}
                        onKeyDown={handleSearchKeyDown}
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
                            className="rounded-full hover:bg-primary transition flex items-center justify-center overflow-hidden"
                        >
                            {/* เช็กว่ามีรูปไหม ถ้ามีก็โชว์รูป ถ้าไม่มีก็โชว์ SVG เดิม */}
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
                                    alt="Profile"
                                    className="w-8 h-8 object-cover rounded-full" 
                                />
                            ) : (
                                <div className="p-2">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        {IsProfileOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-other border border-gray-200 rounded-md shadow-lg z-50">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to='/profile'
                                            onClick={() => setIsProfileOpen(false)}
                                            className="block w-full text-left px-4 py-2 hover:bg-background text-sm"
                                        >
                                            Setting
                                        </Link>
                                    </li>
                                    <li><hr className="my-1 border-gray-100"/></li>
                                    <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-background text-sm text-red-600">Logout</button></li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to='/login' className="text-sm font-medium hover:underline px-2">
                        Login / Register
                    </Link>
                )}

                {/* Cart Button & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="flex items-center gap-2 hover:bg-primary text-black px-4 py-2 rounded-md transition"
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
                        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-100 rounded-md shadow-lg z-50 p-4">
                            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">ตะกร้าสินค้าของคุณ</h3>

                            {!isLoggedIn || cartItems.length === 0 ? (
                                <p className="text-sm text-gray-600 text-center py-4">ตะกร้าสินค้าว่างเปล่า</p>
                            ) : (
                                <div className="space-y-3">
                                    {cartItems.map((item) => {
                                        const itemId = item.productId || item.id; 
                                        return (
                                            <div key={itemId} className="flex justify-between items-center text-sm border-b border-gray-100 py-3 first:pt-0">
                                                
                                                {/* ชื่อสินค้า และ ปุ่ม + - */}
                                                <div className="flex-1 pr-4">
                                                    <p className="truncate font-medium text-gray-800">{item.name}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center border border-gray-200 rounded-md">
                                                            <button 
                                                                onClick={(e) => handleUpdateQuantity(e, itemId, -1)}
                                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center text-xs font-medium text-gray-700">{item.quantity}</span>
                                                            <button 
                                                                onClick={(e) => handleUpdateQuantity(e, itemId, 1)}
                                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ราคา และ ปุ่มลบ (ถังขยะ) */}
                                                <div className="flex flex-col items-end justify-between h-full gap-2">
                                                    <span className="font-semibold text-green-700">
                                                        ฿{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => handleRemoveItem(e, itemId)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                        title="ลบสินค้า"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <hr className="my-2"/>
                                    <div className="flex justify-between font-bold text-sm mb-4">
                                        <span>ยอดรวม:</span>
                                        <span>${cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}</span>
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
}

export default Navbar;
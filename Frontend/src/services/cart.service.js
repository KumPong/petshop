// ตะกร้าสินค้าฝั่ง client — เก็บใน localStorage (key 'cart') ใช้ร่วมกันระหว่าง navbar.jsx, productDetail.jsx,
// productListing.jsx และ payment.jsx เพื่อให้เป็นแหล่งข้อมูลเดียวกัน
// item shape: { productId, name, price, image, quantity }

// ฟังก์ชันช่วยหาชื่อกล่องเก็บตะกร้า (Key)
const getCartKey = () => {
    const userString = sessionStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        return `cart_${user.id}`; // ถ้าล็อกอินแล้ว ใช้ชื่อตะกร้าของคนๆ นั้น (เช่น cart_CPS0001)
    }
    return 'cart_guest'; // ถ้ายังไม่ล็อกอิน ใช้ตะกร้ารวมของ Guest
};

// ดึงข้อมูลตะกร้า
export function getCart() {
  try {
    const key = getCartKey();
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

// บันทึกตะกร้าและแจ้ง navbar (และหน้าอื่นในแท็บเดียวกัน) ให้อัปเดตผ่าน custom event
// เพราะ event 'storage' ของเบราว์เซอร์ไม่ยิงในแท็บที่เป็นคนเปลี่ยนค่าเอง
export function saveCart(cart) {
  const key = getCartKey();
  localStorage.setItem(key, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  return cart;
}

// เพิ่มสินค้าลงตะกร้า
export function addToCart(product, quantity = 1) {
  // ต้องใช้ productId (PD-xxx จาก product.json) ไม่ใช่ id/sku ของ inventory —
  // order.controller.js เช็คสต็อกด้วย productId เท่านั้น ถ้าไม่มี productId ส่งมาจะ fallback ไปใช้ id (เผื่อ caller เก่า)
  const productId = product.productId || product.id;
  const cart = getCart();
  const existing = cart.find((item) => (item.productId || item.id) === productId);
  // ถ้า caller ส่ง stock มาด้วย (เช่นจากหน้ารายการ/รายละเอียดสินค้า) ใช้จำกัดไม่ให้เพิ่มเกินของจริง
  const maxQty = typeof product.stock === 'number' ? product.stock : Infinity;

  if (existing) {
    existing.quantity = Math.min(maxQty, existing.quantity + quantity);
  } else {
    cart.push({ productId, name: product.name, price: product.price, image: product.image, quantity: Math.min(maxQty, quantity) });
  }
  return saveCart(cart);
}

// เคลียร์ตะกร้า (ของคนที่ล็อกอินอยู่ตอนนั้น)
export function clearCart() {
  return saveCart([]);
}

// ฟังก์ชันโอนตะกร้า (เรียกใช้ตอน Login สำเร็จ)
export function mergeCartAfterLogin(userId) {
  // ดูดของจากตะกร้า Guest
  const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];

  if (guestCart.length > 0) {
    // เตรียมเปิดกล่องตะกร้าของ User
    const userKey = `cart_${userId}`;
    let userCart = JSON.parse(localStorage.getItem(userKey)) || [];

    // เอาของมาเทรวมกัน
    guestCart.forEach(guestItem => {
      const guestItemId = guestItem.productId || guestItem.id;
      const existing = userCart.find(item => (item.productId || item.id) === guestItemId);

      if (existing) {
        existing.quantity += guestItem.quantity; // ถ้าของซ้ำ ให้บวกจำนวน
      } else {
        userCart.push(guestItem); // ถ้าของใหม่ ให้ยัดใส่เลย
      }
    });

    // เซฟลงตะกร้าส่วนตัว แล้วทำลายตะกร้า Guest ทิ้ง
    localStorage.setItem(userKey, JSON.stringify(userCart));
    localStorage.removeItem('cart_guest');
    window.dispatchEvent(new Event('cartUpdated'));
  }
}


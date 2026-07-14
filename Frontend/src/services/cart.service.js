// ตะกร้าสินค้าฝั่ง client — เก็บใน localStorage (key 'cart') ใช้ร่วมกันระหว่าง navbar.jsx, productDetail.jsx,
// productListing.jsx และ payment.jsx เพื่อให้เป็นแหล่งข้อมูลเดียวกัน
// item shape: { productId, name, price, image, quantity }

const CART_KEY = 'cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// บันทึกตะกร้าและแจ้ง navbar (และหน้าอื่นในแท็บเดียวกัน) ให้อัปเดตผ่าน custom event
// เพราะ event 'storage' ของเบราว์เซอร์ไม่ยิงในแท็บที่เป็นคนเปลี่ยนค่าเอง
export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  return cart;
}

export function addToCart(product, quantity = 1) {
  // ต้องใช้ productId (PD-xxx จาก product.json) ไม่ใช่ id/sku ของ inventory —
  // order.controller.js เช็คสต็อกด้วย productId เท่านั้น ถ้าไม่มี productId ส่งมาจะ fallback ไปใช้ id (เผื่อ caller เก่า)
  const productId = product.productId || product.id;
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name: product.name, price: product.price, image: product.image, quantity });
  }
  return saveCart(cart);
}

export function clearCart() {
  return saveCart([]);
}

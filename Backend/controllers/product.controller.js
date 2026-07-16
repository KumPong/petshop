import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_PATH = path.join(__dirname, '..', 'data', 'product.json');
const INVENTORY_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

async function readProducts() {
  const raw = await readFile(PRODUCT_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeProducts(items) {
  await writeFile(PRODUCT_PATH, JSON.stringify(items, null, 2));
}

// เดา segment ลูกค้า (หมา/แมว/อุปกรณ์อื่นๆ) จากคำอธิบาย/หมวดหมู่ — หน้า productListing.jsx ฝั่งลูกค้ากรองด้วย
// field นี้ (item['id-type']) ไม่มีช่องให้เลือกตรงๆ ในฟอร์ม Add Product เลยต้องเดาจากข้อความแทน
function deriveIdType(category, text) {
  const t = (text || '').toLowerCase();
  if (t.includes('แมว')) return 'cats';
  if (t.includes('สุนัข') || t.includes('หมา')) return 'dogs';
  if (category === 'อาหารแห้ง' || category === 'อาหารเปียก') return 'dogs';
  return 'accessories';
}

async function readInventory() {
  const raw = await readFile(INVENTORY_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeInventory(items) {
  await writeFile(INVENTORY_PATH, JSON.stringify(items, null, 2));
}

// GET /api/products — ส่ง products ทั้งหมด พร้อม join ข้อมูล sku/stock จาก inventory
export async function getProducts(req, res) {
  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);
  const result = products.map((p) => {
    const inv = inventory.find((i) => i.productId === p.productId) || null;
    return {
      ...p,
      imageUrl: p.imageUrl || inv?.image || null,
      sku: inv?.sku || null,
      stock: inv?.stock ?? null,
      threshold: inv?.threshold ?? null,
      cost: inv?.unitCost ?? null,
      inventoryId: inv?.id || null,
      specifications: inv?.specifications || {},
      careInstructions: inv?.careInstructions || [],
    };
  });
  res.json(result);
}

// GET /api/products/:id — ดึงสินค้าชิ้นเดียวพร้อมข้อมูล inventory (รวม specifications และ careInstructions)
export async function getProduct(req, res) {
  const { id } = req.params;
  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);
  // ค้นหาจาก productId ก่อน ถ้าไม่พบให้ลองค้นจาก inventory id/SKU
  let product = products.find((p) => p.productId === id);
  let inv = null;
  if (!product) {
    inv = inventory.find((i) => i.id === id || i.sku === id) || null;
    if (inv) product = products.find((p) => p.productId === inv.productId) || null;
  } else {
    inv = inventory.find((i) => i.productId === product.productId) || null;
  }
  if (!product) return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });
  res.json({
    ...product,
    sku: inv?.sku || null,
    stock: inv?.stock ?? null,
    threshold: inv?.threshold ?? null,
    cost: inv?.unitCost ?? null,
    image: inv?.image || product.imageUrl || null,
    specifications: inv?.specifications || {},
    careInstructions: inv?.careInstructions || [],
  });
}

// POST /api/products — สร้างสินค้าใหม่ พร้อมสร้าง inventory entry อัตโนมัติ
// body: { name, description, price, category, status?, imageUrl?, sku?, stock?, threshold?, cost?, specifications?, careInstructions? }
export async function createProduct(req, res) {
  const { name, description, price, category, status = 'Active', imageUrl, sku, stock = 0, threshold = 10, cost, specifications, careInstructions } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'name, price และ category จำเป็นต้องมี' });
  }

  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);

  // สร้าง productId ถัดไปจากเลขสูงสุดที่มีอยู่
  const maxNum = products.reduce((max, p) => {
    const n = parseInt(p.productId?.replace('PD-', '') || '0', 10);
    return n > max ? n : max;
  }, 0);
  const productId = `PD-${String(maxNum + 1).padStart(3, '0')}`;

  // ใช้ SKU ที่ส่งมา ถ้าไม่มีให้ใช้ productId แทน
  const resolvedSku = (sku && sku.trim()) ? sku.trim().toUpperCase() : productId;

  const newProduct = { productId, name, description: description || '', price: Number(price), category, status, imageUrl: imageUrl || null };
  products.push(newProduct);

  // สร้าง inventory entry ใหม่พร้อมกัน
  const newInventoryEntry = {
    id: resolvedSku,
    sku: resolvedSku,
    productId,
    name,
    category,
    stock: Math.max(0, Number(stock)),
    threshold: Math.max(0, Number(threshold)),
    lastUpdated: new Date().toISOString(),
    image: imageUrl || null,
    // ถ้าไม่ส่ง cost มา fallback เป็นราคาขาย กัน money()/report พังเพราะ unitCost undefined
    unitCost: cost !== undefined && cost !== '' ? Number(cost) : Number(price),
    'id-type': deriveIdType(category, `${name} ${description || ''}`),
    specifications: specifications || {},
    careInstructions: Array.isArray(careInstructions) ? careInstructions : [],
  };
  inventory.push(newInventoryEntry);

  await Promise.all([writeProducts(products), writeInventory(inventory)]);
  res.status(201).json({ ...newProduct, sku: resolvedSku, stock: newInventoryEntry.stock, threshold: newInventoryEntry.threshold });
}

// PUT /api/products/:id — แก้ไขสินค้า
export async function updateProduct(req, res) {
  const { id } = req.params;
  const products = await readProducts();
  const idx = products.findIndex((p) => p.productId === id);
  if (idx === -1) return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });

  const { name, description, price, category, status, imageUrl, cost, stock, threshold, specifications, careInstructions } = req.body;
  if (name !== undefined) products[idx].name = name;
  if (description !== undefined) products[idx].description = description;
  if (price !== undefined) products[idx].price = Number(price);
  if (category !== undefined) products[idx].category = category;
  if (status !== undefined) products[idx].status = status;
  if (imageUrl !== undefined) products[idx].imageUrl = imageUrl;

  // sync ชื่อ, หมวดหมู่, รูป, ต้นทุน, สต็อก, threshold, specifications และ careInstructions ไปยัง inventory
  const inventory = await readInventory();
  const invIdx = inventory.findIndex((i) => i.productId === id);
  if (invIdx !== -1) {
    if (name !== undefined) inventory[invIdx].name = name;
    if (category !== undefined) inventory[invIdx].category = category;
    if (imageUrl !== undefined) inventory[invIdx].image = imageUrl;
    if (cost !== undefined && cost !== '') inventory[invIdx].unitCost = Number(cost);
    if (stock !== undefined && stock !== '') inventory[invIdx].stock = Math.max(0, Number(stock));
    if (threshold !== undefined && threshold !== '') inventory[invIdx].threshold = Math.max(0, Number(threshold));
    if (specifications !== undefined) inventory[invIdx].specifications = specifications;
    if (careInstructions !== undefined) inventory[invIdx].careInstructions = Array.isArray(careInstructions) ? careInstructions : [];
    if (name !== undefined || description !== undefined || category !== undefined) {
      inventory[invIdx]['id-type'] = deriveIdType(
        category ?? inventory[invIdx].category,
        `${name ?? inventory[invIdx].name} ${description ?? ''}`
      );
    }
    inventory[invIdx].lastUpdated = new Date().toISOString();
    await Promise.all([writeProducts(products), writeInventory(inventory)]);
  } else {
    await writeProducts(products);
  }

  res.json(products[idx]);
}

// DELETE /api/products/:id — ลบสินค้า
export async function deleteProduct(req, res) {
  const { id } = req.params;
  const products = await readProducts();
  const idx = products.findIndex((p) => p.productId === id);
  if (idx === -1) return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });

  const [removed] = products.splice(idx, 1);

  // ลบ inventory entry ที่ผูกกับ product นี้ออกด้วย
  const inventory = await readInventory();
  const filteredInventory = inventory.filter((i) => i.productId !== id);

  await Promise.all([writeProducts(products), writeInventory(filteredInventory)]);
  res.json({ message: 'ลบสินค้าสำเร็จ', removed });
}

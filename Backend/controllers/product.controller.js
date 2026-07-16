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
      sku: inv?.sku || null,
      stock: inv?.stock ?? null,
      threshold: inv?.threshold ?? null,
      inventoryId: inv?.id || null,
    };
  });
  res.json(result);
}

// GET /api/products/:id — ดึงสินค้าชิ้นเดียวพร้อมข้อมูล inventory
export async function getProduct(req, res) {
  const { id } = req.params;
  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);
  const product = products.find((p) => p.productId === id);
  if (!product) return res.status(404).json({ message: `ไม่พบสินค้า id "${id}"` });
  const inv = inventory.find((i) => i.productId === id) || null;
  res.json({ ...product, sku: inv?.sku || null, stock: inv?.stock ?? null, threshold: inv?.threshold ?? null });
}

// POST /api/products — สร้างสินค้าใหม่ พร้อมสร้าง inventory entry อัตโนมัติ
// body: { name, description, price, category, status?, imageUrl?, sku?, stock?, threshold? }
export async function createProduct(req, res) {
<<<<<<< Updated upstream
  const { name, description, price, category, status = 'Active', imageUrl, sku, stock = 0, threshold = 10 } = req.body;
=======
  const { name, description, price, category, status = 'Active', imageUrl, sku, stock = 0, threshold = 10, cost, specifications, careInstructions } = req.body;
>>>>>>> Stashed changes
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

  const newProduct = { productId, name, description: description || '', price: Number(price), category, status, imageUrl: imageUrl || null, specifications: specifications || {}, careInstructions: careInstructions || [] };
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

<<<<<<< Updated upstream
  const { name, description, price, category, status, imageUrl } = req.body;
=======
  const { name, description, price, category, status, imageUrl, cost, specifications, careInstructions } = req.body;
>>>>>>> Stashed changes
  if (name !== undefined) products[idx].name = name;
  if (description !== undefined) products[idx].description = description;
  if (price !== undefined) products[idx].price = Number(price);
  if (category !== undefined) products[idx].category = category;
  if (status !== undefined) products[idx].status = status;
  if (imageUrl !== undefined) products[idx].imageUrl = imageUrl;
  if (specifications !== undefined) products[idx].specifications = specifications;
  if (careInstructions !== undefined) products[idx].careInstructions = careInstructions;

  // sync ชื่อและหมวดหมู่ไปยัง inventory entry ที่ผูกกับ productId นี้
  const inventory = await readInventory();
  const invIdx = inventory.findIndex((i) => i.productId === id);
  if (invIdx !== -1) {
    if (name !== undefined) inventory[invIdx].name = name;
    if (category !== undefined) inventory[invIdx].category = category;
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

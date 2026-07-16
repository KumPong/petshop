import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getBestSellers } from '../controllers/product.controller.js';

const router = Router();

// ตั้งค่าที่เก็บไฟล์รูปภาพสินค้า (pattern เดียวกับ uploads/Profile ใน user.route.js)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/Products/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'Product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/products/upload-image — อัปโหลดรูปสินค้า คืน URL ที่เข้าถึงได้จริงผ่าน static /uploads
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `http://localhost:4000/uploads/Products/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

router.get('/best-sellers', getBestSellers);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

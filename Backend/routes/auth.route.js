import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { login, register, getProfile, updateProfile, changePassword, getAddresses, updateAddresses } from '../controllers/auth.controller.js';

const router = Router();

// สร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี
const uploadDir = 'uploads/Profile';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer ให้บันทึกรูปลงโฟลเดอร์
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir) },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'Profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage});

// API สำหรับอัปโหลด
router.post('/upload-profile', upload.single('image'), (req, res) => {
    if(!req.file) return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
    // ส่ง URL เต็มของรูปกลับไปให้หน้าบ้าน
    res.json({ imageUrl: `http://localhost:4000/uploads/Profile/${req.file.filename}` });
});

// สำหรับ Customer สมัครสมาชิก (POST /api/auth/register)
router.post('/register', register);

// สำหรับทุกคนเข้าสู่ระบบ (POST /api/auth/login)
router.post('/login', login);

// สำหรับดึง Profile (GET /api/auth/profile)
router.get('/profile', getProfile);

// สำหรับบันทึกข้อมูล (PUT /api/auth/profile)
router.put('/profile', updateProfile);

// สำหรับเปลี่ยนรหัสผ่าน
router.put('/change-password', changePassword);

// สำหรับดึง Address (GET /api/auth/Addresses)
router.get('/addresses', getAddresses);

// สำหรับบันทึก Addresses (PUT /api/auth/Addresses)
router.put('/addresses', updateAddresses);

export default router;
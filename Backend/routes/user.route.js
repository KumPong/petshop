import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = Router();

// ตั้งค่าที่เก็บไฟล์รูปภาพ
const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/Profile/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'User-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// API อัปโหลดรูปภาพ
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const imageUrl = `http://localhost:4000/uploads/Profile/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

// API สำหรับจัดการ User
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
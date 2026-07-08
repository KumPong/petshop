import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';

const router = Router();

// สำหรับ Customer สมัครสมาชิก (POST /api/auth/register)
router.post('/register', register);

// สำหรับทุกคนเข้าสู่ระบบ (POST /api/auth/login)
router.post('/login', login);

export default router;
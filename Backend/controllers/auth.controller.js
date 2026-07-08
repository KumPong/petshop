import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userFilePath = path.join(__dirname, '../data/user.json');

const readUsers = () => {
    const data = fs.readFileSync(userFilePath, 'utf-8');
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
};

// API Register only Customer
export const register = (req, res) => {
    try {
        // รับข้อมูลจากหน้าเว็บ
        const { firstName, lastName, email, phone, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน "});
        }

        const users = readUsers();

        // Run Id
        const newId = `PS${String(users.length + 1).padStart(4, '0')}`;

        // Create Customer
        const newUser = {
            id: newId,
            firstName: firstName || "",
            lastName: lastName || "",
            email,
            phone: phone || "",
            password,
            role: "Customer", // บังคับให้เป็น Customer เสมอ
            status: "ACTIVE"
        };

        users.push(newUser);
        writeUsers(users);

        // ส่งข้อมูลกลับไปแบบไม่รวมรหัสผ่าน
        res.status(201).json({
            message: "สมัครสมาชิกสำเร็จ",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// API Login (All)
export const login = (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
        }

        const users = readUsers();

        // ค้นหาผู้ใช้ที่อีเมลและรหัสผ่านตรงกัน
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง "});
        }

        // พนักงานให้อยู่ได้ 1 วัน ส่วนลูกค้าให้อยู่ได้ 30 วัน
        const expiresIn = (user.role === "Manager" || user.role === 'Staff') ? '1d' : '30d'

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            'YOUR_SECRET_KEY_PETSTOP',
            { expiresIn: expiresIn }
        );

        res.status(200).json({
            message: "เข้าสู่ระบบสำเร็จ",
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

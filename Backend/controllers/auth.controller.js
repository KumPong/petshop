import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { profile } from 'console';

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
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            },
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ดึงข้อมูล Profile (ต้องใช้ Token ยืนยัน)
export const getProfile = (req, res) => {
    try {
        // ดึง Token จาก Header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "ไม่พบ Token ยืนยันตัวตน"});
        }

        const token = authHeader.split(' ')[1];

        // แกะ Token ด้วย Secret Key ตัวเดียวกับตอน Login
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY_PETSTOP');

        // หาข้อมูล User จากไฟล์ user.json
        const users = readUsers();
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
        }

        // ส่งข้อมูลกลับไปให้ Frontend
        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage
        });

    } catch (error) {
        // ถ้า Token หมดอายุ หรือไม่ถูกต้อง
        res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ", error: error.message });
    }
};

// อัปเดตข้อมูล Profile
export const updateProfile = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "ไม่พบ Token ยืนยันตัวตน" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY_PETSTOP');

        const users = readUsers();
        // หาตำแหน่ง (Index) ของ User คนนี้ใน Array
        const userIndex = users.findIndex(u => u.id === decoded.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
        }

        // รับข้อมูลใหม่ที่ส่งมาจากหน้าบ้าน
        const { firstName, lastName, phone, email, profileImage } = req.body;

        // อัปเดตค่าลงใน Array
        if (firstName) users[userIndex].firstName = firstName;
        if (lastName) users[userIndex].lastName = lastName;
        if (phone !== undefined) users[userIndex].phone = phone;
        if (email) users[userIndex].email = email;
        if (profileImage) users[userIndex].profileImage = profileImage;

        // บันทึกกลับลงไฟล์ user.json
        writeUsers(users);

        res.status(200).json({
            message: "อัปเดตข้อมูลสำเร็จ",
            user: {
                id: users[userIndex].id,
                firstName: users[userIndex].firstName,
                lastName: users[userIndex].lastName,
                email: users[userIndex].email,
                phone: users[userIndex].phone,
                role: users[userIndex].role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// เปลี่ยนรหัสผ่าน
export const changePassword = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "ไม่พบ Token ยืนยันตัวตน" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY_PETSTOP');

        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === decoded.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
        }

        const { oldPassword, newPassword} = req.body;

        // เช็กรหัสผ่านเก่าว่าตรงกับในฐานข้อมูลไหม
        if (users[userIndex].password !== oldPassword) {
            return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        // อัปเดตรหัสผ่านใหม่
        users[userIndex].password = newPassword;
        writeUsers(users);

        res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAddresses = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "ไม่พบ Token ยืนยันตัวตน" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY_PETSTOP');

        const users = readUsers();
        const user = users.find(u => u.id === decoded.id);

        if (!user) return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });

        res.status(200).json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateAddresses = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "ไม่พบ Token ยืนยันตัวตน" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY_PETSTOP');

        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === decoded.id);

        if (userIndex === -1) return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });

        const { addresses } = req.body;
        users[userIndex].addresses = addresses;

        writeUsers(users);
        res.status(200).json({ message: "อัปเดตที่อยู่สำเร็จ", addresses: users[userIndex].addresses });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
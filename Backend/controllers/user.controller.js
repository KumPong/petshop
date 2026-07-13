import fs from 'fs';
import path from 'path';

const userFilePath = path.join(process.cwd(), 'data', 'user.json');

// ฟังก์ชันอ่านไฟล์ JSON
const readUsers = () => {
    if (!fs.existsSync(userFilePath)) return [];
    const data = fs.readFileSync(userFilePath, 'utf-8');
    return JSON.parse(data);
};

// ฟังก์ชันเขียนไฟล์ JSON
const writeUsers = (data) => {
    fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// ดึงข้อมูล User ทั้งหมด
export const getAllUsers = (req, res) => {
    try {
        const users = readUsers();
        
        // กรองข้อมูล เอาแค่คนที่มี Role เป็น Manager หรือ Staff เท่านั้น
        // ลูกค้า (Customer) จะไม่ถูกส่งไปที่ Frontend เลย ระบบจะได้ไม่หนัก
        const staffOnly = users.filter(u => u.role === 'Manager' || u.role === 'Staff');
        
        res.status(200).json(staffOnly);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// สร้าง User ใหม่ (พร้อมรันรหัส PS000X อัตโนมัติ)
export const createUser = (req, res) => {
    try {
        const users = readUsers();
        const newUser = req.body;

        if (users.some(u => u.email === newUser.email)) {
            return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น" })
        }

        const staffUsers = users.filter(u => u.id.startsWith('PS') && !u.id.startsWith('CPS'));

        // หารหัสล่าสุด แล้วบวก 1
        let newId = "PS0001"
        if (staffUsers.length > 0) {
            const lastUser = staffUsers[staffUsers.length - 1];
            const lastIdNum = parseInt(lastUser.id.replace('PS', ''));
            newId = `PS${String(lastIdNum + 1).padStart(4, '0')}`;
        }

        const userToSave = {
            id: newId,
            ...newUser
        };

        users.push(userToSave);

        writeUsers(users);
        res.status(200).json({ message: "สร้างผู้ใช้สำเร็จ", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// ไล่ออก
export const deleteUser = (req, res) => {
    try {
        const users = readUsers();
        const { id } = req.params;

        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานในระบบ" });
        }

        users[index].status = "LEAVE";

        writeUsers(users);
        res.status(200).json({ message: "ไล่พนักงานออกสำเร็จ" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
}

// อัปเดตข้อมูล User
export const updateUser = (req, res) => {
    try {
        const users = readUsers();
        const { id } = req.params;
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

        // อัปเดตข้อมูลทับของเดิม (ถ้ามีรูปใหม่มาก็ทับรูปเดิม)
        users[index] = { ...users[index], ...req.body };

        writeUsers(users);
        res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ", user: users[index] });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};
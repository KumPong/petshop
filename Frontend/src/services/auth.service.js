import api from './api.js';

// Service Login
export const loginUser = async (Credentials) => {
    // ใช้ api.post จะได้ต่อกับ Base URL ที่ตั้งไว้ใน api.js อัตโนมัติ
    const response = await api.post('/auth/login', Credentials);
    return response.data;
};

// Service Register
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};
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

// Service Profile
export const getUserProfile = async (token) => {
    const response = await api.get('/auth/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

// Service Update Profile
export const updateUserProfile = async (token, profileData) => {
    const response = await api.put('/auth/profile', profileData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

// Service Change-Password
export const changeUserPassword = async (token, passwordData) => {
    const response = await api.put('/auth/change-password', passwordData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/auth/upload-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // ต้องใช้ header นี้สำหรับการส่งไฟล์
    });
    return response.data;
}
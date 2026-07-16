import api from './api';

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const respose = await api.put(`/users/${id}`, userData);
    return respose.data;
};

// ฟังก์ชันส่งไฟล์รูปไป Backend
export const uploadUserImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};
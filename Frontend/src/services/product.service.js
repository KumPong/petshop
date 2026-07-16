import api from './api.js';

export async function getProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function getBestSellers() {
  const { data } = await api.get('/products/best-sellers');
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
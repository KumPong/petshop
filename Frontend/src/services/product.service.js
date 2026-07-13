import api from './api.js';

export async function getProducts() {
  const { data } = await api.get('/products');
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

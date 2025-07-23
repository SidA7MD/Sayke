// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Project endpoints
export const projectAPI = {
  getAll: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
  
  // Material endpoints
  getMaterials: (projectId) => api.get(`/projects/${projectId}/materials`),
  addMaterial: (projectId, data) => api.post(`/projects/${projectId}/materials`, data),
  deleteMaterial: (projectId, materialId) => api.delete(`/projects/${projectId}/materials/${materialId}`),
};

export default api;
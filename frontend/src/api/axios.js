// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout for PDF generation
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

// Project endpoints
export const projectAPI = {
  // Standard CRUD operations
  getAll: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
  
  // PDF Export endpoints - Fixed to match backend routes
  exportProjectPDF: (projectId) => {
    console.log('Exporting project PDF for:', projectId);
    return api.get(`/projects/${projectId}/export/project-report`, { 
      responseType: 'blob',
      timeout: 60000, // Extended timeout for PDF generation
      headers: {
        'Accept': 'application/pdf'
      }
    });
  },
  
  exportMaterialsPDF: (projectId) => {
    console.log('Exporting materials PDF for:', projectId);
    return api.get(`/projects/${projectId}/export/materials-list`, { 
      responseType: 'blob',
      timeout: 60000, // Extended timeout for PDF generation
      headers: {
        'Accept': 'application/pdf'
      }
    });
  },
  
  // Legacy method for backward compatibility
  exportPDF: (projectId) => {
    console.log('⚠️ projectAPI.exportPDF is deprecated, use exportProjectPDF instead');
    return projectAPI.exportProjectPDF(projectId);
  },
  
  // Legacy methods for backward compatibility (redirect to materialAPI)
  getMaterials: (projectId) => {
    console.log('⚠️ projectAPI.getMaterials is deprecated, use materialAPI.getByProject instead');
    return materialAPI.getByProject(projectId);
  },
  addMaterial: (projectId, data) => {
    console.log('⚠️ projectAPI.addMaterial is deprecated, use materialAPI.create instead');
    return materialAPI.create({ ...data, projectId });
  },
  deleteMaterial: (projectId, materialId) => {
    console.log('⚠️ projectAPI.deleteMaterial is deprecated, use materialAPI.delete instead');
    return materialAPI.delete(materialId);
  },
};

// Material endpoints
export const materialAPI = {
  // Get materials by project
  getByProject: (projectId) => {
    console.log('materialAPI.getByProject called with:', projectId);
    return api.get(`/materials/project/${projectId}`);
  },
  
  // Get single material
  get: (materialId) => {
    console.log('materialAPI.get called with:', materialId);
    return api.get(`/materials/${materialId}`);
  },
  
  // Create material
  create: (data) => {
    console.log('materialAPI.create called with:', data);
    return api.post('/materials', data);
  },
  
  // Update material
  update: (materialId, data) => {
    console.log('materialAPI.update called with:', materialId, data);
    return api.put(`/materials/${materialId}`, data);
  },
  
  // Delete material
  delete: (materialId) => {
    console.log('materialAPI.delete called with:', materialId);
    return api.delete(`/materials/${materialId}`);
  },
  
  // Get material statistics
  getStats: (projectId) => {
    console.log('materialAPI.getStats called with:', projectId);
    return api.get(`/materials/project/${projectId}/stats`);
  },
};

// Utility function to handle file downloads
export const downloadUtils = {
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  
  generateFilename: (projectName, type, extension = 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const cleanName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${cleanName}_${type}_${timestamp}.${extension}`;
  }
};

// Debug: Log what's being exported
console.log('API exports:', { 
  projectAPI: Object.keys(projectAPI), 
  materialAPI: Object.keys(materialAPI),
  downloadUtils: Object.keys(downloadUtils)
});

export default api;
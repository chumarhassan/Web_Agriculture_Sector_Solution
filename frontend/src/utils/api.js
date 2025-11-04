import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me')
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  getPrices: (id, params) => api.get(`/items/${id}/prices`, { params }),
  compare: (itemIds, region, days = 7) => 
    api.get('/items/compare', { 
      params: { 
        itemIds: Array.isArray(itemIds) ? itemIds.join(',') : itemIds, 
        region, 
        days 
      } 
    })
};

// Admin API
export const adminAPI = {
  createItem: (data) => api.post('/admin/items', data),
  updateItem: (id, data) => api.put(`/admin/items/${id}`, data),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
  bulkUploadPrices: (data) => api.post('/admin/prices/bulk', data),
  getStats: () => api.get('/admin/stats')
};

// Weather API
export const weatherAPI = {
  getWeather: (city) => api.get('/weather', { params: { city } })
};

// Advice API
export const adviceAPI = {
  getAdvice: (params) => api.get('/advice', { params })
};

// Forum API
export const forumAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`)
};

export default api;

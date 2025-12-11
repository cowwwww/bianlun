import axios from 'axios';

// API base URL - this should point to your backend server
// For Vite, use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


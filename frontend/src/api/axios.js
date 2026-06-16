import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    if (location.pathname !== '/login') location.href = '/login';
  }
  return Promise.reject(err);
});

export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default api;

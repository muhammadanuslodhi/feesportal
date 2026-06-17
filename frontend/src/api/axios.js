import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanApiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

const api = axios.create({
  baseURL: cleanApiUrl + '/api',
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

export const API_ORIGIN = cleanApiUrl;
export default api;

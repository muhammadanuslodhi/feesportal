import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanApiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

console.log('🔌 API Configuration:');
console.log('  Raw URL:', rawApiUrl);
console.log('  Clean URL:', cleanApiUrl);
console.log('  Base URL:', cleanApiUrl + '/api');

const api = axios.create({
  baseURL: cleanApiUrl + '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log outgoing request
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
    hasToken: !!token,
    origin: window.location.origin
  });
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      origin: window.location.origin
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle CORS errors
    if (error.message === 'Network Error' && !error.response) {
      console.error('🚨 CORS Error or Network Failure');
      console.error('   Frontend:', window.location.origin);
      console.error('   Backend:', cleanApiUrl);
    }

    return Promise.reject(error);
  }
);

export const API_ORIGIN = cleanApiUrl;
export default api;

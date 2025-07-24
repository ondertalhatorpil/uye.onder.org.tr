import axios from 'axios';

// Base API URL - backend port 5000'de çalışıyor
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const UPLOADS_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'https://uye.onder.org.tr';

// Axios instance oluştur
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dernek_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi ve token kontrolü
api.interceptors.response.use(
  (response) => {
    // Backend'den gelen successful response'ları direkt döndür
    return response.data; // { success: true, user: {...}, token: "..." }
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // 401 - Unauthorized (token geçersiz/süresi dolmuş)
    if (error.response?.status === 401) {
      localStorage.removeItem('dernek_token');
      localStorage.removeItem('dernek_user');
      
      // Login sayfasına yönlendir (sadece eğer şu anda login sayfasında değilsek)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Backend'den gelen error response'u döndür
    const errorMessage = error.response?.data?.error || 'Bir hata oluştu';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;
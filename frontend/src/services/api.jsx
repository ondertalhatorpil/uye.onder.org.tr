import axios from 'axios';

// Base API URL - backend port 5000'de çalışıyor
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://uye.onder.org.tr/api';

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

// ===== AUTH SERVICE =====
export const authService = {
  // Kullanıcı girişi
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Token'ı localStorage'a kaydet
    if (response.success && response.token) {
      localStorage.setItem('dernek_token', response.token);
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // Token'ı localStorage'a kaydet
    if (response.success && response.token) {
      localStorage.setItem('dernek_token', response.token);
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // KVKK metinlerini getir - DÜZELTİLDİ
  getKvkkTexts: async () => {
    const response = await api.get('/auth/kvkk-texts');
    return response;
  },

  // Profil bilgilerini getir
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    
    // User bilgilerini güncelle
    if (response.success && response.user) {
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Profil güncelle
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    
    // User bilgilerini güncelle
    if (response.success && response.user) {
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem('dernek_token');
    localStorage.removeItem('dernek_user');
    window.location.href = '/login';
  },

  // Token kontrolü
  isAuthenticated: () => {
    const token = localStorage.getItem('dernek_token');
    const user = localStorage.getItem('dernek_user');
    return !!(token && user);
  },

  // Mevcut kullanıcıyı getir
  getCurrentUser: () => {
    const userStr = localStorage.getItem('dernek_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Token'ı getir
  getToken: () => {
    return localStorage.getItem('dernek_token');
  }
};

// ===== CONSTANTS SERVICE =====
export const constantsService = {
  // İller
  getIller: async () => {
    return await api.get('/constants/iller');
  },

  // İlçeler (il parametresi ile)
  getIlceler: async (il) => {
    return await api.get(`/constants/ilceler/${encodeURIComponent(il)}`);
  },

  // Dernekler (il ve ilçe parametresi ile)
  getDerneklerByLocation: async (il, ilce = null) => {
    const endpoint = ilce 
      ? `/constants/dernekler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}`
      : `/constants/dernekler/${encodeURIComponent(il)}`;
    return await api.get(endpoint);
  },

  // Sektörler
  getSektorler: async () => {
    return await api.get('/constants/sektorler');
  },

  // Komisyonlar
  getKomisyonlar: async () => {
    return await api.get('/constants/komisyonlar');
  }
};

// ===== USER SERVICE =====
export const userService = {
  // Kullanıcı arama
  searchUsers: async (filters) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/users/search?${params}`);
  },

  // Kullanıcı detayı
  getUserById: async (userId) => {
    return await api.get(`/users/${userId}`);
  },

  // Dernek üyeleri
  getUsersByDernek: async (dernekAdi) => {
    return await api.get(`/users/by-dernek/${encodeURIComponent(dernekAdi)}`);
  }
};

// ===== DERNEK SERVICE =====
export const dernekService = {
  // Dernek listesi
  getDernekler: async () => {
    return await api.get('/dernekler');
  },

  // Dernek detayı
  getDernekById: async (dernekId) => {
    return await api.get(`/dernekler/${dernekId}`);
  },

  // Dernek profil sayfası
  getDernekProfile: async (dernekAdi) => {
    return await api.get(`/dernekler/profile/${encodeURIComponent(dernekAdi)}`);
  },

  getMyDernek: async () => {
  return await api.get('/dernekler/my-dernek');
  },

  // Kendi derneğini güncelle (dernek admin)
  updateMyDernek: async (dernekData) => {
    return await api.put('/dernekler/my-dernek', dernekData);
  },

  // Logo yükle
  uploadLogo: async (formData) => {
    return await api.post('/dernekler/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // YENİ: Konum güncelleme fonksiyonu
  updateDernekLocation: async (locationData) => {
    return await api.put('/dernekler/my-dernek/location', locationData);
  },

  // Konum bilgili dernekleri getir (harita için)
  getDerneklerWithLocation: async () => {
    return await api.get('/dernekler/dernekler/with-location');
  }
};

// ===== FAALIYET SERVICE =====
export const faaliyetService = {
  // Faaliyet listesi
  getFaaliyetler: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/faaliyetler?${params}`);
  },

  // Faaliyet oluştur
  createFaaliyet: async (faaliyetData) => {
    return await api.post('/faaliyetler', faaliyetData);
  },

  // Faaliyet güncelle
  updateFaaliyet: async (faaliyetId, faaliyetData) => {
    return await api.put(`/faaliyetler/${faaliyetId}`, faaliyetData);
  },

  // Faaliyet sil
  deleteFaaliyet: async (faaliyetId) => {
    return await api.delete(`/faaliyetler/${faaliyetId}`);
  },

  // Kendi faaliyetleri
  getMyFaaliyetler: async () => {
    return await api.get('/faaliyetler/my-posts');
  },

  // Faaliyet görselleri yükle
  uploadImages: async (formData) => {
    return await api.post('/faaliyetler/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// ===== ADMIN SERVICE =====
export const adminService = {
  // Dashboard istatistikleri
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  // Kullanıcı yönetimi
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/users?${params}`);
  },

  // Dernek admin atama
  assignDernekAdmin: async (assignData) => {
    return await api.put('/admin/assign-dernek-admin', assignData);
  },

  // Excel'den dernek ekleme
  addDerneklerFromExcel: async (formData) => {
    return await api.post('/admin/dernekler', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Default export
export default api;
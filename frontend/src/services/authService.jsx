// src/services/authService.js
import { api } from './api';

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

  // KVKK metinlerini getir
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

  // Profil güncelle (form data ile - profil fotoğrafı desteği)
  updateProfile: async (profileData, profileImage = null) => {
    const formData = new FormData();
    
    
    // Tüm profil bilgilerini FormData'ya ekle
    Object.keys(profileData).forEach(key => {
      const value = profileData[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    
    // Profil fotoğrafı varsa ekle
    if (profileImage) {
      formData.append('profil_fotografi', profileImage);
      console.log('FormData appended: profil_fotografi =', profileImage.name);
    }
    
    // FormData içeriğini kontrol et
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    // FormData için özel API çağrısı (Content-Type header'ı otomatik ayarlanacak)
    const token = localStorage.getItem('dernek_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    try {
      // DİKKAT: /api eklemeyin çünkü apiUrl zaten /api içeriyor
      console.log('Making fetch request to:', `${apiUrl}/auth/profile`);
      
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type header'ı eklemeyin, FormData otomatik ayarlar
        },
        body: formData
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Response body:', result);
      
      // User bilgilerini güncelle
      if (result.success && result.user) {
        localStorage.setItem('dernek_user', JSON.stringify(result.user));
      }
      
      return result;
      
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Profil güncellenirken hata oluştu: ' + error.message
      };
    }
  },

  // Sadece profil bilgilerini güncelle (fotoğraf olmadan)
  updateProfileData: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    
    // User bilgilerini güncelle
    if (response.success && response.user) {
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Profil fotoğrafını sil
  deleteProfileImage: async () => {
    const token = localStorage.getItem('dernek_token');
    
    try {
      // DİKKAT: apiUrl zaten /api içeriyor, bu yüzden /api eklemeyin
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/profile/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      // Başarılıysa kullanıcı bilgilerini güncelle
      if (result.success) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.profil_fotografi = null;
          localStorage.setItem('dernek_user', JSON.stringify(currentUser));
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('Delete profile image error:', error);
      return {
        success: false,
        error: 'Profil fotoğrafı silinirken hata oluştu: ' + error.message
      };
    }
  },

  // Profil fotoğrafı URL'sini oluştur
  getProfileImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    // Eğer tam URL ise direkt döndür
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Relatif path ise API URL ile birleştir
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // VITE_API_URL zaten /api içeriyorsa, onu kaldırıp base URL'i al
    const cleanBaseUrl = baseUrl.replace('/api', '');
    return `${cleanBaseUrl}/${imagePath}`;
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
  },

  // Dosya boyutu kontrolü
  validateImageFile: (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      return { valid: false, error: 'Dosya seçilmedi' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Sadece resim dosyaları (JPG, PNG, GIF, WebP) yüklenebilir' };
    }
    
    return { valid: true };
  }
};

// Default export
export default authService;
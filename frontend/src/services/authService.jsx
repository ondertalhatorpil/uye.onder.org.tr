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
  
  console.log('📤 Frontend updateProfile çağrıldı');
  console.log('📋 Profil verisi:', profileData);
  console.log('🖼️ Profil resmi var mı?', !!profileImage);
  
  // Sadece değişen ve boş olmayan profil bilgilerini FormData'ya ekle
  // EĞİTİM VERİLERİNİ GÖNDERME - backend mevcut değerleri koruyor
  const allowedFields = [
    'isim', 'soyisim', 'dogum_tarihi', 'sektor', 'meslek', 
    'telefon', 'il', 'ilce', 'gonullu_dernek', 'calisma_komisyon'
  ];
  
  allowedFields.forEach(key => {
    const value = profileData[key];
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
      console.log(`✅ FormData'ya eklendi: ${key} = ${value}`);
    }
  });
  
  // Profil fotoğrafı varsa ekle
  if (profileImage) {
    formData.append('profil_fotografi', profileImage);
    console.log('📸 FormData appended: profil_fotografi =', profileImage.name);
  }
  
  // FormData içeriğini kontrol et
  console.log('📦 FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  // NOT: Eğitim verilerini GÖNDERMİYORUZ - backend mevcut değerleri koruyor
  console.log('ℹ️ Eğitim verileri gönderilmedi - backend mevcut değerleri koruyor');
  
  // FormData için özel API çağrısı (Content-Type header'ı otomatik ayarlanacak)
  const token = localStorage.getItem('dernek_token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  try {
    console.log('🌐 Making fetch request to:', `${apiUrl}/auth/profile`);
    
    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // Content-Type header'ı eklemeyin, FormData otomatik ayarlar
      },
      body: formData
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📥 Response body:', result);
    
    // User bilgilerini güncelle
    if (result.success && result.user) {
      localStorage.setItem('dernek_user', JSON.stringify(result.user));
      console.log('✅ User bilgileri localStorage\'da güncellendi');
      
      // Eğitim verilerinin korunduğunu logla
      console.log('🎓 Korunan eğitim verileri:', {
        ortaokul_id: result.user.ortaokul_id,
        ortaokul_custom: result.user.ortaokul_custom,
        ortaokul_mezun_yili: result.user.ortaokul_mezun_yili,
        lise_id: result.user.lise_id,
        lise_custom: result.user.lise_custom,
        lise_mezun_yili: result.user.lise_mezun_yili,
        universite_durumu: result.user.universite_durumu,
        universite_adi: result.user.universite_adi,
        universite_bolum: result.user.universite_bolum,
        universite_mezun_yili: result.user.universite_mezun_yili
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    // VITE_API_URL zaten /api içeriyorsa, onu kaldırıp base URL'i al
    const cleanBaseUrl = baseUrl.replace('/api', '');
    return `${cleanBaseUrl}/${imagePath}`;
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  // GİZLİLİK AYARLARI - YENİ FONKSİYONLAR
  // Gizlilik ayarlarını getir
  getPrivacySettings: async () => {
    const response = await api.get('/auth/privacy-settings');
    return response;
  },

  // Gizlilik ayarlarını güncelle
  updatePrivacySettings: async (privacyData) => {
    const response = await api.put('/auth/privacy-settings', privacyData);
    
    // Başarılıysa kullanıcı bilgilerini güncelle (gizlilik ayarları dahil)
    if (response.success && response.data) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Kullanıcı nesnesine gizlilik ayarlarını ekle
        currentUser.show_email = response.data.show_email;
        currentUser.show_phone = response.data.show_phone;
        localStorage.setItem('dernek_user', JSON.stringify(currentUser));
      }
    }
    
    return response;
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
// src/services/dernekService.js
import { api } from './api';

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

export default dernekService;
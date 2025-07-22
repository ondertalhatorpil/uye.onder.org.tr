// src/services/faaliyetService.js
import { api } from './api';

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

export default faaliyetService;
// src/services/faaliyetService.js
import { api } from './api';

export const faaliyetService = {
  // ==================== MEVCUT FONKSİYONLAR ====================
  
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
  },

  // ==================== YENİ: BEĞENİ FONKSİYONLARI ====================
  
  // Beğen/Beğeniyi kaldır (toggle)
  toggleBegeni: async (faaliyetId) => {
    return await api.post(`/faaliyetler/${faaliyetId}/begeni`);
  },

  // Beğenenleri listele
  getBegeniler: async (faaliyetId, page = 1, limit = 20) => {
    return await api.get(`/faaliyetler/${faaliyetId}/begeniler?page=${page}&limit=${limit}`);
  },

  // ==================== YENİ: YORUM FONKSİYONLARI ====================
  
  // Yorum ekle
  createYorum: async (faaliyetId, yorum) => {
    return await api.post(`/faaliyetler/${faaliyetId}/yorum`, { yorum });
  },

  // Yorumları listele
  getYorumlar: async (faaliyetId, page = 1, limit = 20) => {
    return await api.get(`/faaliyetler/${faaliyetId}/yorumlar?page=${page}&limit=${limit}`);
  },

  // Yorum sil
  deleteYorum: async (yorumId) => {
    return await api.delete(`/faaliyetler/yorum/${yorumId}`);
  },

  // ==================== YENİ: İSTATİSTİK FONKSİYONLARI ====================
  
  // Faaliyet etkileşim istatistikleri
  getFaaliyetInteractions: async (faaliyetId) => {
    return await api.get(`/faaliyetler/${faaliyetId}/interactions`);
  },

  // Kullanıcı etkileşim istatistikleri
  getUserInteractionStats: async (userId) => {
    return await api.get(`/faaliyetler/user-stats/${userId}`);
  }
};

export default faaliyetService;
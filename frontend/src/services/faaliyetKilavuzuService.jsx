// src/services/faaliyetKilavuzuService.js
import { api } from './api';

export const faaliyetKilavuzuService = {
  // Tüm faaliyetleri getir
  getAll: async () => {
    return await api.get('/faaliyet-kilavuzu');
  },

  // Dün-bugün-yarın faaliyetleri
  getDunBugunYarin: async () => {
    return await api.get('/faaliyet-kilavuzu/dun-bugun-yarin');
  },

  // Haftalık faaliyetler
  getHaftalik: async () => {
    return await api.get('/faaliyet-kilavuzu/haftalik');
  },

  // Belirli tarihteki faaliyet
  getByDate: async (date) => {
    return await api.get(`/faaliyet-kilavuzu/tarih/${date}`);
  },

  // Tarih aralığında faaliyetler
  getByDateRange: async (startDate, endDate) => {
    return await api.get(`/faaliyet-kilavuzu/tarih-aralik?startDate=${startDate}&endDate=${endDate}`);
  },

  // ID ile faaliyet getir
  getById: async (id) => {
    return await api.get(`/faaliyet-kilavuzu/${id}`);
  },

  // ADMIN FONKSİYONLARI
  
  // Yeni faaliyet oluştur
  create: async (faaliyetData) => {
    return await api.post('/faaliyet-kilavuzu', faaliyetData);
  },

  // Faaliyet güncelle
  update: async (id, faaliyetData) => {
    return await api.put(`/faaliyet-kilavuzu/${id}`, faaliyetData);
  },

  // Faaliyet sil
  delete: async (id) => {
    return await api.delete(`/faaliyet-kilavuzu/${id}`);
  },

  // İstatistikler (Admin)
  getStats: async () => {
    return await api.get('/faaliyet-kilavuzu/admin/stats');
  }
};

export default faaliyetKilavuzuService;
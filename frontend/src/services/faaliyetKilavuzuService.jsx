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
  
  // Yeni faaliyet oluştur (görsel ile)
  create: async (faaliyetData) => {
    const formData = new FormData();
    
    formData.append('tarih', faaliyetData.tarih);
    formData.append('etkinlik_adi', faaliyetData.etkinlik_adi);
    
    // İçerik opsiyonel
    if (faaliyetData.icerik) {
      formData.append('icerik', faaliyetData.icerik);
    }
    
    // Görsel varsa ekle
    if (faaliyetData.gorsel) {
      formData.append('gorsel', faaliyetData.gorsel);
    }
    
    return await api.post('/faaliyet-kilavuzu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Faaliyet güncelle (görsel ile)
  update: async (id, faaliyetData) => {
    const formData = new FormData();
    
    formData.append('tarih', faaliyetData.tarih);
    formData.append('etkinlik_adi', faaliyetData.etkinlik_adi);
    
    // İçerik opsiyonel
    if (faaliyetData.icerik) {
      formData.append('icerik', faaliyetData.icerik);
    }
    
    // Yeni görsel varsa ekle
    if (faaliyetData.gorsel) {
      formData.append('gorsel', faaliyetData.gorsel);
    }
    
    // Görsel silinmek isteniyorsa
    if (faaliyetData.remove_image) {
      formData.append('remove_image', 'true');
    }
    
    return await api.put(`/faaliyet-kilavuzu/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
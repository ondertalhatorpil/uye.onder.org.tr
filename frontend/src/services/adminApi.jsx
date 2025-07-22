// src/services/adminApi.js
import { api } from './api';

export const adminApi = {
  
  // Dashboard ana istatistikleri
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  // Sistem ayarları
  getSystemSettings: async () => {
    return await api.get('/admin/settings');
  },

  // Kullanıcı segmentasyonu
  getUserSegments: async () => {
    return await api.get('/analytics/segments/users');
  },

  // Dernek segmentasyonu
  getDernekSegments: async () => {
    return await api.get('/analytics/segments/dernekler');
  },

  // Segment detayları
  getSegmentDetails: async (type, segment) => {
    return await api.get(`/analytics/segments/${type}/${segment}/details`);
  },

  // ===== KULLANICI YÖNETİMİ =====
  
  // Tüm kullanıcılar (filtrelenebilir)
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/users?${params}`);
  },

  // Kullanıcı istatistikleri
  getUserStats: async () => {
    return await api.get('/users/admin/stats');
  },

  // Kullanıcı rol güncelleme
  updateUserRole: async (userId, roleData) => {
    return await api.put(`/admin/users/${userId}/role`, roleData);
  },

  // Kullanıcı silme
  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  },

  // Kullanıcı detaylı bilgi
  getUserDetails: async (userId) => {
    return await api.get(`/users/${userId}`);
  },

  // ===== DERNEK YÖNETİMİ =====
  
  // Tüm dernekler
  getAllDernekler: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/dernekler?${params}`);
  },

  // Dernek admin atama
  assignDernekAdmin: async (assignData) => {
    return await api.post('/admin/dernekler/assign-admin', assignData);
  },

  // Excel'den dernek ekleme
  uploadDernekExcel: async (formData) => {
    return await api.post('/admin/dernekler/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Dernek silme
  deleteDernek: async (dernekId) => {
    return await api.delete(`/admin/dernekler/${dernekId}`);
  },

  // Dernek detayları
  getDernekDetails: async (dernekId) => {
    return await api.get(`/dernekler/${dernekId}`);
  },

  // ===== FALİYET YÖNETİMİ =====
  
  // Tüm faaliyetler (admin görünümü)
  getAllFaaliyetler: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/faaliyetler?${params}`);
  },

  // Faaliyet silme (admin yetkisi)
  deleteFaaliyet: async (faaliyetId) => {
    return await api.delete(`/faaliyetler/${faaliyetId}`);
  },

  // Faaliyet istatistikleri
  getFaaliyetStats: async () => {
    return await api.get('/admin/faaliyetler/stats');
  },

  // ===== FALİYET ONAY SİSTEMİ (YENİ) =====
  
  // Bekleyen faaliyetleri getir
  getBekleyenFaaliyetler: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Sadece dolu olan filtreleri ekle
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/admin/faaliyetler/bekleyenler?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('getBekleyenFaaliyetler error:', error);
      throw error;
    }
  },

  // Faaliyet onaylama
  onaylaFaaliyet: async (faaliyetId) => {
    return await api.put(`/admin/faaliyetler/${faaliyetId}/onayla`);
  },

  // Faaliyet reddetme
  reddetFaaliyet: async (faaliyetId, redNedeni) => {
    return await api.put(`/admin/faaliyetler/${faaliyetId}/reddet`, {
      red_nedeni: redNedeni
    });
  },

  // Toplu faaliyet onaylama
  topluFaaliyetOnayla: async (faaliyetIds) => {
    return await api.post('/admin/faaliyetler/toplu-onayla', {
      faaliyet_ids: faaliyetIds
    });
  },

  // Faaliyet onay geçmişi
  getFaaliyetOnayGecmisi: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/faaliyetler/onay-gecmisi?${params}`);
  },

  // Faaliyet onay istatistikleri
  getFaaliyetOnayStats: async () => {
    return await api.get('/admin/faaliyetler/onay-stats');
  },

  // ===== RAPOR VE EXPORT =====
  
  // Kullanıcı raporu export
  exportUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/reports/users?${params}`, {
      responseType: 'blob'
    });
  },

  // Dernek raporu export
  exportDernekler: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/reports/dernekler?${params}`, {
      responseType: 'blob'
    });
  },

  // Faaliyet raporu export
  exportFaaliyetler: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/reports/faaliyetler?${params}`, {
      responseType: 'blob'
    });
  },

  // ===== TOPLU İŞLEMLER =====
  
  // Toplu kullanıcı silme
  bulkDeleteUsers: async (userIds) => {
    return await api.post('/admin/users/bulk-delete', { userIds });
  },

  // Toplu rol güncelleme
  bulkUpdateRoles: async (updates) => {
    return await api.post('/admin/users/bulk-update-roles', { updates });
  },

  // Toplu dernek silme
  bulkDeleteDernekler: async (dernekIds) => {
    return await api.post('/admin/dernekler/bulk-delete', { dernekIds });
  },

  // ===== SEARCH & FILTER =====
  
  // Gelişmiş kullanıcı arama
  searchUsers: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({
      search: searchTerm,
      ...filters
    }).toString();
    return await api.get(`/admin/users/search?${params}`);
  },

  // Gelişmiş dernek arama
  searchDernekler: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({
      search: searchTerm,
      ...filters
    }).toString();
    return await api.get(`/admin/dernekler/search?${params}`);
  },

  // Gelişmiş faaliyet arama
  searchFaaliyetler: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({
      search: searchTerm,
      ...filters
    }).toString();
    return await api.get(`/admin/faaliyetler/search?${params}`);
  },

  // ===== NOTIFICATION & MESSAGING =====
  
  // Tüm kullanıcılara bildirim gönder
  sendNotificationToAll: async (notificationData) => {
    return await api.post('/admin/notifications/send-all', notificationData);
  },

  // Belirli gruba bildirim gönder
  sendNotificationToGroup: async (groupData, notificationData) => {
    return await api.post('/admin/notifications/send-group', {
      group: groupData,
      notification: notificationData
    });
  },

  // ===== SYSTEM MONITORING =====
  
  // Sistem durumu
  getSystemStatus: async () => {
    return await api.get('/admin/system/status');
  },

  // Hata logları
  getErrorLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/system/logs?${params}`);
  },

  // Database istatistikleri
  getDatabaseStats: async () => {
    return await api.get('/admin/system/database-stats');
  },

  // ===== BACKUP & MAINTENANCE =====
  
  // Database backup
  createBackup: async () => {
    return await api.post('/admin/system/backup');
  },

  // Sistem bakım modu
  toggleMaintenanceMode: async (enabled) => {
    return await api.put('/admin/system/maintenance', { enabled });
  },

  // Cache temizleme
  clearCache: async () => {
    return await api.post('/admin/system/clear-cache');
  },

  // ===== HELPER FUNCTIONS =====
  
  // Download helper (Excel/PDF export için)
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Tarih formatı helper
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Sayı formatı helper
  formatNumber: (number) => {
    return number.toLocaleString('tr-TR');
  },

  // Faaliyet durumu helper
  getFaaliyetDurumText: (durum) => {
    switch (durum) {
      case 'beklemede':
        return 'Onay Bekliyor';
      case 'onaylandi':
        return 'Onaylandı';
      case 'reddedildi':
        return 'Reddedildi';
      default:
        return 'Bilinmeyen';
    }
  },

  // Faaliyet durumu renk helper
  getFaaliyetDurumColor: (durum) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'onaylandi':
        return 'bg-green-100 text-green-800';
      case 'reddedildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};

export default adminApi;
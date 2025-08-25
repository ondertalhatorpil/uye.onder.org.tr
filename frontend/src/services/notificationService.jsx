// services/notificationService.jsx
import { api } from './api';

export const notificationService = {

  // Kullanıcının bildirimlerini getir
  async getMyNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sadece_okunmamis) queryParams.append('sadece_okunmamis', params.sadece_okunmamis);

    const url = `/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await api.get(url);
  },

  // Okunmamış bildirim sayısını getir
  async getUnreadCount() {
    return await api.get('/notifications/unread-count');
  },

  // Bildirim detayını getir
  async getNotificationDetail(id) {
    return await api.get(`/notifications/${id}`);
  },

  // Bildirimi okundu olarak işaretle
  async markAsRead(id) {
    return await api.put(`/notifications/${id}/read`);
  },

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead() {
    return await api.put('/notifications/mark-all-read');
  },

  // ====== ADMİN FONKSİYONLARI ======

  // Admin bildirim gönder
  async sendNotification(notificationData) {
    return await api.post('/admin/notifications', notificationData);
  },

  // Admin'in gönderdiği bildirimleri listele
  async getMyAdminNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const url = `/admin/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await api.get(url);
  },

  // Bildirim istatistikleri (Admin)
  async getNotificationStats() {
    return await api.get('/admin/notifications/stats');
  },

  // Bildirimi sil (Admin)
  async deleteNotification(id) {
    return await api.delete(`/admin/notifications/${id}`);
  },


  // Bildirim tipine göre renk döndür
  getNotificationTypeColor(tip) {
    const colors = {
      'genel': 'blue',
      'duyuru': 'green', 
      'uyari': 'orange',
      'bilgi': 'cyan'
    };
    return colors[tip] || 'gray';
  },

  // Bildirim tipine göre icon döndür
  getNotificationTypeIcon(tip) {
    const icons = {
      'genel': 'bell',
      'duyuru': 'megaphone',
      'uyari': 'exclamation-triangle',
      'bilgi': 'info-circle'
    };
    return icons[tip] || 'bell';
  },

  // Tarihi formatla
  formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  // Bildirim içeriğini kırp
  truncateContent(content, maxLength = 100) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  },

  // Real-time notification için WebSocket bağlantısı (opsiyonel - gelecek için)
  // connectWebSocket() {
  //   // WebSocket implementasyonu buraya eklenebilir
  // }
};

// Default export
export default notificationService
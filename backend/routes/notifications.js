// routes/notifications.js
const express = require('express');
const {
  // Kullanıcı fonksiyonları
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationDetail
} = require('../controllers/notificationController');

const auth = require('../middleware/auth');

const router = express.Router();

// Tüm notification routes authentication gerektirir
router.use(auth);

// ====== KULLANICI ROUTEs ======

// Kullanıcının bildirimlerini getir
router.get('/', getMyNotifications);

// Okunmamış bildirim sayısı
router.get('/unread-count', getUnreadCount);

// Bildirim detayını getir
router.get('/:id', getNotificationDetail);

// Bildirimi okundu olarak işaretle
router.put('/:id/read', markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put('/mark-all-read', markAllAsRead);

module.exports = router;
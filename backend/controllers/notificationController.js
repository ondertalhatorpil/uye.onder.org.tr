// controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

// ====== KULLANICI FONKSİYONLARI ======

// Kullanıcının bildirimlerini getir
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      sadece_okunmamis = false
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sadece_okunmamis: sadece_okunmamis === 'true'
    };

    const result = await Notification.getForUser(userId, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });

  } catch (error) {
    console.error('Get my notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirimler getirilemedi: ' + error.message
    });
  }
};

// Bildirimi okundu olarak işaretle
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Notification.markAsRead(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Bildirim okundu olarak işaretlenemedi'
      });
    }

    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim işaretlenirken hata oluştu: ' + error.message
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.markAllAsReadForUser(userId);

    res.json({
      success: true,
      message: `${count} bildirim okundu olarak işaretlendi`,
      data: { count }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirimler işaretlenirken hata oluştu: ' + error.message
    });
  }
};

// Okunmamış bildirim sayısı
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Okunmamış bildirim sayısı alınamadı: ' + error.message
    });
  }
};

// ====== ADMİN FONKSİYONLARI ======

// Admin bildirim gönder
const sendNotification = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      baslik,
      icerik,
      tip = 'genel',
      hedef_kullanici_ids = null, // null = tüm kullanıcılar
      bitis_tarihi = null
    } = req.body;

    // Validasyon
    if (!baslik || baslik.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Bildirim başlığı gerekli'
      });
    }

    if (!icerik || icerik.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Bildirim içeriği gerekli'
      });
    }

    const validTips = ['genel', 'duyuru', 'uyari', 'bilgi'];
    if (!validTips.includes(tip)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz bildirim tipi. Geçerli tipler: ' + validTips.join(', ')
      });
    }

    // Hedef kullanıcılar varsa, geçerli olduklarını kontrol et
    if (hedef_kullanici_ids && Array.isArray(hedef_kullanici_ids) && hedef_kullanici_ids.length > 0) {
      for (const userId of hedef_kullanici_ids) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            error: `Geçersiz kullanıcı ID: ${userId}`
          });
        }
      }
    }

    // Bitiş tarihi kontrolü
    if (bitis_tarihi) {
      const bitisDate = new Date(bitis_tarihi);
      const now = new Date();
      
      if (bitisDate <= now) {
        return res.status(400).json({
          success: false,
          error: 'Bitiş tarihi gelecekte olmalıdır'
        });
      }
    }

    const notificationData = {
      baslik: baslik.trim(),
      icerik: icerik.trim(),
      tip,
      gonderici_admin_id: adminId,
      hedef_kullanici_ids: hedef_kullanici_ids && hedef_kullanici_ids.length > 0 ? hedef_kullanici_ids : null,
      bitis_tarihi
    };

    const notificationId = await Notification.create(notificationData);

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'Bildirim oluşturulamadı'
      });
    }

    // Hedef kullanıcı sayısını hesapla
    let hedefSayisi = 0;
    if (hedef_kullanici_ids && hedef_kullanici_ids.length > 0) {
      hedefSayisi = hedef_kullanici_ids.length;
    } else {
      // Tüm kullanıcı sayısını al
      const [userCount] = await require('../config/database').pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE role IN (?, ?)',
        ['uye', 'dernek_admin']
      );
      hedefSayisi = userCount[0].count;
    }

    res.json({
      success: true,
      message: `Bildirim başarıyla ${hedefSayisi} kullanıcıya gönderildi`,
      data: {
        id: notificationId,
        hedef_kullanici_sayisi: hedefSayisi
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim gönderilirken hata oluştu: ' + error.message
    });
  }
};

// Admin'in gönderdiği bildirimleri listele
const getMyNotificationsAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      page = 1,
      limit = 20
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await Notification.getByAdmin(adminId, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });

  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin bildirimleri getirilemedi: ' + error.message
    });
  }
};

// Bildirimi sil (Admin)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı'
      });
    }

    if (notification.gonderici_admin_id !== adminId) {
      return res.status(403).json({
        success: false,
        error: 'Bu bildirimi silmeye yetkiniz yok'
      });
    }

    const deleted = await Notification.delete(id, adminId);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        error: 'Bildirim silinemedi'
      });
    }

    res.json({
      success: true,
      message: 'Bildirim başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim silinirken hata oluştu: ' + error.message
    });
  }
};

// Bildirim istatistikleri (Admin)
const getNotificationStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const stats = await Notification.getStats(adminId);

    if (!stats) {
      return res.status(400).json({
        success: false,
        error: 'İstatistikler alınamadı'
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim istatistikleri alınamadı: ' + error.message
    });
  }
};

// Bildirim detayını getir
const getNotificationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı'
      });
    }

    // Kullanıcının bu bildirimi görme yetkisi var mı kontrol et
    let canView = false;

    // Tüm kullanıcılara gönderilmişse
    if (!notification.hedef_kullanici_ids) {
      canView = true;
    } 
    // Özel hedef kullanıcılar varsa
    else {
      const hedefKullanicilar = JSON.parse(notification.hedef_kullanici_ids);
      canView = hedefKullanicilar.includes(userId);
    }

    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Bu bildirimi görme yetkiniz yok'
      });
    }

    // Otomatik okundu işaretle
    await Notification.markAsRead(id, userId);

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Get notification detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Bildirim detayı alınamadı: ' + error.message
    });
  }
};

module.exports = {
  // Kullanıcı fonksiyonları
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationDetail,

  // Admin fonksiyonları
  sendNotification,
  getMyNotificationsAdmin,
  deleteNotification,
  getNotificationStats
};
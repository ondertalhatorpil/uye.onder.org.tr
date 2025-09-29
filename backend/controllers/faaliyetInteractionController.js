// controllers/faaliyetInteractionController.js
const FaaliyetInteraction = require('../models/FaaliyetInteraction');
const Faaliyet = require('../models/Faaliyet');

// ==================== BEĞENİ CONTROLLER'LARI ====================

// Faaliyet beğen/beğeniyi kaldır
const toggleBegeni = async (req, res) => {
  try {
    const { id } = req.params; // faaliyet id
    const userId = req.user.id;

    // Faaliyet var mı ve onaylı mı kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'onaylandi') {
      return res.status(403).json({
        success: false,
        error: 'Sadece onaylanmış faaliyetler beğenilebilir'
      });
    }

    // Beğen/beğeniyi kaldır
    const result = await FaaliyetInteraction.toggleBegeni(id, userId);

    // Güncel beğeni sayısını getir
    const begeniCount = await FaaliyetInteraction.getBegeniCount(id);

    res.json({
      success: true,
      action: result.action, // 'added' veya 'removed'
      begeni_sayisi: begeniCount,
      message: result.action === 'added' 
        ? 'Faaliyet beğenildi' 
        : 'Beğeni kaldırıldı'
    });

  } catch (error) {
    console.error('Toggle begeni error:', error);
    res.status(500).json({
      success: false,
      error: 'Beğeni işlemi gerçekleştirilemedi: ' + error.message
    });
  }
};

// Faaliyeti beğenen kullanıcıları listele
const getBegeniler = async (req, res) => {
  try {
    const { id } = req.params; // faaliyet id
    const { page = 1, limit = 20 } = req.query;

    // Faaliyet var mı kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await FaaliyetInteraction.getBegeniler(id, {
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: result.begeniler,
      pagination: {
        ...result.pagination,
        page: parseInt(page),
        totalPages: Math.ceil(result.pagination.total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get begeniler error:', error);
    res.status(500).json({
      success: false,
      error: 'Beğeniler getirilemedi: ' + error.message
    });
  }
};

// ==================== YORUM CONTROLLER'LARI ====================

// Yorum ekle
const createYorum = async (req, res) => {
  try {
    const { id } = req.params; // faaliyet id
    const { yorum } = req.body;
    const userId = req.user.id;

    // Yorum validasyonu
    if (!yorum || yorum.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Yorum boş olamaz'
      });
    }

    if (yorum.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Yorum çok uzun (maksimum 1000 karakter)'
      });
    }

    // Faaliyet var mı ve onaylı mı kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'onaylandi') {
      return res.status(403).json({
        success: false,
        error: 'Sadece onaylanmış faaliyetlere yorum yapılabilir'
      });
    }

    // Yorum ekle
    const newYorum = await FaaliyetInteraction.createYorum(id, userId, yorum);

    // Güncel yorum sayısını getir
    const yorumCount = await FaaliyetInteraction.getYorumCount(id);

    res.status(201).json({
      success: true,
      message: 'Yorum başarıyla eklendi',
      data: newYorum,
      yorum_sayisi: yorumCount
    });

  } catch (error) {
    console.error('Create yorum error:', error);
    res.status(500).json({
      success: false,
      error: 'Yorum eklenemedi: ' + error.message
    });
  }
};

// Faaliyetin yorumlarını listele
const getYorumlar = async (req, res) => {
  try {
    const { id } = req.params; // faaliyet id
    const { page = 1, limit = 20 } = req.query;

    // Faaliyet var mı kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await FaaliyetInteraction.getYorumlar(id, {
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: result.yorumlar,
      pagination: {
        ...result.pagination,
        page: parseInt(page),
        totalPages: Math.ceil(result.pagination.total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get yorumlar error:', error);
    res.status(500).json({
      success: false,
      error: 'Yorumlar getirilemedi: ' + error.message
    });
  }
};

// Yorum sil
const deleteYorum = async (req, res) => {
  try {
    const { yorumId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'super_admin';

    const result = await FaaliyetInteraction.deleteYorum(yorumId, userId, isAdmin);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Yorum silinemedi'
      });
    }

    // Güncel yorum sayısını getir
    const yorumCount = await FaaliyetInteraction.getYorumCount(result.faaliyetId);

    res.json({
      success: true,
      message: 'Yorum başarıyla silindi',
      yorum_sayisi: yorumCount
    });

  } catch (error) {
    console.error('Delete yorum error:', error);
    
    // Özel hata mesajları
    if (error.message === 'Yorum bulunamadı') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message === 'Bu yorumu silme yetkiniz yok') {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Yorum silinemedi: ' + error.message
    });
  }
};

// ==================== İSTATİSTİK CONTROLLER'LARI ====================

// Faaliyetin tüm etkileşim istatistiklerini getir
const getFaaliyetInteractions = async (req, res) => {
  try {
    const { id } = req.params; // faaliyet id
    const userId = req.user ? req.user.id : null;

    // Faaliyet var mı kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    const stats = await FaaliyetInteraction.getFaaliyetInteractions(id, userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get faaliyet interactions error:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler getirilemedi: ' + error.message
    });
  }
};

// Kullanıcının etkileşim istatistiklerini getir
const getUserInteractionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Sadece kendi istatistiklerini veya admin görebilir
    if (req.user.id !== parseInt(userId) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu istatistikleri görme yetkiniz yok'
      });
    }

    const stats = await FaaliyetInteraction.getUserInteractionStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user interaction stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı istatistikleri getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  // Beğeni
  toggleBegeni,
  getBegeniler,
  
  // Yorum
  createYorum,
  getYorumlar,
  deleteYorum,
  
  // İstatistikler
  getFaaliyetInteractions,
  getUserInteractionStats
};
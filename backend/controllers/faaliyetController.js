// controllers/faaliyetController.js - Güncellenmiş versiyon
const Faaliyet = require('../models/Faaliyet');
const fs = require('fs');
const path = require('path');

const getAllFaaliyetler = async (req, res) => {
  try {
    console.log('Query params received:', req.query);

    const {
      page = 1,
      limit = 20,
      il,
      ilce,
      dernek,
      user_id,
      baslangic_tarihi,
      bitis_tarihi
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Sadece dolu olan filtreleri ekle
    if (il && il.trim() !== '' && il !== 'undefined' && il !== 'null') {
      filters.il = il.trim();
    }
    
    if (ilce && ilce.trim() !== '' && ilce !== 'undefined' && ilce !== 'null') {
      filters.ilce = ilce.trim();
    }
    
    if (dernek && dernek.trim() !== '' && dernek !== 'undefined' && dernek !== 'null') {
      filters.dernek = dernek.trim();
    }
    
    if (user_id && user_id.trim() !== '' && user_id !== 'undefined' && user_id !== 'null') {
      filters.user_id = parseInt(user_id);
    }

    // YENİ: Tarih filtreleri ekle
    if (baslangic_tarihi && baslangic_tarihi.trim() !== '' && baslangic_tarihi !== 'undefined' && baslangic_tarihi !== 'null') {
      filters.baslangic_tarihi = baslangic_tarihi.trim();
    }

    if (bitis_tarihi && bitis_tarihi.trim() !== '' && bitis_tarihi !== 'undefined' && bitis_tarihi !== 'null') {
      filters.bitis_tarihi = bitis_tarihi.trim();
    }

    console.log('Cleaned filters:', filters);

    // Sadece onaylanmış faaliyetleri getir
    const userId = req.user ? req.user.id : null;
    console.log('🔍 User ID in getAllFaaliyetler:', userId, 'req.user exists:', !!req.user);
const faaliyetler = await Faaliyet.getOnaylanmisFaaliyetler(filters);
     const total = await Faaliyet.getCount({ ...filters, durum: 'onaylandi' });

    console.log('Results:', { 
      faaliyetlerCount: faaliyetler.length, 
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: faaliyetler,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
console.error('Database error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });    res.status(500).json({
      success: false,
      error: 'Faaliyetler getirilemedi: ' + error.message
    });
  }
};

const createFaaliyet = async (req, res) => {
  try {
    const { aciklama, gorseller } = req.body; // baslik kaldırıldı
    const user_id = req.user.id;

    // Basit validasyon - sadece açıklama ve görsel kontrolü
    if (!aciklama && (!gorseller || gorseller.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Açıklama veya görsel gerekli'
      });
    }

    // Faaliyet beklemede durumunda oluşturulur
    const faaliyetId = await Faaliyet.create({
      user_id,
      aciklama,
      gorseller: gorseller || []
    });

    const faaliyet = await Faaliyet.findById(faaliyetId);

    res.status(201).json({
      success: true,
      message: 'Faaliyet başarıyla oluşturuldu ve onay bekliyor',
      data: faaliyet
    });

  } catch (error) {
    console.error('Create faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet oluşturulurken hata oluştu: ' + error.message
    });
  }
};

// Faaliyet detayını getir
const getFaaliyetById = async (req, res) => {
  try {
    const { id } = req.params;
    const faaliyet = await Faaliyet.findById(id);

    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    // Eğer faaliyet onaylanmamışsa, sadece sahibi ve adminler görebilir
    if (faaliyet.durum !== 'onaylandi') {
      if (!req.user || 
          (req.user.id !== faaliyet.user_id && req.user.role !== 'super_admin')) {
        return res.status(403).json({
          success: false,
          error: 'Bu faaliyeti görme yetkiniz yok'
        });
      }
    }

    res.json({
      success: true,
      data: faaliyet
    });

  } catch (error) {
    console.error('Get faaliyet by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet detayı getirilemedi: ' + error.message
    });
  }
};

// Kendi faaliyetlerini getir (tüm durumları ile)
const getMyFaaliyetler = async (req, res) => {
  try {
    const user_id = req.user.id;
    const faaliyetler = await Faaliyet.getByUserId(user_id);

    res.json({
      success: true,
      data: faaliyetler,
      count: faaliyetler.length
    });

  } catch (error) {
    console.error('Get my faaliyetler error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyetleriniz getirilemedi: ' + error.message
    });
  }
};

// Faaliyet güncelle (sadece kendi ve tekrar onaya gider)
const updateFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const { aciklama } = req.body; // baslik kaldırıldı
    const user_id = req.user.id;

    // Önce faaliyet var mı ve kullanıcının mi kontrol et
    const existingFaaliyet = await Faaliyet.findById(id);
    
    if (!existingFaaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (existingFaaliyet.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: 'Bu faaliyeti güncelleme yetkiniz yok'
      });
    }

    // Yeni görseller varsa işle
    const yeniGorseller = req.files ? req.files.map(file => file.filename) : [];
    const mevcutGorseller = existingFaaliyet.gorseller || [];
    const gorseller = [...mevcutGorseller, ...yeniGorseller];

    // Güncelleme yapılırsa faaliyet tekrar beklemede durumuna geçer
    const updated = await Faaliyet.updateById(id, user_id, {
      aciklama,
      gorseller
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet güncellenemedi'
      });
    }

    const updatedFaaliyet = await Faaliyet.findById(id);

    res.json({
      success: true,
      message: 'Faaliyet başarıyla güncellendi ve tekrar onay bekliyor',
      data: updatedFaaliyet
    });

  } catch (error) {
    console.error('Update faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet güncellenirken hata oluştu: ' + error.message
    });
  }
};

// Faaliyet sil (sadece kendi)
const deleteFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: 'Bu faaliyeti silme yetkiniz yok'
      });
    }

    // Faaliyetin görsellerini sil
    if (faaliyet.gorseller && faaliyet.gorseller.length > 0) {
      faaliyet.gorseller.forEach(gorsel => {
        const filePath = path.join(__dirname, '../uploads/faaliyet-images', gorsel);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    const deleted = await Faaliyet.deleteById(id, user_id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet silinemedi'
      });
    }

    res.json({
      success: true,
      message: 'Faaliyet başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet silinirken hata oluştu: ' + error.message
    });
  }
};

// Admin: Bekleyen faaliyetleri getir
const getBekleyenFaaliyetler = async (req, res) => {
  try {
    // Sadece admin erişebilir
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const {
      page = 1,
      limit = 20,
      il,
      ilce,
      dernek
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      durum: 'beklemede'
    };

    if (il && il.trim() !== '') filters.il = il.trim();
    if (ilce && ilce.trim() !== '') filters.ilce = ilce.trim();
    if (dernek && dernek.trim() !== '') filters.dernek = dernek.trim();

    const faaliyetler = await Faaliyet.getAllWithStatus(filters);
    const total = await Faaliyet.getCount(filters);

    res.json({
      success: true,
      data: faaliyetler,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get bekleyen faaliyetler error:', error);
    res.status(500).json({
      success: false,
      error: 'Bekleyen faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Admin: Faaliyet onaylama
const onaylaFaaliyet = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const { id } = req.params;
    const adminId = req.user.id;

    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'beklemede') {
      return res.status(400).json({
        success: false,
        error: 'Bu faaliyet zaten işleme alınmış'
      });
    }

    const onaylandi = await Faaliyet.onaylaFaaliyet(id, adminId);

    if (!onaylandi) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet onaylanamadı'
      });
    }

    const updatedFaaliyet = await Faaliyet.findById(id);

    res.json({
      success: true,
      message: 'Faaliyet başarıyla onaylandı',
      data: updatedFaaliyet
    });

  } catch (error) {
    console.error('Onayla faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet onaylanırken hata oluştu: ' + error.message
    });
  }
};

// Admin: Faaliyet reddetme
const reddetFaaliyet = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const { id } = req.params;
    const { red_nedeni } = req.body;
    const adminId = req.user.id;

    if (!red_nedeni || red_nedeni.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Red nedeni gerekli'
      });
    }

    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'beklemede') {
      return res.status(400).json({
        success: false,
        error: 'Bu faaliyet zaten işleme alınmış'
      });
    }

    const reddedildi = await Faaliyet.reddetFaaliyet(id, adminId, red_nedeni);

    if (!reddedildi) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet reddedilemedi'
      });
    }

    const updatedFaaliyet = await Faaliyet.findById(id);

    res.json({
      success: true,
      message: 'Faaliyet başarıyla reddedildi',
      data: updatedFaaliyet
    });

  } catch (error) {
    console.error('Reddet faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet reddedilirken hata oluştu: ' + error.message
    });
  }
};

// Admin: Faaliyet istatistikleri (onay durumları ile)
const getFaaliyetStats = async (req, res) => {
  try {
    // Sadece admin erişebilir
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const totalFaaliyetler = await Faaliyet.getCount();
    const onayStats = await Faaliyet.getOnayStats();
    
    // İl bazında istatistikler için custom query
    const [ilStats] = await require('../config/database').pool.execute(`
      SELECT 
        u.il,
        COUNT(f.id) as faaliyet_sayisi,
        COUNT(DISTINCT f.user_id) as aktif_kullanici,
        SUM(CASE WHEN f.durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan,
        SUM(CASE WHEN f.durum = 'beklemede' THEN 1 ELSE 0 END) as bekleyen,
        SUM(CASE WHEN f.durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      GROUP BY u.il
      ORDER BY faaliyet_sayisi DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalFaaliyetler,
        onayStats,
        ilBazindaStats: ilStats
      }
    });

  } catch (error) {
    console.error('Get faaliyet stats error:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler getirilemedi: ' + error.message
    });
  }
};

// Admin: Tüm faaliyetleri getir (durum filtresi ile)
const getAllFaaliyetlerAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const {
      page = 1,
      limit = 20,
      il,
      ilce,
      dernek,
      durum,
      user_id
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (il && il.trim() !== '') filters.il = il.trim();
    if (ilce && ilce.trim() !== '') filters.ilce = ilce.trim();
    if (dernek && dernek.trim() !== '') filters.dernek = dernek.trim();
    if (durum && durum.trim() !== '') filters.durum = durum.trim();
    if (user_id && user_id.trim() !== '') filters.user_id = parseInt(user_id);

    const faaliyetler = await Faaliyet.getAllWithStatus(filters);
    const total = await Faaliyet.getCount(filters);

    res.json({
      success: true,
      data: faaliyetler,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all faaliyetler admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyetler getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  createFaaliyet,
  getAllFaaliyetler,
  getFaaliyetById,
  getMyFaaliyetler,
  updateFaaliyet,
  deleteFaaliyet,
  getFaaliyetStats,
  getBekleyenFaaliyetler,
  onaylaFaaliyet,
  reddetFaaliyet,
  getAllFaaliyetlerAdmin
};
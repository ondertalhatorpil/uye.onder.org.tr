const Faaliyet = require('../models/Faaliyet');
const fs = require('fs');
const path = require('path');

// Tüm faaliyetleri getir - DÜZELTME
const getAllFaaliyetler = async (req, res) => {
  try {
    console.log('Query params received:', req.query);

    const {
      page = 1,
      limit = 20,
      il,
      ilce,
      dernek,
      user_id
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // FİLTRELERİ TEMİZLE
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

    console.log('Cleaned filters:', filters);

    const faaliyetler = await Faaliyet.getAll(filters);
    const total = await Faaliyet.getCount(filters);

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
    console.error('Get all faaliyetler error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Yeni faaliyet oluştur
const createFaaliyet = async (req, res) => {
  try {
    const { baslik, aciklama, gorseller } = req.body; // gorseller frontend'ten geliyor
    const user_id = req.user.id;

    // Basit validasyon
    if (!baslik && !aciklama && (!gorseller || gorseller.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Başlık, açıklama veya görsel gerekli'
      });
    }

    // Görseller frontend'ten array olarak geliyor
    const faaliyetId = await Faaliyet.create({
      user_id,
      baslik,
      aciklama,
      gorseller: gorseller || [] // Frontend'ten gelen dosya isimleri
    });

    const faaliyet = await Faaliyet.findById(faaliyetId);

    res.status(201).json({
      success: true,
      message: 'Faaliyet başarıyla oluşturuldu',
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

// Kendi faaliyetlerini getir
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

// Faaliyet güncelle (sadece kendi)
const updateFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const { baslik, aciklama } = req.body;
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

    const updated = await Faaliyet.updateById(id, user_id, {
      baslik,
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
      message: 'Faaliyet başarıyla güncellendi',
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

    // Önce faaliyet var mı ve kullanıcının mi kontrol et
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

// Admin: Faaliyet istatistikleri
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
    
    // İl bazında istatistikler için custom query
    const [ilStats] = await require('../config/database').pool.execute(`
      SELECT 
        u.il,
        COUNT(f.id) as faaliyet_sayisi,
        COUNT(DISTINCT f.user_id) as aktif_kullanici
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

module.exports = {
  createFaaliyet,
  getAllFaaliyetler,
  getFaaliyetById,
  getMyFaaliyetler,
  updateFaaliyet,
  deleteFaaliyet,
  getFaaliyetStats
};
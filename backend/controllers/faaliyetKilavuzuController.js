// controllers/faaliyetKilavuzuController.js
const FaaliyetKilavuzu = require('../models/FaaliyetKilavuzu');
const fs = require('fs').promises;
const path = require('path');

// Tüm faaliyetleri getir (PUBLIC - herkes görebilir)
const getAllFaaliyetler = async (req, res) => {
  try {
    const faaliyetler = await FaaliyetKilavuzu.getAll();
    
    res.json({
      success: true,
      data: faaliyetler
    });
  } catch (error) {
    console.error('Get all faaliyetler error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Dün-Bugün-Yarın faaliyetlerini getir (PUBLIC)
const getDunBugunYarin = async (req, res) => {
  try {
    const faaliyetler = await FaaliyetKilavuzu.getDunBugunYarin();
    
    res.json({
      success: true,
      data: faaliyetler
    });
  } catch (error) {
    console.error('Get dun-bugun-yarin error:', error);
    res.status(500).json({
      success: false,
      error: 'Günlük faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Haftalık faaliyetleri getir (PUBLIC)
const getHaftalikFaaliyetler = async (req, res) => {
  try {
    const haftalar = await FaaliyetKilavuzu.getHaftalikFaaliyetler();
    
    res.json({
      success: true,
      data: haftalar
    });
  } catch (error) {
    console.error('Get haftalik faaliyetler error:', error);
    res.status(500).json({
      success: false,
      error: 'Haftalık faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Belirli tarihteki faaliyeti getir (PUBLIC)
const getFaaliyetByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Tarih formatı kontrolü (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.'
      });
    }
    
    const faaliyet = await FaaliyetKilavuzu.getByDate(date);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Bu tarihe ait faaliyet bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: faaliyet
    });
  } catch (error) {
    console.error('Get faaliyet by date error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet getirilemedi: ' + error.message
    });
  }
};

// Tarih aralığındaki faaliyetleri getir (PUBLIC)
const getFaaliyetlerByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Başlangıç ve bitiş tarihi gerekli'
      });
    }
    
    // Tarih formatı kontrolü
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.'
      });
    }
    
    const faaliyetler = await FaaliyetKilavuzu.getByDateRange(startDate, endDate);
    
    res.json({
      success: true,
      data: faaliyetler
    });
  } catch (error) {
    console.error('Get faaliyetler by date range error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Yeni faaliyet oluştur (ADMIN ONLY)
const createFaaliyet = async (req, res) => {
  try {
    const { tarih, etkinlik_adi, icerik } = req.body;
    const gorsel_path = req.file ? `/uploads/kilavuz/${req.file.filename}` : null;
    
    // Validasyon - en az tarih ve etkinlik adı zorunlu
    if (!tarih || !etkinlik_adi) {
      // Eğer görsel yüklendiyse ama hata olursa, görseli sil
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Tarih ve etkinlik adı zorunludur'
      });
    }
    
    // En az içerik veya görsel olmalı
    if (!icerik && !gorsel_path) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'En az içerik veya görsel eklemelisiniz'
      });
    }
    
    // Tarih formatı kontrolü
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tarih)) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.'
      });
    }
    
    // Aynı tarihte faaliyet var mı kontrol et
    const dateExists = await FaaliyetKilavuzu.checkDateExists(tarih);
    if (dateExists) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Bu tarihe ait faaliyet zaten mevcut'
      });
    }
    
    const faaliyetId = await FaaliyetKilavuzu.create({
      tarih,
      etkinlik_adi,
      icerik,
      gorsel_path,
      created_by: req.user.id
    });
    
    // Oluşturulan faaliyeti getir
    const faaliyet = await FaaliyetKilavuzu.getById(faaliyetId);
    
    res.status(201).json({
      success: true,
      message: 'Faaliyet başarıyla oluşturuldu',
      data: faaliyet
    });
  } catch (error) {
    // Hata durumunda yüklenen dosyayı sil
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
    }
    
    console.error('Create faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet oluşturulamadı: ' + error.message
    });
  }
};

// Faaliyet güncelle (ADMIN ONLY)
const updateFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const { tarih, etkinlik_adi, icerik, remove_image } = req.body;
    const gorsel_path = req.file ? `/uploads/kilavuz/${req.file.filename}` : null;
    
    // Validasyon
    if (!tarih || !etkinlik_adi) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Tarih ve etkinlik adı zorunludur'
      });
    }
    
    // Tarih formatı kontrolü
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tarih)) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.'
      });
    }
    
    // Mevcut faaliyet var mı kontrol et
    const mevcutFaaliyet = await FaaliyetKilavuzu.getById(id);
    if (!mevcutFaaliyet) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }
    
    // Aynı tarihte başka faaliyet var mı kontrol et (kendi ID'si hariç)
    const dateExists = await FaaliyetKilavuzu.checkDateExists(tarih, id);
    if (dateExists) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
      }
      
      return res.status(400).json({
        success: false,
        error: 'Bu tarihe ait başka bir faaliyet zaten mevcut'
      });
    }
    
    // Görsel yönetimi
    let finalGorselPath = mevcutFaaliyet.gorsel_path;
    
    // Yeni görsel yüklendiyse
    if (gorsel_path) {
      // Eski görseli sil
      if (mevcutFaaliyet.gorsel_path) {
        const eskiGorselPath = path.join(__dirname, '..', mevcutFaaliyet.gorsel_path);
        await fs.unlink(eskiGorselPath).catch(err => console.error('Old image delete error:', err));
      }
      finalGorselPath = gorsel_path;
    }
    // Görsel silinmek isteniyorsa
    else if (remove_image === 'true') {
      if (mevcutFaaliyet.gorsel_path) {
        const eskiGorselPath = path.join(__dirname, '..', mevcutFaaliyet.gorsel_path);
        await fs.unlink(eskiGorselPath).catch(err => console.error('Image delete error:', err));
      }
      finalGorselPath = null;
    }
    
    // En az içerik veya görsel olmalı
    if (!icerik && !finalGorselPath) {
      return res.status(400).json({
        success: false,
        error: 'En az içerik veya görsel bulunmalıdır'
      });
    }
    
    const updated = await FaaliyetKilavuzu.update(id, {
      tarih,
      etkinlik_adi,
      icerik,
      gorsel_path: finalGorselPath
    });
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet güncellenemedi'
      });
    }
    
    // Güncellenmiş faaliyeti getir
    const faaliyet = await FaaliyetKilavuzu.getById(id);
    
    res.json({
      success: true,
      message: 'Faaliyet başarıyla güncellendi',
      data: faaliyet
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('File delete error:', err));
    }
    
    console.error('Update faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet güncellenemedi: ' + error.message
    });
  }
};

// Faaliyet sil (ADMIN ONLY)
const deleteFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mevcut faaliyet var mı kontrol et
    const mevcutFaaliyet = await FaaliyetKilavuzu.getById(id);
    if (!mevcutFaaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }
    
    // Görsel varsa sil
    if (mevcutFaaliyet.gorsel_path) {
      const gorselPath = path.join(__dirname, '..', mevcutFaaliyet.gorsel_path);
      await fs.unlink(gorselPath).catch(err => console.error('Image delete error:', err));
    }
    
    const deleted = await FaaliyetKilavuzu.delete(id);
    
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
      error: 'Faaliyet silinemedi: ' + error.message
    });
  }
};

// Faaliyet istatistikleri getir (ADMIN ONLY)
const getFaaliyetStats = async (req, res) => {
  try {
    const stats = await FaaliyetKilavuzu.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get faaliyet stats error:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler getirilemedi: ' + error.message
    });
  }
};

// ID ile faaliyet getir (PUBLIC)
const getFaaliyetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faaliyet = await FaaliyetKilavuzu.getById(id);
    
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
      error: 'Faaliyet getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  getAllFaaliyetler,
  getDunBugunYarin,
  getHaftalikFaaliyetler,
  getFaaliyetByDate,
  getFaaliyetlerByDateRange,
  createFaaliyet,
  updateFaaliyet,
  deleteFaaliyet,
  getFaaliyetStats,
  getFaaliyetById
};
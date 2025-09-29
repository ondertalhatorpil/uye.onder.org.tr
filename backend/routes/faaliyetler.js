// routes/faaliyetler.js - GÜNCELLENMIŞ VERSİYON
const express = require('express');

// Faaliyet controller'ları
const {
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
} = require('../controllers/faaliyetController');

// Admin controller'dan faaliyet onay fonksiyonlarını import et
const {
  getFaaliyetOnayGecmisi,
  getFaaliyetOnayStats,
  topluFaaliyetOnayla
} = require('../controllers/adminController');

// YENİ: Etkileşim (beğeni/yorum) controller'ları
const {
  toggleBegeni,
  getBegeniler,
  createYorum,
  getYorumlar,
  deleteYorum,
  getFaaliyetInteractions,
  getUserInteractionStats
} = require('../controllers/faaliyetInteractionController');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleFaaliyetImageUpload } = require('../middleware/upload');

const router = express.Router();

// ==================== IMAGE UPLOAD ====================
router.post('/upload-images', auth, handleFaaliyetImageUpload, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resim dosyası bulunamadı'
      });
    }

    const imageUrls = req.files.map(file => file.filename);

    res.json({
      success: true,
      message: 'Resimler başarıyla yüklendi',
      imageUrls: imageUrls
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Resim yükleme hatası: ' + error.message
    });
  }
});

// ==================== SPESİFİK ROUTE'LAR (ÖNCE) ====================

// My posts endpoint
router.get('/my-posts', auth, getMyFaaliyetler);

// Kullanıcı etkileşim stats - SPESİFİK PATH
router.get('/user-stats/:userId', auth, getUserInteractionStats);

// Yorum silme - SPESİFİK PATH ÖNCE
router.delete('/yorum/:yorumId', auth, deleteYorum);

// ==================== ADMIN ROUTE'LARI ====================
router.get('/admin/stats', auth, roleCheck(['super_admin']), getFaaliyetStats);
router.get('/admin/bekleyenler', auth, roleCheck(['super_admin']), getBekleyenFaaliyetler);
router.get('/admin/onay-gecmisi', auth, roleCheck(['super_admin']), getFaaliyetOnayGecmisi);
router.get('/admin/onay-stats', auth, roleCheck(['super_admin']), getFaaliyetOnayStats);
router.get('/admin/all', auth, roleCheck(['super_admin']), getAllFaaliyetlerAdmin);

// Admin işlemler
router.put('/admin/:id/onayla', auth, roleCheck(['super_admin']), onaylaFaaliyet);
router.put('/admin/:id/reddet', auth, roleCheck(['super_admin']), reddetFaaliyet);
router.post('/admin/toplu-onayla', auth, roleCheck(['super_admin']), topluFaaliyetOnayla);

// ==================== YENİ: ETKİLEŞİM ROUTE'LARI ====================

// Beğeni işlemleri
router.post('/:id/begeni', auth, toggleBegeni);           // Beğen/beğeniyi kaldır
router.get('/:id/begeniler', getBegeniler);                // Beğenenleri listele

// Yorum işlemleri
router.post('/:id/yorum', auth, createYorum);              // Yorum ekle
router.get('/:id/yorumlar', getYorumlar);                  // Yorumları listele

// Etkileşim istatistikleri
router.get('/:id/interactions', getFaaliyetInteractions);  // Faaliyet etkileşim stats

// ==================== GENEL FAALIYET ROUTE'LARI ====================

// Public routes
router.get('/', getAllFaaliyetler);

// Protected routes
router.post('/', auth, createFaaliyet);
router.put('/:id', auth, handleFaaliyetImageUpload, updateFaaliyet);
router.delete('/:id', auth, deleteFaaliyet);

// Get by ID - EN SON (çünkü /:id her şeyi yakalar)
router.get('/:id', getFaaliyetById);

module.exports = router;
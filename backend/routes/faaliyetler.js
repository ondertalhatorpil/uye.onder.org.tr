// routes/faaliyetler.js
const express = require('express');

// Middleware imports
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const roleCheck = require('../middleware/roleCheck');
const { handleFaaliyetImageUpload } = require('../middleware/upload');

// Controller imports
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

const {
  getFaaliyetOnayGecmisi,
  getFaaliyetOnayStats,
  topluFaaliyetOnayla
} = require('../controllers/adminController');

const {
  toggleBegeni,
  getBegeniler,
  createYorum,
  getYorumlar,
  deleteYorum,
  getFaaliyetInteractions,
  getUserInteractionStats
} = require('../controllers/faaliyetInteractionController');

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

// ==================== KULLANICI ROUTE'LARI ====================
router.get('/my-posts', auth, getMyFaaliyetler);
router.get('/user-stats/:userId', auth, getUserInteractionStats);

// ==================== ADMIN ROUTE'LARI ====================
router.get('/admin/stats', auth, roleCheck(['super_admin']), getFaaliyetStats);
router.get('/admin/bekleyenler', auth, roleCheck(['super_admin']), getBekleyenFaaliyetler);
router.get('/admin/onay-gecmisi', auth, roleCheck(['super_admin']), getFaaliyetOnayGecmisi);
router.get('/admin/onay-stats', auth, roleCheck(['super_admin']), getFaaliyetOnayStats);
router.get('/admin/all', auth, roleCheck(['super_admin']), getAllFaaliyetlerAdmin);

router.put('/admin/:id/onayla', auth, roleCheck(['super_admin']), onaylaFaaliyet);
router.put('/admin/:id/reddet', auth, roleCheck(['super_admin']), reddetFaaliyet);
router.post('/admin/toplu-onayla', auth, roleCheck(['super_admin']), topluFaaliyetOnayla);

// ==================== ETKİLEŞİM ROUTE'LARI ====================
// Yorum silme - SPESİFİK PATH (/:id'den önce olmalı)
router.delete('/yorum/:yorumId', auth, deleteYorum);

// Beğeni işlemleri
router.post('/:id/begeni', auth, toggleBegeni);
router.get('/:id/begeniler', getBegeniler);

// Yorum işlemleri
router.post('/:id/yorum', auth, createYorum);
router.get('/:id/yorumlar', getYorumlar);

// Etkileşim istatistikleri
router.get('/:id/interactions', optionalAuth, getFaaliyetInteractions);

// ==================== FAALIYET CRUD ROUTE'LARI ====================
// Public routes - opsiyonel auth ile
router.get('/', optionalAuth, getAllFaaliyetler);
router.get('/:id', optionalAuth, getFaaliyetById);

// Protected routes
router.post('/', auth, createFaaliyet);
router.put('/:id', auth, handleFaaliyetImageUpload, updateFaaliyet);
router.delete('/:id', auth, deleteFaaliyet);

module.exports = router;
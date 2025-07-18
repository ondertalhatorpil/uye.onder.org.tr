const express = require('express');
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

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleFaaliyetImageUpload } = require('../middleware/upload');

const router = express.Router();

// Image upload endpoint
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

// My posts endpoint
router.get('/my-posts', auth, getMyFaaliyetler);

// Admin routes - faaliyet onay sistemi
router.get('/admin/stats', auth, roleCheck(['super_admin']), getFaaliyetStats);
router.get('/admin/bekleyenler', auth, roleCheck(['super_admin']), getBekleyenFaaliyetler);
router.get('/admin/onay-gecmisi', auth, roleCheck(['super_admin']), getFaaliyetOnayGecmisi);
router.get('/admin/onay-stats', auth, roleCheck(['super_admin']), getFaaliyetOnayStats);
router.get('/admin/all', auth, roleCheck(['super_admin']), getAllFaaliyetlerAdmin);

// Admin işlemler
router.put('/admin/:id/onayla', auth, roleCheck(['super_admin']), onaylaFaaliyet);
router.put('/admin/:id/reddet', auth, roleCheck(['super_admin']), reddetFaaliyet);
router.post('/admin/toplu-onayla', auth, roleCheck(['super_admin']), topluFaaliyetOnayla);

// Public routes
router.get('/', getAllFaaliyetler);
router.get('/:id', auth, getFaaliyetById);

// Protected routes
router.post('/', auth, createFaaliyet);
router.put('/:id', auth, handleFaaliyetImageUpload, updateFaaliyet);
router.delete('/:id', auth, deleteFaaliyet);

module.exports = router;
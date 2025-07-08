const express = require('express');
const {
  createFaaliyet,
  getAllFaaliyetler,
  getFaaliyetById,
  getMyFaaliyetler,
  updateFaaliyet,
  deleteFaaliyet,
  getFaaliyetStats
} = require('../controllers/faaliyetController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleFaaliyetImageUpload } = require('../middleware/upload');

const router = express.Router();

// Image upload endpoint (EN ÜST SIRADA)
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

// My posts endpoint (ikinci sırada)
router.get('/my-posts', auth, getMyFaaliyetler);

// Admin routes
router.get('/admin/stats', auth, roleCheck(['super_admin']), getFaaliyetStats);

// Public routes
router.get('/', getAllFaaliyetler);
router.get('/:id', getFaaliyetById);

// Protected routes
router.post('/', auth, createFaaliyet);
router.put('/:id', auth, handleFaaliyetImageUpload, updateFaaliyet);
router.delete('/:id', auth, deleteFaaliyet);

module.exports = router;
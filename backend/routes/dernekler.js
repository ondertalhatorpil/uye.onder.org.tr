const express = require('express');
const {
  uploadExcel,
  getDerneklerByLocation,
  getAllDernekler,
  getMyDernek,
  updateMyDernek,
  uploadDernekLogo,
  getDernekProfile
} = require('../controllers/dernekController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleExcelUpload, handleDernekLogoUpload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllDernekler);
router.get('/by-location', getDerneklerByLocation);
router.get('/profile/:dernekAdi', getDernekProfile);

// Admin routes (super admin)
router.post('/upload-excel', 
  auth, 
  roleCheck(['super_admin']), 
  handleExcelUpload,
  uploadExcel
);

// Dernek admin routes
router.get('/my-dernek', auth, roleCheck(['dernek_admin']), getMyDernek);
router.put('/my-dernek', auth, roleCheck(['dernek_admin']), updateMyDernek);
router.post('/upload-logo', auth, roleCheck(['dernek_admin']), handleDernekLogoUpload, uploadDernekLogo); // BURADA DEĞİŞİKLİK

module.exports = router;
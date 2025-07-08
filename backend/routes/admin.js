const express = require('express');
const {
  getDashboard,
  updateUserRole,
  assignDernekAdmin,
  deleteDernek,
  deleteUser,
  getSystemSettings
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleExcelUpload } = require('../middleware/upload');

// Dernek controller'dan excel upload fonksiyonunu import et
const { uploadExcel } = require('../controllers/dernekController');

const router = express.Router();

// Tüm admin routes super_admin yetkisi gerektirir
router.use(auth);
router.use(roleCheck(['super_admin']));

// Dashboard ve istatistikler
router.get('/dashboard', getDashboard);
router.get('/settings', getSystemSettings);

// Kullanıcı yönetimi
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Dernek yönetimi
router.post('/dernekler/upload-excel', handleExcelUpload, uploadExcel);
router.post('/dernekler/assign-admin', assignDernekAdmin);
router.delete('/dernekler/:id', deleteDernek);

module.exports = router;
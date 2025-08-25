const express = require('express');
const {
  getDashboard,
  updateUserRole,
  assignDernekAdmin,
  deleteDernek,
  deleteUser,
  getSystemSettings,
  // Yeni faaliyet onay fonksiyonları
  getBekleyenFaaliyetler,
  onaylaFaaliyet,
  reddetFaaliyet,
  topluFaaliyetOnayla,
  getFaaliyetOnayGecmisi,
  getFaaliyetOnayStats
} = require('../controllers/adminController');

const {
  sendNotification,
  getMyNotificationsAdmin, 
  deleteNotification,
  getNotificationStats
} = require('../controllers/notificationController');

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

// ====== FALİYET ONAY SİSTEMİ ======
// Bekleyen faaliyetler
router.get('/faaliyetler/bekleyenler', getBekleyenFaaliyetler);

// Faaliyet onay/red işlemleri
router.put('/faaliyetler/:id/onayla', onaylaFaaliyet);
router.put('/faaliyetler/:id/reddet', reddetFaaliyet);

// Toplu faaliyet onaylama
router.post('/faaliyetler/toplu-onayla', topluFaaliyetOnayla);

// Faaliyet onay geçmişi ve istatistikleri
router.get('/faaliyetler/onay-gecmisi', getFaaliyetOnayGecmisi);
router.get('/faaliyetler/onay-stats', getFaaliyetOnayStats);

// ====== KULLANICI YÖNETİMİ ======
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// ====== DERNEK YÖNETİMİ ======
router.post('/dernekler/upload-excel', handleExcelUpload, uploadExcel);
router.post('/dernekler/assign-admin', assignDernekAdmin);
router.delete('/dernekler/:id', deleteDernek);

// ====== BİLDİRİM YÖNETİMİ ======
router.post('/notifications', sendNotification);
router.get('/notifications', getMyNotificationsAdmin);
router.get('/notifications/stats', getNotificationStats);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
// routes/faaliyetKilavuzu.js
const express = require('express');
const {
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
} = require('../controllers/faaliyetKilavuzuController');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { handleKilavuzImageUpload } = require('../middleware/upload');

const router = express.Router();

// PUBLIC ROUTES - Herkes erişebilir
router.get('/', getAllFaaliyetler);
router.get('/dun-bugun-yarin', getDunBugunYarin);
router.get('/haftalik', getHaftalikFaaliyetler);
router.get('/tarih/:date', getFaaliyetByDate);
router.get('/tarih-aralik', getFaaliyetlerByDateRange);
router.get('/:id', getFaaliyetById);

// ADMIN ROUTES - Sadece admin erişebilir
router.post(
  '/', 
  auth, 
  roleCheck(['super_admin', 'dernek_admin']), 
  handleKilavuzImageUpload,  // Görsel upload middleware
  createFaaliyet
);

router.put(
  '/:id', 
  auth, 
  roleCheck(['super_admin', 'dernek_admin']), 
  handleKilavuzImageUpload,  // Görsel upload middleware
  updateFaaliyet
);

router.delete(
  '/:id', 
  auth, 
  roleCheck(['super_admin', 'dernek_admin']), 
  deleteFaaliyet
);

router.get(
  '/admin/stats', 
  auth, 
  roleCheck(['super_admin']), 
  getFaaliyetStats
);

module.exports = router;
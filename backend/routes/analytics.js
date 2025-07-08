const express = require('express');
const {
  getUserSegments,
  getDernekSegments,
  getSegmentDetails
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Tüm analytics routes sadece super admin erişebilir
router.use(auth);
router.use(roleCheck(['super_admin']));

// Segmentasyon analizi
router.get('/segments/users', getUserSegments);
router.get('/segments/dernekler', getDernekSegments);
router.get('/segments/:type/:segment/details', getSegmentDetails);

module.exports = router;
const express = require('express');
const {
  searchUsers,
  getUserProfile,
  getDernekMembers,
  getAllUsers,
  getUserStats
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Public routes (herkes erişebilir)
router.get('/search', searchUsers);
router.get('/dernek/:dernekAdi/members', getDernekMembers);
router.get('/by-dernek/:dernekAdi', getDernekMembers); // Bu satırı ekle (aynı fonksiyon)

// User profile route
router.get('/:id', getUserProfile);

// Admin routes
router.get('/', auth, roleCheck(['super_admin']), getAllUsers);
router.get('/admin/stats', auth, roleCheck(['super_admin']), getUserStats);

module.exports = router;
const express = require('express');
const {
  sendResetCode,
  verifyResetCode,
  resetPassword,
  checkSmsService,
  getResetStats,
  cleanExpiredCodes
} = require('../controllers/passwordResetController');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Public routes - herkes erişebilir
router.post('/forgot-password', sendResetCode);
router.post('/verify-reset-code', verifyResetCode); // DÜZELTME: verify-code -> verify-reset-code
router.post('/reset-password', resetPassword);

// Admin only routes
router.get('/sms-service-status', auth, roleCheck(['super_admin']), checkSmsService);
router.get('/stats', auth, roleCheck(['super_admin']), getResetStats);
router.post('/clean-expired', auth, roleCheck(['super_admin']), cleanExpiredCodes);

module.exports = router;
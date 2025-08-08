const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  updateProfile,
  deleteProfileImage,
  getKvkkTexts,
  getPrivacySettings,
  updatePrivacySettings,
  upload 
} = require('../controllers/authController');

const {
  sendResetCode,
  verifyResetCode,
  resetPassword
} = require('../controllers/passwordResetController');

const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', upload.single('profil_fotografi'), register);
router.post('/login', login);
router.get('/kvkk-texts', getKvkkTexts);

// Password Reset routes - YENİ
router.post('/forgot-password', sendResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profil_fotografi'), updateProfile);
router.delete('/profile-image', auth, deleteProfileImage);
router.put('/change-password', auth, changePassword);

// Gizlilik ayarları
router.get('/privacy-settings', auth, getPrivacySettings);
router.put('/privacy-settings', auth, updatePrivacySettings);

module.exports = router;
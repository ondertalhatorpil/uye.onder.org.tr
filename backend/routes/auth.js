const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  updateProfile,
  deleteProfileImage,
  getKvkkTexts,
  getPrivacySettings,     // YENİ
  updatePrivacySettings,  // YENİ
  upload 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', upload.single('profil_fotografi'), register);
router.post('/login', login);
router.get('/kvkk-texts', getKvkkTexts);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profil_fotografi'), updateProfile);
router.delete('/profile-image', auth, deleteProfileImage);
router.put('/change-password', auth, changePassword);

// GİZLİLİK AYARLARI ROUTEları - YENİ
router.get('/privacy-settings', auth, getPrivacySettings);
router.put('/privacy-settings', auth, updatePrivacySettings);

module.exports = router;
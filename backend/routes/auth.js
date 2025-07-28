const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getKvkkTexts,
  deleteProfileImage,
  upload 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

// Profil güncelleme - profil fotoğrafı ile birlikte
router.put('/profile', auth, upload.single('profil_fotografi'), updateProfile);

// Profil fotoğrafını silme
router.delete('/profile/image', auth, deleteProfileImage);

router.put('/change-password', auth, changePassword);
router.get('/kvkk-texts', getKvkkTexts); 

module.exports = router;
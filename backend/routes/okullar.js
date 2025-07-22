// routes/okullar.js
const express = require('express');
const router = express.Router();
const OkulController = require('../controllers/okulController');

// ===== DROPDOWN LİSTELERİ (ÖNCELİKLİ ROUTE'LAR) =====

// İl listesi - Okul seçimi için dropdown
router.get('/iller/:okul_turu', OkulController.getIllerWithOkul);

// İlçe listesi - Okul seçimi için dropdown  
router.get('/ilceler/:okul_turu/:il', OkulController.getIlcelerWithOkul);

// Okul detayı - Profil sayfasında gösterim için
router.get('/detail/:id', OkulController.getOkulById);

// Okul varlığını kontrol et - Validation için
router.get('/check/:id/:okul_turu', OkulController.checkOkulExists);

// ===== OKUL ARAMA VE LİSTELEME =====

// Okul arama - Register ve Profile formları için
router.get('/search', OkulController.searchOkullar);

// İl bazında okul listesi - Select dropdown için (EN SONA)
router.get('/:okul_turu/:il', OkulController.getOkullarByIl);

module.exports = router;
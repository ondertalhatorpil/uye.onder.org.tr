const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Sabit veriler (sektör/komisyon)
const SEKTORLER = [
  'Teknoloji', 'Sağlık', 'Eğitim', 'İnşaat', 'Turizm',
  'Gıda', 'Tekstil', 'Otomotiv', 'Enerji', 'Finans',
  'Hukuk', 'Muhasebe', 'Mühendislik', 'Mimarlık', 'Diğer'
];

const KOMISYONLAR = [
  'İl Başkanı',
  'Yönetim Kurulu', 
  'Üye Ve Mezun İlişkileri Komisyonu',
  'Gençlik Komisyonu',
  'Teşkilatlanma',
  'ÖNCÜ SPOR',
  'Okul Aile Birliği',
  'Diğer'
];

// Database'den il listesi
const getIller = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT DISTINCT il 
      FROM dernekler 
      WHERE il IS NOT NULL AND il != ''
      ORDER BY il ASC
    `);

    const iller = rows.map(row => row.il);

    res.json({ 
      success: true, 
      data: iller,
      count: iller.length
    });

  } catch (error) {
    console.error('Get iller error:', error);
    res.status(500).json({
      success: false,
      error: 'İller getirilemedi: ' + error.message
    });
  }
};

// İl seçilince o ildeki ilçeleri getir
const getIlceler = async (req, res) => {
  try {
    const { il } = req.params;

    const [rows] = await pool.execute(`
      SELECT DISTINCT ilce 
      FROM dernekler 
      WHERE il = ? AND ilce IS NOT NULL AND ilce != ''
      ORDER BY ilce ASC
    `, [il]);

    const ilceler = rows.map(row => row.ilce);

    res.json({ 
      success: true, 
      data: ilceler,
      il: il,
      count: ilceler.length
    });

  } catch (error) {
    console.error('Get ilceler error:', error);
    res.status(500).json({
      success: false,
      error: 'İlçeler getirilemedi: ' + error.message
    });
  }
};

// İl ve ilçe seçilince o bölgedeki dernekleri getir
const getDerneklerByLocation = async (req, res) => {
  try {
    const { il, ilce } = req.params;

    let query = `
      SELECT 
        id, dernek_adi, dernek_baskani, dernek_telefon,
        (SELECT COUNT(*) FROM users WHERE gonullu_dernek = dernekler.dernek_adi) as uye_sayisi
      FROM dernekler 
      WHERE il = ?
    `;
    const params = [il];

    if (ilce) {
      query += ' AND ilce = ?';
      params.push(ilce);
    }

    query += ' ORDER BY dernek_adi ASC';

    const [rows] = await pool.execute(query, params);

    res.json({ 
      success: true, 
      data: rows,
      il: il,
      ilce: ilce || null,
      count: rows.length
    });

  } catch (error) {
    console.error('Get dernekler by location error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernekler getirilemedi: ' + error.message
    });
  }
};

router.get('/mezuniyet-yillari', (req, res) => {
  const currentYear = new Date().getFullYear();
  const startYear = 1980;
  
  const yillar = [];
  for (let yil = currentYear; yil >= startYear; yil--) {
    yillar.push(yil);
  }
  
  res.json({
    success: true,
    yillar: yillar
  });
});

// Sınıf listesi
router.get('/siniflar/:okul_turu', (req, res) => {
  const { okul_turu } = req.params;
  
  let siniflar;
  if (okul_turu === 'ortaokul') {
    siniflar = [5, 6, 7, 8];
  } else if (okul_turu === 'lise') {
    siniflar = [9, 10, 11, 12];
  } else {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz okul türü'
    });
  }
  
  res.json({
    success: true,
    siniflar: siniflar
  });
});

// API endpoints
router.get('/iller', getIller);
router.get('/ilceler/:il', getIlceler);
router.get('/dernekler/:il/:ilce?', getDerneklerByLocation); // İsteğe bağlı ilçe parametresi

router.get('/sektorler', (req, res) => {
  res.json({ success: true, data: SEKTORLER });
});

router.get('/komisyonlar', (req, res) => {
  res.json({ success: true, data: KOMISYONLAR });
});

module.exports = router;
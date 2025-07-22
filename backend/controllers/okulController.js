// controllers/okulController.js
const { pool } = require('../config/database');

class OkulController {
  
  // ===== OKUL ARAMA (KULLANICILAR İÇİN) =====
  
  // Okul arama - Register ve Profile için
  static async searchOkullar(req, res) {
    try {
      const { okul_turu, il, ilce, search, limit = 20, offset = 0 } = req.query;

      if (!okul_turu || !['ortaokul', 'lise'].includes(okul_turu)) {
        return res.status(400).json({
          success: false,
          error: 'Okul türü belirtilmeli (ortaokul/lise)'
        });
      }

      let whereConditions = ['okul_turu = ?'];
      let params = [okul_turu];

      // İl filtresi (zorunlu olabilir)
      if (il) {
        whereConditions.push('il_adi = ?');
        params.push(il.toUpperCase().trim());
      }

      // İlçe filtresi
      if (ilce) {
        whereConditions.push('ilce_adi = ?');
        params.push(ilce.toUpperCase().trim());
      }

      // Arama filtresi (okul adında arama)
      if (search && search.trim()) {
        whereConditions.push('kurum_adi LIKE ?');
        params.push(`%${search.trim()}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM okullar WHERE ${whereConditions.join(' AND ')}`;
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;

      const searchQuery = `
        SELECT id, il_adi, ilce_adi, kurum_adi, kurum_kodu
        FROM okullar 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY kurum_adi ASC
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));

      const [okullar] = await pool.execute(searchQuery, params);

      res.json({
        success: true,
        okullar: okullar,
        pagination: {
          total: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      });

    } catch (error) {
      console.error('Okul arama hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Okul arama işlemi başarısız: ' + error.message
      });
    }
  }

  // İl bazında okul listesi - Select option'ları için
  static async getOkullarByIl(req, res) {
    try {
      const { okul_turu, il } = req.params;
      const { ilce, limit = 100 } = req.query;

      if (!['ortaokul', 'lise'].includes(okul_turu)) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz okul türü'
        });
      }

      let query = `
        SELECT id, il_adi, ilce_adi, kurum_adi
        FROM okullar 
        WHERE okul_turu = ? AND il_adi = ?
      `;
      let params = [okul_turu, il.toUpperCase().trim()];

      if (ilce) {
        query += ` AND ilce_adi = ?`;
        params.push(ilce.toUpperCase().trim());
      }

      query += ` ORDER BY kurum_adi ASC LIMIT ?`;
      params.push(parseInt(limit));

      const [okullar] = await pool.execute(query, params);

      res.json({
        success: true,
        okullar: okullar,
        count: okullar.length
      });

    } catch (error) {
      console.error('İl bazında okul listeleme hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Okul listesi alınamadı: ' + error.message
      });
    }
  }

  // Okul detayı - Profil sayfasında gösterim için
  static async getOkulById(req, res) {
    try {
      const { id } = req.params;

      const [okul] = await pool.execute(
        'SELECT id, il_adi, ilce_adi, kurum_adi, kurum_kodu, okul_turu FROM okullar WHERE id = ?',
        [id]
      );

      if (!okul[0]) {
        return res.status(404).json({
          success: false,
          error: 'Okul bulunamadı'
        });
      }

      res.json({
        success: true,
        okul: okul[0]
      });

    } catch (error) {
      console.error('Okul detay hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Okul detayı alınamadı: ' + error.message
      });
    }
  }

  // Okul varlığını kontrol et - Validation için
  static async checkOkulExists(req, res) {
    try {
      const { id, okul_turu } = req.params;

      const [result] = await pool.execute(
        'SELECT COUNT(*) as count FROM okullar WHERE id = ? AND okul_turu = ?',
        [id, okul_turu]
      );

      res.json({
        success: true,
        exists: result[0].count > 0
      });

    } catch (error) {
      console.error('Okul kontrol hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Okul kontrolü başarısız: ' + error.message
      });
    }
  }

  // İl listesi - Okul seçimi için dropdown
  static async getIllerWithOkul(req, res) {
  try {
    const { okul_turu } = req.params;
    
    // BÜYÜK HARFTAN KÜÇÜK HARFE ÇEVİR
    const cleanOkulTuru = okul_turu ? okul_turu.toLowerCase() : '';
    
    console.log('📋 Original okul_turu:', okul_turu);
    console.log('📋 Cleaned okul_turu:', cleanOkulTuru);

    if (!['ortaokul', 'lise'].includes(cleanOkulTuru)) {
      return res.status(400).json({
        success: false,
        error: `Geçersiz okul türü: "${okul_turu}". Sadece "ortaokul" veya "lise" kabul edilir.`
      });
    }

    const [iller] = await pool.execute(`
      SELECT 
        il_adi, 
        COUNT(*) as okul_sayisi
      FROM okullar 
      WHERE okul_turu = ?
      GROUP BY il_adi 
      ORDER BY il_adi ASC
    `, [cleanOkulTuru]); // Clean version kullan

    res.json({
      success: true,
      iller: iller
    });

  } catch (error) {
    console.error('İl listesi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İl listesi alınamadı: ' + error.message
    });
  }
}

  // İlçe listesi - Okul seçimi için dropdown
 static async getIlcelerWithOkul(req, res) {
  try {
    const { okul_turu, il } = req.params;
    const cleanOkulTuru = okul_turu ? okul_turu.toLowerCase() : '';

    if (!['ortaokul', 'lise'].includes(cleanOkulTuru)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz okul türü'
      });
    }

    const [ilceler] = await pool.execute(`
      SELECT 
        ilce_adi, 
        COUNT(*) as okul_sayisi
      FROM okullar 
      WHERE okul_turu = ? AND il_adi = ? AND ilce_adi IS NOT NULL
      GROUP BY ilce_adi 
      ORDER BY ilce_adi ASC
    `, [cleanOkulTuru, il.toUpperCase().trim()]);

    res.json({
      success: true,
      ilceler: ilceler
    });

  } catch (error) {
    console.error('İlçe listesi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İlçe listesi alınamadı: ' + error.message
    });
  }
}


 // Okul arama - Register ve Profile için
  static async searchOkullar(req, res) {
  try {
    const { okul_turu, il, ilce, search, limit = 20, offset = 0 } = req.query;
    const cleanOkulTuru = okul_turu ? okul_turu.toLowerCase() : '';

    if (!cleanOkulTuru || !['ortaokul', 'lise'].includes(cleanOkulTuru)) {
      return res.status(400).json({
        success: false,
        error: 'Okul türü belirtilmeli (ortaokul/lise)'
      });
    }

    let whereConditions = ['okul_turu = ?'];
    let params = [cleanOkulTuru];

      // İl filtresi (zorunlu olabilir)
      if (il) {
        whereConditions.push('il_adi = ?');
        params.push(il.toUpperCase().trim());
      }

      // İlçe filtresi
      if (ilce) {
        whereConditions.push('ilce_adi = ?');
        params.push(ilce.toUpperCase().trim());
      }

      // Arama filtresi (okul adında arama)
      if (search && search.trim()) {
        whereConditions.push('kurum_adi LIKE ?');
        params.push(`%${search.trim()}%`);
      }

      const countQuery = `SELECT COUNT(*) as total FROM okullar WHERE ${whereConditions.join(' AND ')}`;
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;

      const searchQuery = `
        SELECT id, il_adi, ilce_adi, kurum_adi, kurum_kodu
        FROM okullar 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY kurum_adi ASC
        LIMIT ? OFFSET ?
      `;

      params.push(parseInt(limit), parseInt(offset));

      const [okullar] = await pool.execute(searchQuery, params);

      res.json({
        success: true,
        okullar: okullar,
        pagination: {
          total: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      });

    } catch (error) {
      console.error('Okul arama hatası:', error);
      res.status(500).json({
        success: false,
        error: 'Okul arama işlemi başarısız: ' + error.message
      });
    }
  }

}

module.exports = OkulController;
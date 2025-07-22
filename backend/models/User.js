//models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Kullanıcı oluştur
  static async create(userData) {
    const {
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon,
      
      // Eğitim bilgileri
      ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
      lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
      universite_durumu,
      
      kvkk_onay, aydinlatma_metni_onay
    } = userData;

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (
        isim, soyisim, email, password, dogum_tarihi,
        sektor, meslek, telefon, il, ilce, gonullu_dernek,
        calisma_komisyon,
        
        ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
        lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
        universite_durumu,
        
        kvkk_onay, aydinlatma_metni_onay,
        kvkk_onay_tarihi, aydinlatma_onay_tarihi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        isim, soyisim, email, hashedPassword, dogum_tarihi,
        sektor, meslek, telefon, il, ilce, gonullu_dernek,
        calisma_komisyon,
        
        ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
        lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
        universite_durumu,
        
        kvkk_onay, aydinlatma_metni_onay
      ]
    );

    return result.insertId;
  }

  // Email ile kullanıcı bul
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // ID ile kullanıcı bul - EĞİTİM BİLGİLERİ DAHİL
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id, u.isim, u.soyisim, u.email, u.dogum_tarihi, u.sektor, u.meslek,
        u.telefon, u.il, u.ilce, u.gonullu_dernek, u.calisma_komisyon,
        u.role, u.created_at,
        
        u.ortaokul_durumu, u.ortaokul_id, u.ortaokul_custom, u.ortaokul_mezun_yili, u.ortaokul_sinif,
        u.lise_durumu, u.lise_id, u.lise_custom, u.lise_mezun_yili, u.lise_sinif,
        u.universite_durumu,
        
        u.kvkk_onay, u.aydinlatma_metni_onay,
        u.kvkk_onay_tarihi, u.aydinlatma_onay_tarihi,
        
        -- Okul bilgileri (JOIN)
        ortaokul.kurum_adi as ortaokul_adi,
        ortaokul.il_adi as ortaokul_il,
        ortaokul.ilce_adi as ortaokul_ilce,
        
        lise.kurum_adi as lise_adi,
        lise.il_adi as lise_il,
        lise.ilce_adi as lise_ilce
        
      FROM users u
      LEFT JOIN okullar ortaokul ON u.ortaokul_id = ortaokul.id
      LEFT JOIN okullar lise ON u.lise_id = lise.id
      WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Okul varlığını kontrol et
  static async checkOkulExists(okulId, okulTuru) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM okullar WHERE id = ? AND okul_turu = ?',
      [okulId, okulTuru]
    );
    return rows[0].count > 0;
  }

  // Okul bilgilerini getir
  static async getOkulById(okulId) {
    const [rows] = await pool.execute(
      'SELECT * FROM okullar WHERE id = ?',
      [okulId]
    );
    return rows[0];
  }

  // Şifre kontrol
  static async checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Kullanıcı arama - EĞİTİM FİLTRELERİ DAHİL
  static async search(filters) {
    let query = `
      SELECT 
        u.id, u.isim, u.soyisim, u.sektor, u.meslek, u.il, u.ilce, u.gonullu_dernek, u.created_at,
        u.ortaokul_durumu, u.lise_durumu, u.universite_durumu,
        ortaokul.kurum_adi as ortaokul_adi,
        lise.kurum_adi as lise_adi
      FROM users u
      LEFT JOIN okullar ortaokul ON u.ortaokul_id = ortaokul.id
      LEFT JOIN okullar lise ON u.lise_id = lise.id
      WHERE u.role IN ('uye', 'dernek_admin')
    `;
    const params = [];

    if (filters.name) {
      query += ` AND (u.isim LIKE ? OR u.soyisim LIKE ?)`;
      params.push(`%${filters.name}%`, `%${filters.name}%`);
    }

    if (filters.sektor) {
      query += ` AND u.sektor LIKE ?`;
      params.push(`%${filters.sektor}%`);
    }

    if (filters.il) {
      query += ` AND u.il = ?`;
      params.push(filters.il);
    }

    if (filters.gonullu_dernek) {
      query += ` AND u.gonullu_dernek = ?`;
      params.push(filters.gonullu_dernek);
    }

    // EĞİTİM FİLTRELERİ
    if (filters.ortaokul_durumu) {
      query += ` AND u.ortaokul_durumu = ?`;
      params.push(filters.ortaokul_durumu);
    }

    if (filters.lise_durumu) {
      query += ` AND u.lise_durumu = ?`;
      params.push(filters.lise_durumu);
    }

    if (filters.universite_durumu) {
      query += ` AND u.universite_durumu = ?`;
      params.push(filters.universite_durumu);
    }

    if (filters.ortaokul_mezun_yili) {
      query += ` AND u.ortaokul_mezun_yili = ?`;
      params.push(filters.ortaokul_mezun_yili);
    }

    if (filters.lise_mezun_yili) {
      query += ` AND u.lise_mezun_yili = ?`;
      params.push(filters.lise_mezun_yili);
    }

    query += ` ORDER BY u.isim ASC LIMIT 50`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Profil güncelleme - EĞİTİM BİLGİLERİ DAHİL
  static async updateProfile(userId, updateData) {
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce,
      gonullu_dernek, calisma_komisyon,
      
      // Eğitim bilgileri
      ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
      lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
      universite_durumu
    } = updateData;

    const [result] = await pool.execute(
      `UPDATE users SET
        isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
        telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?,
        
        ortaokul_durumu = ?, ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?, ortaokul_sinif = ?,
        lise_durumu = ?, lise_id = ?, lise_custom = ?, lise_mezun_yili = ?, lise_sinif = ?,
        universite_durumu = ?,
        
        updated_at = NOW()
      WHERE id = ?`,
      [
        isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce, gonullu_dernek, calisma_komisyon,
        ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
        lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
        universite_durumu,
        userId
      ]
    );

    return result.affectedRows > 0;
  }

  // Eğitim istatistikleri
  static async getEducationStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN ortaokul_durumu = 'mezun' THEN 1 ELSE 0 END) as ortaokul_mezun,
        SUM(CASE WHEN ortaokul_durumu = 'devam_ediyor' THEN 1 ELSE 0 END) as ortaokul_devam,
        SUM(CASE WHEN lise_durumu = 'mezun' THEN 1 ELSE 0 END) as lise_mezun,
        SUM(CASE WHEN lise_durumu = 'devam_ediyor' THEN 1 ELSE 0 END) as lise_devam,
        SUM(CASE WHEN universite_durumu = 'mezun' THEN 1 ELSE 0 END) as uni_mezun,
        SUM(CASE WHEN universite_durumu = 'devam_ediyor' THEN 1 ELSE 0 END) as uni_devam
      FROM users WHERE role IN ('uye', 'dernek_admin')
    `);
    return rows[0];
  }
}

module.exports = User;
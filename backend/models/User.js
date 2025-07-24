//models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Kullanıcı oluştur
  static async create(userData) {
    console.log('User.create received data:', userData);
    
    // Tüm undefined değerleri temizle
    const cleanUserData = {
      isim: userData.isim || '',
      soyisim: userData.soyisim || '',
      email: userData.email || '',
      password: userData.password || '',
      dogum_tarihi: userData.dogum_tarihi || null,
      sektor: userData.sektor || '',
      meslek: userData.meslek || '',
      telefon: userData.telefon || '',
      il: userData.il || '',
      ilce: userData.ilce || '',
      gonullu_dernek: userData.gonullu_dernek || '',
      calisma_komisyon: userData.calisma_komisyon || '',
      mezun_okul: userData.mezun_okul || '',
      
      // Eğitim bilgileri - sadece mezun durumu, durumlar kaldırıldı
      ortaokul_id: userData.ortaokul_id || null,
      ortaokul_custom: userData.ortaokul_custom || null,
      ortaokul_mezun_yili: userData.ortaokul_mezun_yili || null,
      
      lise_id: userData.lise_id || null,
      lise_custom: userData.lise_custom || null,
      lise_mezun_yili: userData.lise_mezun_yili || null,
      
      // Üniversite bilgileri - yeni alanlar
      universite_durumu: userData.universite_durumu || 'okumadi',
      universite_adi: userData.universite_adi || null,
      universite_bolum: userData.universite_bolum || null,
      universite_mezun_yili: userData.universite_mezun_yili || null,
      
      kvkk_onay: userData.kvkk_onay ? 1 : 0,
      aydinlatma_metni_onay: userData.aydinlatma_metni_onay ? 1 : 0
    };

    console.log('Cleaned user data:', cleanUserData);

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(cleanUserData.password, 10);

    // Parametreleri array olarak hazırla
    const insertValues = [
      cleanUserData.isim,                    // 1
      cleanUserData.soyisim,                 // 2
      cleanUserData.email,                   // 3
      hashedPassword,                        // 4
      cleanUserData.dogum_tarihi,            // 5
      cleanUserData.sektor,                  // 6
      cleanUserData.meslek,                  // 7
      cleanUserData.telefon,                 // 8
      cleanUserData.il,                      // 9
      cleanUserData.ilce,                    // 10
      cleanUserData.gonullu_dernek,          // 11
      cleanUserData.calisma_komisyon,        // 12
      cleanUserData.mezun_okul,              // 13
      cleanUserData.ortaokul_id,             // 14
      cleanUserData.ortaokul_custom,         // 15
      cleanUserData.ortaokul_mezun_yili,     // 16
      cleanUserData.lise_id,                 // 17
      cleanUserData.lise_custom,             // 18
      cleanUserData.lise_mezun_yili,         // 19
      cleanUserData.universite_durumu,       // 20
      cleanUserData.universite_adi,          // 21
      cleanUserData.universite_bolum,        // 22
      cleanUserData.universite_mezun_yili,   // 23
      cleanUserData.kvkk_onay,               // 24
      cleanUserData.aydinlatma_metni_onay    // 25
    ];

    console.log('Insert values:', insertValues);
    console.log('Insert values length:', insertValues.length);
    console.log('Üniversite bilgileri:', {
      universite_durumu: cleanUserData.universite_durumu,
      universite_adi: cleanUserData.universite_adi,
      universite_bolum: cleanUserData.universite_bolum,
      universite_mezun_yili: cleanUserData.universite_mezun_yili
    });

    // Undefined kontrol
    const hasUndefined = insertValues.some(val => val === undefined);
    if (hasUndefined) {
      console.error('UNDEFINED VALUES FOUND:', insertValues.map((val, index) => val === undefined ? `Index ${index}: undefined` : null).filter(Boolean));
      throw new Error('Undefined values found in insert parameters');
    }

    const [result] = await pool.execute(
      `INSERT INTO users (
        isim, soyisim, email, password, dogum_tarihi,
        sektor, meslek, telefon, il, ilce, gonullu_dernek,
        calisma_komisyon, mezun_okul,
        
        ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
        lise_id, lise_custom, lise_mezun_yili,
        universite_durumu, universite_adi, universite_bolum, universite_mezun_yili,
        
        kvkk_onay, aydinlatma_metni_onay,
        kvkk_onay_tarihi, aydinlatma_onay_tarihi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      insertValues
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
        u.telefon, u.il, u.ilce, u.gonullu_dernek, u.calisma_komisyon, u.mezun_okul,
        u.role, u.created_at,
        
        u.ortaokul_id, u.ortaokul_custom, u.ortaokul_mezun_yili,
        u.lise_id, u.lise_custom, u.lise_mezun_yili,
        u.universite_durumu, u.universite_adi, u.universite_bolum, u.universite_mezun_yili,
        
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
        u.universite_durumu, u.universite_adi, u.universite_bolum,
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

    // EĞİTİM FİLTRELERİ - Sadece üniversite durumu kaldı
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

    if (filters.universite_mezun_yili) {
      query += ` AND u.universite_mezun_yili = ?`;
      params.push(filters.universite_mezun_yili);
    }

    query += ` ORDER BY u.isim ASC LIMIT 50`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Profil güncelleme - EĞİTİM BİLGİLERİ DAHİL
  static async updateProfile(userId, updateData) {
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce,
      gonullu_dernek, calisma_komisyon, mezun_okul,
      
      // Eğitim bilgileri - sadece mezun durumları
      ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
      lise_id, lise_custom, lise_mezun_yili,
      universite_durumu, universite_adi, universite_bolum, universite_mezun_yili
    } = updateData;

    const [result] = await pool.execute(
      `UPDATE users SET
        isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
        telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?, mezun_okul = ?,
        
        ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?,
        lise_id = ?, lise_custom = ?, lise_mezun_yili = ?,
        universite_durumu = ?, universite_adi = ?, universite_bolum = ?, universite_mezun_yili = ?,
        
        updated_at = NOW()
      WHERE id = ?`,
      [
        isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce, gonullu_dernek, calisma_komisyon, mezun_okul,
        ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
        lise_id, lise_custom, lise_mezun_yili,
        universite_durumu, universite_adi, universite_bolum, universite_mezun_yili,
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
        SUM(CASE WHEN ortaokul_mezun_yili IS NOT NULL THEN 1 ELSE 0 END) as ortaokul_mezun,
        SUM(CASE WHEN lise_mezun_yili IS NOT NULL THEN 1 ELSE 0 END) as lise_mezun,
        SUM(CASE WHEN universite_durumu = 'mezun' THEN 1 ELSE 0 END) as uni_mezun,
        SUM(CASE WHEN universite_durumu = 'devam_ediyor' THEN 1 ELSE 0 END) as uni_devam,
        SUM(CASE WHEN universite_durumu = 'okumadi' THEN 1 ELSE 0 END) as uni_okumadi
      FROM users WHERE role IN ('uye', 'dernek_admin')
    `);
    return rows[0];
  }
}

module.exports = User;
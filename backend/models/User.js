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
      aydinlatma_metni_onay: userData.aydinlatma_metni_onay ? 1 : 0,
      
      // Profil fotoğrafı - register sırasında null
      profil_fotografi: userData.profil_fotografi || null,
      
      // GİZLİLİK AYARLARI - VARSAYILAN DEĞERLER
      show_email: userData.show_email !== undefined ? userData.show_email : 1,
      show_phone: userData.show_phone !== undefined ? userData.show_phone : 0
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
      cleanUserData.aydinlatma_metni_onay,   // 25
      cleanUserData.profil_fotografi,        // 26
      cleanUserData.show_email,              // 27 - YENİ
      cleanUserData.show_phone               // 28 - YENİ
    ];

    console.log('Insert values:', insertValues);
    console.log('Insert values length:', insertValues.length);

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
        
        kvkk_onay, aydinlatma_metni_onay, profil_fotografi,
        show_email, show_phone,
        kvkk_onay_tarihi, aydinlatma_onay_tarihi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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

  // ID ile kullanıcı bul - EĞİTİM BİLGİLERİ VE PROFİL FOTOĞRAFI DAHİL
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id, u.isim, u.soyisim, u.email, u.dogum_tarihi, u.sektor, u.meslek,
        u.telefon, u.il, u.ilce, u.gonullu_dernek, u.calisma_komisyon, u.mezun_okul,
        u.role, u.created_at, u.profil_fotografi, u.show_email, u.show_phone,
        
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

  // Kullanıcı arama - EĞİTİM FİLTRELERİ VE PROFİL FOTOĞRAFI DAHİL
  static async search(filters) {
    let query = `
      SELECT 
        u.id, u.isim, u.soyisim, u.sektor, u.meslek, u.il, u.ilce, u.gonullu_dernek, u.created_at,
        u.universite_durumu, u.universite_adi, u.universite_bolum, u.profil_fotografi,
        u.show_email, u.show_phone,
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

  // Profil güncelleme - EĞİTİM BİLGİLERİ VE PROFİL FOTOĞRAFI DAHİL
  static async updateProfile(userId, updateData) {
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce,
      gonullu_dernek, calisma_komisyon, mezun_okul,
      
      // Eğitim bilgileri - sadece mezun durumları
      ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
      lise_id, lise_custom, lise_mezun_yili,
      universite_durumu, universite_adi, universite_bolum, universite_mezun_yili,
      
      // Profil fotoğrafı
      profil_fotografi,
      
      // GİZLİLİK AYARLARI - YENİ
      show_email, show_phone
    } = updateData;

    // Tüm undefined değerleri null'a çevir ve tarih formatını düzelt
    const cleanData = {
      isim: isim || null,
      soyisim: soyisim || null,
      dogum_tarihi: dogum_tarihi ? (dogum_tarihi.split('T')[0]) : null, // ISO tarihini YYYY-MM-DD'ye çevir
      sektor: sektor || null,
      meslek: meslek || null,
      telefon: telefon || null,
      il: il || null,
      ilce: ilce || null,
      gonullu_dernek: gonullu_dernek || null,
      calisma_komisyon: calisma_komisyon || null,
      mezun_okul: mezun_okul || null,
      
      ortaokul_id: ortaokul_id || null,
      ortaokul_custom: ortaokul_custom || null,
      ortaokul_mezun_yili: ortaokul_mezun_yili || null,
      
      lise_id: lise_id || null,
      lise_custom: lise_custom || null,
      lise_mezun_yili: lise_mezun_yili || null,
      
      universite_durumu: universite_durumu || 'okumadi',
      universite_adi: universite_adi || null,
      universite_bolum: universite_bolum || null,
      universite_mezun_yili: universite_mezun_yili || null
    };

    let updateFields = `
      isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
      telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?, mezun_okul = ?,
      
      ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?,
      lise_id = ?, lise_custom = ?, lise_mezun_yili = ?,
      universite_durumu = ?, universite_adi = ?, universite_bolum = ?, universite_mezun_yili = ?,
      
      updated_at = NOW()
    `;

    let updateValues = [
      cleanData.isim, cleanData.soyisim, cleanData.dogum_tarihi, 
      cleanData.sektor, cleanData.meslek, cleanData.telefon, 
      cleanData.il, cleanData.ilce, cleanData.gonullu_dernek, 
      cleanData.calisma_komisyon, cleanData.mezun_okul,
      
      cleanData.ortaokul_id, cleanData.ortaokul_custom, cleanData.ortaokul_mezun_yili,
      cleanData.lise_id, cleanData.lise_custom, cleanData.lise_mezun_yili,
      cleanData.universite_durumu, cleanData.universite_adi, 
      cleanData.universite_bolum, cleanData.universite_mezun_yili
    ];

    // Profil fotoğrafı güncellemesi varsa ekle
    if (profil_fotografi !== undefined) {
      updateFields = `
        isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
        telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?, mezun_okul = ?,
        
        ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?,
        lise_id = ?, lise_custom = ?, lise_mezun_yili = ?,
        universite_durumu = ?, universite_adi = ?, universite_bolum = ?, universite_mezun_yili = ?,
        
        profil_fotografi = ?,
        updated_at = NOW()
      `;
      updateValues.push(profil_fotografi || null);
    }

    // GİZLİLİK AYARLARI GÜNCELLEMESİ - YENİ
    if (show_email !== undefined || show_phone !== undefined) {
      if (profil_fotografi !== undefined) {
        updateFields = `
          isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
          telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?, mezun_okul = ?,
          
          ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?,
          lise_id = ?, lise_custom = ?, lise_mezun_yili = ?,
          universite_durumu = ?, universite_adi = ?, universite_bolum = ?, universite_mezun_yili = ?,
          
          profil_fotografi = ?, show_email = ?, show_phone = ?,
          updated_at = NOW()
        `;
        updateValues.push(show_email !== undefined ? (show_email ? 1 : 0) : null);
        updateValues.push(show_phone !== undefined ? (show_phone ? 1 : 0) : null);
      } else {
        updateFields = `
          isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?, 
          telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, calisma_komisyon = ?, mezun_okul = ?,
          
          ortaokul_id = ?, ortaokul_custom = ?, ortaokul_mezun_yili = ?,
          lise_id = ?, lise_custom = ?, lise_mezun_yili = ?,
          universite_durumu = ?, universite_adi = ?, universite_bolum = ?, universite_mezun_yili = ?,
          
          show_email = ?, show_phone = ?,
          updated_at = NOW()
        `;
        updateValues.push(show_email !== undefined ? (show_email ? 1 : 0) : null);
        updateValues.push(show_phone !== undefined ? (show_phone ? 1 : 0) : null);
      }
    }

    // Undefined kontrol
    const hasUndefined = updateValues.some(val => val === undefined);
    if (hasUndefined) {
      console.error('UNDEFINED VALUES FOUND in updateProfile:', updateValues.map((val, index) => val === undefined ? `Index ${index}: undefined` : null).filter(Boolean));
      throw new Error('Undefined values found in update parameters');
    }

    updateValues.push(userId);

    console.log('Update SQL values:', updateValues);

    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      updateValues
    );

    return result.affectedRows > 0;
  }

  // GİZLİLİK AYARLARI GÜNCELLEME FONKSİYONU - YENİ
  static async updatePrivacySettings(userId, privacyData) {
    const { show_email, show_phone } = privacyData;

    console.log('Updating privacy settings for user:', userId, { show_email, show_phone });

    const [result] = await pool.execute(
      `UPDATE users SET 
        show_email = ?, 
        show_phone = ?, 
        updated_at = NOW() 
      WHERE id = ?`,
      [
        show_email !== undefined ? (show_email ? 1 : 0) : null,
        show_phone !== undefined ? (show_phone ? 1 : 0) : null,
        userId
      ]
    );

    return result.affectedRows > 0;
  }

  // KULLANICI BİLGİLERİNİ GİZLİLİK AYARLARINA GÖRE FİLTRELE - YENİ
  static filterUserDataByPrivacy(user, viewerId = null) {
    // Eğer kendi profilini görüyorsa veya admin ise tam bilgileri döndür
    if (viewerId && (viewerId === user.id || user.role === 'super_admin')) {
      return user;
    }

    // Gizlilik ayarlarına göre bilgileri filtrele
    const filteredUser = { ...user };

    // E-posta gizliliği
    if (!user.show_email) {
      filteredUser.email = null;
    }

    // Telefon gizliliği
    if (!user.show_phone) {
      filteredUser.telefon = null;
    }

    return filteredUser;
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
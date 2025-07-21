const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Kullanıcı oluştur
  static async create(userData) {
    const {
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul,
      kvkk_onay, aydinlatma_metni_onay // YENİ ALANLAR
    } = userData;

    // Şifreyi hashle - bcrypt zaten üstte require edilmiş
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (
        isim, soyisim, email, password, dogum_tarihi,
        sektor, meslek, telefon, il, ilce, gonullu_dernek,
        calisma_komisyon, mezun_okul,
        kvkk_onay, aydinlatma_metni_onay, 
        kvkk_onay_tarihi, aydinlatma_onay_tarihi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        isim, soyisim, email, hashedPassword, dogum_tarihi,
        sektor, meslek, telefon, il, ilce, gonullu_dernek,
        calisma_komisyon, mezun_okul,
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

  // ID ile kullanıcı bul
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, isim, soyisim, email, dogum_tarihi, sektor, meslek,
              telefon, il, ilce, gonullu_dernek, calisma_komisyon,
              mezun_okul, role, created_at,
              kvkk_onay, aydinlatma_metni_onay, 
              kvkk_onay_tarihi, aydinlatma_onay_tarihi
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // Şifre kontrol
  static async checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Kullanıcı arama
  static async search(filters) {
    let query = `
      SELECT id, isim, soyisim, sektor, meslek, il, ilce, gonullu_dernek, created_at 
      FROM users 
      WHERE role IN ('uye', 'dernek_admin')
    `;
    const params = [];

    if (filters.name) {
      query += ` AND (isim LIKE ? OR soyisim LIKE ?)`;
      params.push(`%${filters.name}%`, `%${filters.name}%`);
    }

    if (filters.sektor) {
      query += ` AND sektor LIKE ?`;
      params.push(`%${filters.sektor}%`);
    }

    if (filters.il) {
      query += ` AND il = ?`;
      params.push(filters.il);
    }

    if (filters.gonullu_dernek) {
      query += ` AND gonullu_dernek = ?`;
      params.push(filters.gonullu_dernek);
    }

    query += ` ORDER BY isim ASC LIMIT 50`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = User;
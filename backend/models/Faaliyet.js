const { pool } = require('../config/database');

class Faaliyet {
  // Faaliyet oluştur
  static async create(faaliyetData) {
    const { user_id, baslik, aciklama, gorseller } = faaliyetData;

    const [result] = await pool.execute(
      `INSERT INTO faaliyet_paylasimlar 
       (user_id, baslik, aciklama, gorseller) 
       VALUES (?, ?, ?, ?)`,
      [user_id, baslik || null, aciklama || null, JSON.stringify(gorseller || [])]
    );

    return result.insertId;
  }

  // Faaliyet detayını getir
  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        u.isim,
        u.soyisim,
        u.gonullu_dernek,
        u.il,
        u.ilce
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [id]);

    if (rows[0] && rows[0].gorseller) {
      rows[0].gorseller = JSON.parse(rows[0].gorseller);
    }

    return rows[0];
  }

  // Tüm faaliyetleri getir (sayfalama ile)
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        f.id,
        f.baslik,
        f.aciklama,
        f.gorseller,
        f.created_at,
        u.isim,
        u.soyisim,
        u.gonullu_dernek,
        u.il,
        u.ilce
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];

    // Kullanıcı filtresi
    if (filters.user_id) {
      conditions.push('f.user_id = ?');
      params.push(filters.user_id);
    }

    // İl filtresi
    if (filters.il) {
      conditions.push('u.il = ?');
      params.push(filters.il);
    }

    // İlçe filtresi
    if (filters.ilce) {
      conditions.push('u.ilce = ?');
      params.push(filters.ilce);
    }

    // Dernek filtresi
    if (filters.dernek) {
      conditions.push('u.gonullu_dernek = ?');
      params.push(filters.dernek);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY f.created_at DESC';

    // Sayfalama
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // JSON parse gorseller
    return rows.map(row => ({
      ...row,
      gorseller: row.gorseller ? JSON.parse(row.gorseller) : []
    }));
  }

  // Kullanıcının kendi faaliyetleri
  static async getByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        u.isim,
        u.soyisim,
        u.gonullu_dernek
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    return rows.map(row => ({
      ...row,
      gorseller: row.gorseller ? JSON.parse(row.gorseller) : []
    }));
  }

  // Faaliyet güncelle (sadece kendi)
  static async updateById(id, userId, updateData) {
    const { baslik, aciklama, gorseller } = updateData;

    const [result] = await pool.execute(`
      UPDATE faaliyet_paylasimlar 
      SET baslik = ?, aciklama = ?, gorseller = ?, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `, [
      baslik || null,
      aciklama || null,
      JSON.stringify(gorseller || []),
      id,
      userId
    ]);

    return result.affectedRows > 0;
  }

  // Faaliyet sil (sadece kendi)
  static async deleteById(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM faaliyet_paylasimlar WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return result.affectedRows > 0;
  }

  // Faaliyet sayısı (istatistik için)
  static async getCount(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
    `;
    
    const conditions = [];
    const params = [];

    if (filters.user_id) {
      conditions.push('f.user_id = ?');
      params.push(filters.user_id);
    }

    if (filters.il) {
      conditions.push('u.il = ?');
      params.push(filters.il);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Faaliyet;
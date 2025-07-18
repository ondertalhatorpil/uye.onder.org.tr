// models/Faaliyet.js - Güncellenmiş versiyon
const { pool } = require('../config/database');

class Faaliyet {
  // Faaliyet oluştur (artık 'beklemede' durumunda)
  static async create(faaliyetData) {
    const { user_id, baslik, aciklama, gorseller } = faaliyetData;

    const [result] = await pool.execute(
      `INSERT INTO faaliyet_paylasimlar 
       (user_id, baslik, aciklama, gorseller, durum) 
       VALUES (?, ?, ?, ?, 'beklemede')`,
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
        u.ilce,
        admin.isim as onaylayan_admin_isim,
        admin.soyisim as onaylayan_admin_soyisim
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users admin ON f.onaylayan_admin_id = admin.id
      WHERE f.id = ?
    `, [id]);

    if (rows[0] && rows[0].gorseller) {
      rows[0].gorseller = JSON.parse(rows[0].gorseller);
    }

    return rows[0];
  }

  // Onaylanmış faaliyetleri getir (tarih filtreleme ile)
  static async getOnaylanmisFaaliyetler(filters = {}) {
    try {
      let whereConditions = ['f.durum = ?'];
      let queryParams = ['onaylandi'];

      // Lokasyon filtreleri
      if (filters.il) {
        whereConditions.push('u.il = ?');
        queryParams.push(filters.il);
      }

      if (filters.ilce) {
        whereConditions.push('u.ilce = ?');
        queryParams.push(filters.ilce);
      }

      if (filters.dernek) {
        whereConditions.push('u.gonullu_dernek = ?');
        queryParams.push(filters.dernek);
      }

      if (filters.user_id) {
        whereConditions.push('f.user_id = ?');
        queryParams.push(filters.user_id);
      }

      // YENİ: Tarih filtreleri
      if (filters.baslangic_tarihi) {
        whereConditions.push('DATE(f.created_at) >= ?');
        queryParams.push(filters.baslangic_tarihi);
      }

      if (filters.bitis_tarihi) {
        whereConditions.push('DATE(f.created_at) <= ?');
        queryParams.push(filters.bitis_tarihi);
      }

      const whereClause = whereConditions.join(' AND ');
      
      const query = `
        SELECT 
          f.*,
          u.isim,
          u.soyisim,
          u.gonullu_dernek,
          u.il,
          u.ilce,
          u.role
        FROM faaliyet_paylasimlar f
        JOIN users u ON f.user_id = u.id
        WHERE ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(filters.limit || 20, filters.offset || 0);

      const [rows] = await pool.execute(query, queryParams);
      
      // Görselleri parse et
      return rows.map(row => ({
        ...row,
        gorseller: row.gorseller ? JSON.parse(row.gorseller) : []
      }));

    } catch (error) {
      console.error('Faaliyet getOnaylanmisFaaliyetler error:', error);
      throw error;
    }
  }

  // Tüm faaliyetleri getir (admin için - durum filtresi ile)
  static async getAllWithStatus(filters = {}) {
    let query = `
      SELECT 
        f.id,
        f.baslik,
        f.aciklama,
        f.gorseller,
        f.created_at,
        f.durum,
        f.onay_tarihi,
        f.red_nedeni,
        u.isim,
        u.soyisim,
        u.gonullu_dernek,
        u.il,
        u.ilce,
        admin.isim as onaylayan_admin_isim,
        admin.soyisim as onaylayan_admin_soyisim
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users admin ON f.onaylayan_admin_id = admin.id
    `;
    
    const conditions = [];
    const params = [];

    // Durum filtresi
    if (filters.durum && filters.durum.trim() !== '') {
      conditions.push('f.durum = ?');
      params.push(filters.durum.trim());
    }

    // Kullanıcı filtresi
    if (filters.user_id) {
      conditions.push('f.user_id = ?');
      params.push(filters.user_id);
    }

    // İl filtresi
    if (filters.il && filters.il.trim() !== '') {
      conditions.push('u.il = ?');
      params.push(filters.il.trim());
    }

    // İlçe filtresi
    if (filters.ilce && filters.ilce.trim() !== '') {
      conditions.push('u.ilce = ?');
      params.push(filters.ilce.trim());
    }

    // Dernek filtresi
    if (filters.dernek && filters.dernek.trim() !== '') {
      conditions.push('u.gonullu_dernek LIKE ?');
      params.push(`%${filters.dernek.trim()}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY f.created_at DESC';

    // Pagination
    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;
    
    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      throw new Error('Invalid limit or offset values');
    }
    
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.execute(query, params);

    return rows.map(row => ({
      ...row,
      gorseller: row.gorseller ? JSON.parse(row.gorseller) : []
    }));
  }

  // Bekleyen faaliyetleri getir (admin için)
  static async getBekleyenFaaliyetler(filters = {}) {
    return await this.getAllWithStatus({
      ...filters,
      durum: 'beklemede'
    });
  }

  // Kullanıcının kendi faaliyetleri (tüm durumları ile)
  static async getByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        f.*,
        u.isim,
        u.soyisim,
        u.gonullu_dernek,
        admin.isim as onaylayan_admin_isim,
        admin.soyisim as onaylayan_admin_soyisim
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users admin ON f.onaylayan_admin_id = admin.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    return rows.map(row => ({
      ...row,
      gorseller: row.gorseller ? JSON.parse(row.gorseller) : []
    }));
  }

  // Faaliyet onaylama
  static async onaylaFaaliyet(faaliyetId, adminId) {
    const [result] = await pool.execute(`
      UPDATE faaliyet_paylasimlar 
      SET durum = 'onaylandi', 
          onaylayan_admin_id = ?, 
          onay_tarihi = NOW(),
          red_nedeni = NULL
      WHERE id = ? AND durum = 'beklemede'
    `, [adminId, faaliyetId]);

    return result.affectedRows > 0;
  }

  // Faaliyet reddetme
  static async reddetFaaliyet(faaliyetId, adminId, redNedeni) {
    const [result] = await pool.execute(`
      UPDATE faaliyet_paylasimlar 
      SET durum = 'reddedildi', 
          onaylayan_admin_id = ?, 
          onay_tarihi = NOW(),
          red_nedeni = ?
      WHERE id = ? AND durum = 'beklemede'
    `, [adminId, redNedeni, faaliyetId]);

    return result.affectedRows > 0;
  }

  // Faaliyet güncelle (sadece kendi ve beklemede olan)
  static async updateById(id, userId, updateData) {
    const { baslik, aciklama, gorseller } = updateData;

    const [result] = await pool.execute(`
      UPDATE faaliyet_paylasimlar 
      SET baslik = ?, 
          aciklama = ?, 
          gorseller = ?, 
          updated_at = NOW(),
          durum = 'beklemede',
          onaylayan_admin_id = NULL,
          onay_tarihi = NULL,
          red_nedeni = NULL
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

 static async getCount(filters = {}) {
    try {
      let whereConditions = [];
      let queryParams = [];

      // Durum filtresi (varsayılan olarak onaylandı)
      if (filters.durum) {
        whereConditions.push('f.durum = ?');
        queryParams.push(filters.durum);
      }

      // Lokasyon filtreleri
      if (filters.il) {
        whereConditions.push('u.il = ?');
        queryParams.push(filters.il);
      }

      if (filters.ilce) {
        whereConditions.push('u.ilce = ?');
        queryParams.push(filters.ilce);
      }

      if (filters.dernek) {
        whereConditions.push('u.gonullu_dernek = ?');
        queryParams.push(filters.dernek);
      }

      if (filters.user_id) {
        whereConditions.push('f.user_id = ?');
        queryParams.push(filters.user_id);
      }

      // YENİ: Tarih filtreleri
      if (filters.baslangic_tarihi) {
        whereConditions.push('DATE(f.created_at) >= ?');
        queryParams.push(filters.baslangic_tarihi);
      }

      if (filters.bitis_tarihi) {
        whereConditions.push('DATE(f.created_at) <= ?');
        queryParams.push(filters.bitis_tarihi);
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      const query = `
        SELECT COUNT(*) as total
        FROM faaliyet_paylasimlar f
        JOIN users u ON f.user_id = u.id
        ${whereClause}
      `;

      const [rows] = await pool.execute(query, queryParams);
      return rows[0].total;

    } catch (error) {
      console.error('Faaliyet getCount error:', error);
      throw error;
    }
  }

  // Onay istatistikleri
  static async getOnayStats() {
    const [rows] = await pool.execute(`
      SELECT 
        durum,
        COUNT(*) as sayi
      FROM faaliyet_paylasimlar
      GROUP BY durum
    `);

    const stats = {
      beklemede: 0,
      onaylandi: 0,
      reddedildi: 0,
      toplam: 0
    };

    rows.forEach(row => {
      stats[row.durum] = row.sayi;
      stats.toplam += row.sayi;
    });

    return stats;
  }
}

module.exports = Faaliyet;
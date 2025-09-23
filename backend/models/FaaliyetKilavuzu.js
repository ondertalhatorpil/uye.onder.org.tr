// models/FaaliyetKilavuzu.js
const { pool } = require('../config/database');

class FaaliyetKilavuzu {
  
  // Tüm faaliyetleri getir (tarih sıralı)
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      ORDER BY fk.tarih ASC
    `);
    return rows;
  }

  // Belirli tarih aralığındaki faaliyetleri getir
  static async getByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.tarih BETWEEN ? AND ?
      ORDER BY fk.tarih ASC
    `, [startDate, endDate]);
    return rows;
  }

  // Belirli bir tarihteki faaliyeti getir
  static async getByDate(date) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.tarih = ?
    `, [date]);
    return rows[0];
  }

  // ID ile faaliyet getir
  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.id = ?
    `, [id]);
    return rows[0];
  }

  // Yeni faaliyet oluştur
  static async create(faaliyetData) {
    const { tarih, etkinlik_adi, konu, icerik, created_by } = faaliyetData;
    
    const [result] = await pool.execute(`
      INSERT INTO faaliyet_kilavuzu (tarih, etkinlik_adi, konu, icerik, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [tarih, etkinlik_adi, konu, icerik, created_by]);
    
    return result.insertId;
  }

  // Faaliyet güncelle
  static async update(id, updateData) {
    const { tarih, etkinlik_adi, konu, icerik } = updateData;
    
    const [result] = await pool.execute(`
      UPDATE faaliyet_kilavuzu 
      SET tarih = ?, etkinlik_adi = ?, konu = ?, icerik = ?, updated_at = NOW()
      WHERE id = ?
    `, [tarih, etkinlik_adi, konu, icerik, id]);
    
    return result.affectedRows > 0;
  }

  // Faaliyet sil
  static async delete(id) {
    const [result] = await pool.execute(`
      DELETE FROM faaliyet_kilavuzu WHERE id = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }

  // Bugünün, dünün ve yarının faaliyetlerini getir
  static async getDunBugunYarin() {
    const today = new Date();
    const yesterday = new Date(today);
    const tomorrow = new Date(today);
    
    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname,
        CASE 
          WHEN fk.tarih = ? THEN 'dun'
          WHEN fk.tarih = ? THEN 'bugun'
          WHEN fk.tarih = ? THEN 'yarin'
          ELSE 'diger'
        END as gun_durumu
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.tarih IN (?, ?, ?)
      ORDER BY fk.tarih ASC
    `, [
      formatDate(yesterday), formatDate(today), formatDate(tomorrow),
      formatDate(yesterday), formatDate(today), formatDate(tomorrow)
    ]);
    
    return {
      dun: rows.find(r => r.gun_durumu === 'dun') || null,
      bugun: rows.find(r => r.gun_durumu === 'bugun') || null,
      yarin: rows.find(r => r.gun_durumu === 'yarin') || null
    };
  }

  // Hafta bazında faaliyetleri getir
  static async getHaftalikFaaliyetler() {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.konu, fk.icerik,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname,
        WEEK(fk.tarih, 1) as hafta_no,
        YEAR(fk.tarih) as yil,
        DAYNAME(fk.tarih) as gun_adi,
        DAYOFWEEK(fk.tarih) as gun_no
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      ORDER BY fk.tarih ASC
    `);
    
    // Hafta bazında grupla
    const haftalar = {};
    rows.forEach(row => {
      const haftaKey = `${row.yil}-W${row.hafta_no}`;
      if (!haftalar[haftaKey]) {
        haftalar[haftaKey] = {
          hafta_no: row.hafta_no,
          yil: row.yil,
          faaliyetler: []
        };
      }
      haftalar[haftaKey].faaliyetler.push(row);
    });
    
    return Object.values(haftalar);
  }

  // Tarih kontrolü - aynı tarihte faaliyet var mı?
  static async checkDateExists(tarih, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM faaliyet_kilavuzu WHERE tarih = ?';
    let params = [tarih];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].count > 0;
  }

  // İstatistikler
  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
        COUNT(DISTINCT WEEK(tarih, 1)) as toplam_hafta,
        MIN(tarih) as en_eski_tarih,
        MAX(tarih) as en_yeni_tarih,
        AVG(CHAR_LENGTH(icerik)) as ortalama_icerik_uzunluk
      FROM faaliyet_kilavuzu
    `);
    return rows[0];
  }
}

module.exports = FaaliyetKilavuzu;
// models/FaaliyetKilavuzu.js
const { pool } = require('../config/database');
const { getWeekNumber } = require('../config/schoolYear');

class FaaliyetKilavuzu {
  
  // Tüm faaliyetleri getir (tarih sıralı) - Hafta numarası ile birlikte
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      ORDER BY fk.tarih ASC
    `);
    
    // Her faaliyet için hafta numarasını hesapla
    return rows.map(row => ({
      ...row,
      hafta_no: getWeekNumber(row.tarih)
    }));
  }

  // Belirli tarih aralığındaki faaliyetleri getir
  static async getByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.tarih BETWEEN ? AND ?
      ORDER BY fk.tarih ASC
    `, [startDate, endDate]);
    
    return rows.map(row => ({
      ...row,
      hafta_no: getWeekNumber(row.tarih)
    }));
  }

  // Belirli bir tarihteki faaliyeti getir
  static async getByDate(date) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.tarih = ?
    `, [date]);
    
    if (!rows[0]) return null;
    
    return {
      ...rows[0],
      hafta_no: getWeekNumber(rows[0].tarih)
    };
  }

  // ID ile faaliyet getir
  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      WHERE fk.id = ?
    `, [id]);
    
    if (!rows[0]) return null;
    
    return {
      ...rows[0],
      hafta_no: getWeekNumber(rows[0].tarih)
    };
  }

  // Yeni faaliyet oluştur
  static async create(faaliyetData) {
    const { tarih, etkinlik_adi, icerik, gorsel_path, created_by } = faaliyetData;
    
    const [result] = await pool.execute(`
      INSERT INTO faaliyet_kilavuzu (tarih, etkinlik_adi, icerik, gorsel_path, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [tarih, etkinlik_adi, icerik || null, gorsel_path || null, created_by]);
    
    return result.insertId;
  }

  // Faaliyet güncelle
  static async update(id, updateData) {
    const { tarih, etkinlik_adi, icerik, gorsel_path } = updateData;
    
    const [result] = await pool.execute(`
      UPDATE faaliyet_kilavuzu 
      SET tarih = ?, etkinlik_adi = ?, icerik = ?, gorsel_path = ?, updated_at = NOW()
      WHERE id = ?
    `, [tarih, etkinlik_adi, icerik || null, gorsel_path || null, id]);
    
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
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
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
    
    const dunData = rows.find(r => r.gun_durumu === 'dun');
    const bugunData = rows.find(r => r.gun_durumu === 'bugun');
    const yarinData = rows.find(r => r.gun_durumu === 'yarin');
    
    return {
      dun: dunData ? { ...dunData, hafta_no: getWeekNumber(dunData.tarih) } : null,
      bugun: bugunData ? { ...bugunData, hafta_no: getWeekNumber(bugunData.tarih) } : null,
      yarin: yarinData ? { ...yarinData, hafta_no: getWeekNumber(yarinData.tarih) } : null
    };
  }

  // Hafta bazında faaliyetleri getir
  static async getHaftalikFaaliyetler() {
    const [rows] = await pool.execute(`
      SELECT 
        fk.id, fk.tarih, fk.etkinlik_adi, fk.icerik, fk.gorsel_path,
        fk.created_at, fk.updated_at,
        u.isim as created_by_name, u.soyisim as created_by_surname,
        DAYNAME(fk.tarih) as gun_adi,
        DAYOFWEEK(fk.tarih) as gun_no
      FROM faaliyet_kilavuzu fk
      LEFT JOIN users u ON fk.created_by = u.id
      ORDER BY fk.tarih ASC
    `);
    
    // Hafta bazında grupla (okul haftalarına göre)
    const haftalar = {};
    
    rows.forEach(row => {
      const haftaNo = getWeekNumber(row.tarih);
      
      // Eğer hafta numarası geçerliyse
      if (haftaNo) {
        if (!haftalar[haftaNo]) {
          haftalar[haftaNo] = {
            hafta_no: haftaNo,
            faaliyetler: []
          };
        }
        haftalar[haftaNo].faaliyetler.push({
          ...row,
          hafta_no: haftaNo
        });
      }
    });
    
    // Object'i array'e çevir ve hafta numarasına göre sırala
    return Object.values(haftalar).sort((a, b) => a.hafta_no - b.hafta_no);
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
        COUNT(CASE WHEN gorsel_path IS NOT NULL THEN 1 END) as gorsel_olan_faaliyet,
        COUNT(CASE WHEN icerik IS NOT NULL AND icerik != '' THEN 1 END) as icerik_olan_faaliyet,
        MIN(tarih) as en_eski_tarih,
        MAX(tarih) as en_yeni_tarih,
        AVG(CHAR_LENGTH(icerik)) as ortalama_icerik_uzunluk
      FROM faaliyet_kilavuzu
    `);
    
    return rows[0];
  }
}

module.exports = FaaliyetKilavuzu;
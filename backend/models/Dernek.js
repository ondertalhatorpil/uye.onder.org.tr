const { pool } = require('../config/database');

class Dernek {
  // ID ile dernek getir
  static async getById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          d.*,
          u.isim as admin_isim,
          u.soyisim as admin_soyisim,
          u.email as admin_email,
          (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
        FROM dernekler d
        LEFT JOIN users u ON d.admin_user_id = u.id
        WHERE d.id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      console.error('Dernek getById error:', error);
      throw error;
    }
  }

  // İl/İlçeye göre dernekleri getir
  static async getByLocation(il, ilce = null) {
    try {
      let query = `
        SELECT 
          id, dernek_adi, dernek_baskani, dernek_telefon, il, ilce,
          dernek_latitude, dernek_longitude, dernek_adres,
          (SELECT COUNT(*) FROM users WHERE gonullu_dernek = dernekler.dernek_adi) as uye_sayisi
        FROM dernekler 
        WHERE il = ?
      `;
      let params = [il];

      if (ilce) {
        query += ' AND ilce = ?';
        params.push(ilce);
      }

      query += ' ORDER BY dernek_adi ASC';

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Dernek getByLocation error:', error);
      throw error;
    }
  }

  // Dernek ismine göre getir
  static async getByName(dernekAdi) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          d.*,
          (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
        FROM dernekler d
        WHERE d.dernek_adi = ?
      `, [dernekAdi]);
      
      return rows[0];
    } catch (error) {
      console.error('Dernek getByName error:', error);
      throw error;
    }
  }

  // Tüm dernekleri getir
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          d.*,
          u.isim as admin_isim,
          u.soyisim as admin_soyisim,
          (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
        FROM dernekler d
        LEFT JOIN users u ON d.admin_user_id = u.id
        ORDER BY d.il, d.ilce, d.dernek_adi
      `);
      return rows;
    } catch (error) {
      console.error('Dernek getAll error:', error);
      throw error;
    }
  }

  // Konum bilgisi olan dernekleri getir (harita için)
  static async getAllWithLocation() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          d.id, d.dernek_adi, d.dernek_baskani, d.il, d.ilce,
          d.dernek_latitude, d.dernek_longitude, d.dernek_adres,
          d.dernek_telefon, d.dernek_email,
          (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
        FROM dernekler d
        WHERE d.dernek_latitude IS NOT NULL 
          AND d.dernek_longitude IS NOT NULL
        ORDER BY d.dernek_adi
      `);
      return rows;
    } catch (error) {
      console.error('Dernek getAllWithLocation error:', error);
      throw error;
    }
  }

  // Dernek üyelerini getir
  static async getMembers(dernekAdi) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id, isim, soyisim, sektor, meslek, il, ilce, 
          calisma_komisyon, role, created_at
        FROM users 
        WHERE gonullu_dernek = ? 
          AND role IN ('uye', 'dernek_admin')
        ORDER BY 
          CASE WHEN role = 'dernek_admin' THEN 0 ELSE 1 END,
          isim ASC
      `, [dernekAdi]);
      
      return rows;
    } catch (error) {
      console.error('Dernek getMembers error:', error);
      throw error;
    }
  }

  // Excel'den toplu dernek ekleme
  static async bulkInsert(dernekData) {
    try {
      let insertedCount = 0;
      
      for (const dernek of dernekData) {
        try {
          const [result] = await pool.execute(
            `INSERT IGNORE INTO dernekler 
             (dernek_adi, il, ilce, dernek_baskani, dernek_telefon, dernek_email) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              dernek.dernek_adi,
              dernek.il,
              dernek.ilce,
              dernek.dernek_baskani,
              dernek.dernek_telefon,
              dernek.dernek_email
            ]
          );
          
          if (result.affectedRows > 0) {
            insertedCount++;
          }
        } catch (insertError) {
          console.error(`Dernek eklenirken hata (${dernek.dernek_adi}):`, insertError.message);
        }
      }
      
      return insertedCount;
    } catch (error) {
      console.error('Dernek bulkInsert error:', error);
      throw error;
    }
  }

  // Dernek güncelleme (admin) - Konum bilgisi dahil
  static async updateByAdmin(dernekId, adminUserId, updateData) {
    try {
      const {
        dernek_adi, dernek_baskani, dernek_telefon, 
        dernek_sosyal_medya_hesaplari, dernek_email,
        dernek_latitude, dernek_longitude, dernek_adres
      } = updateData;

      const [result] = await pool.execute(`
        UPDATE dernekler 
        SET dernek_adi = ?, dernek_baskani = ?, dernek_telefon = ?, 
            dernek_sosyal_medya_hesaplari = ?, dernek_email = ?,
            dernek_latitude = ?, dernek_longitude = ?, dernek_adres = ?,
            updated_at = NOW()
        WHERE id = ? AND admin_user_id = ?
      `, [
        dernek_adi, dernek_baskani, dernek_telefon,
        JSON.stringify(dernek_sosyal_medya_hesaplari),
        dernek_email, dernek_latitude, dernek_longitude, dernek_adres,
        dernekId, adminUserId
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Dernek updateByAdmin error:', error);
      throw error;
    }
  }

  // Dernek konumunu güncelle
  static async updateLocation(dernekId, adminUserId, locationData) {
    try {
      const { latitude, longitude, adres } = locationData;

      const [result] = await pool.execute(`
        UPDATE dernekler 
        SET dernek_latitude = ?, dernek_longitude = ?, dernek_adres = ?, updated_at = NOW()
        WHERE id = ? AND admin_user_id = ?
      `, [latitude, longitude, adres, dernekId, adminUserId]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Dernek updateLocation error:', error);
      throw error;
    }
  }
}

module.exports = Dernek;
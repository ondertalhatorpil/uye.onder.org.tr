// models/FaaliyetInteraction.js
const { pool } = require('../config/database');

class FaaliyetInteraction {
  
  // ==================== BEĞENİ İŞLEMLERİ ====================
  
  // Faaliyet beğen/beğeniyi kaldır (toggle)
  static async toggleBegeni(faaliyetId, userId) {
    try {
      // Önce beğeni var mı kontrol et
      const [existing] = await pool.execute(
        'SELECT id FROM faaliyet_begeniler WHERE faaliyet_id = ? AND user_id = ?',
        [faaliyetId, userId]
      );

      if (existing.length > 0) {
        // Beğeni varsa kaldır
        await pool.execute(
          'DELETE FROM faaliyet_begeniler WHERE faaliyet_id = ? AND user_id = ?',
          [faaliyetId, userId]
        );
        return { action: 'removed', begeniId: existing[0].id };
      } else {
        // Beğeni yoksa ekle
        const [result] = await pool.execute(
          'INSERT INTO faaliyet_begeniler (faaliyet_id, user_id) VALUES (?, ?)',
          [faaliyetId, userId]
        );
        return { action: 'added', begeniId: result.insertId };
      }
    } catch (error) {
      console.error('Toggle begeni error:', error);
      throw error;
    }
  }

  // Faaliyetin beğeni sayısını getir
  static async getBegeniCount(faaliyetId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM faaliyet_begeniler WHERE faaliyet_id = ?',
        [faaliyetId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Get begeni count error:', error);
      throw error;
    }
  }

  // Kullanıcının bu faaliyeti beğenip beğenmediğini kontrol et
  static async checkUserBegeni(faaliyetId, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM faaliyet_begeniler WHERE faaliyet_id = ? AND user_id = ?',
        [faaliyetId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Check user begeni error:', error);
      throw error;
    }
  }

  // Faaliyeti beğenen kullanıcıları getir (pagination ile)
  static async getBegeniler(faaliyetId, options = {}) {
    try {
      const limit = parseInt(options.limit) || 20;
      const offset = parseInt(options.offset) || 0;

      const [rows] = await pool.execute(
        `SELECT 
          b.id,
          b.created_at,
          u.id as user_id,
          u.isim,
          u.soyisim,
          u.profil_fotografi,
          u.gonullu_dernek,
          u.il,
          u.ilce
        FROM faaliyet_begeniler b
        JOIN users u ON b.user_id = u.id
        WHERE b.faaliyet_id = ?
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`,
        [faaliyetId]
      );

      // Toplam beğeni sayısı
      const total = await this.getBegeniCount(faaliyetId);

      return {
        begeniler: rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Get begeniler error:', error);
      throw error;
    }
  }

  // ==================== YORUM İŞLEMLERİ ====================

  // Yorum ekle
  static async createYorum(faaliyetId, userId, yorum) {
    try {
      // Yorumun boş olmadığını kontrol et
      if (!yorum || yorum.trim() === '') {
        throw new Error('Yorum boş olamaz');
      }

      // Yorum uzunluğu kontrolü (max 1000 karakter)
      if (yorum.length > 1000) {
        throw new Error('Yorum çok uzun (max 1000 karakter)');
      }

      const [result] = await pool.execute(
        'INSERT INTO faaliyet_yorumlar (faaliyet_id, user_id, yorum) VALUES (?, ?, ?)',
        [faaliyetId, userId, yorum.trim()]
      );

      // Eklenen yorumu getir
      return await this.getYorumById(result.insertId);
    } catch (error) {
      console.error('Create yorum error:', error);
      throw error;
    }
  }

  // Yorum ID'sine göre yorum getir
  static async getYorumById(yorumId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          y.id,
          y.faaliyet_id,
          y.yorum,
          y.created_at,
          u.id as user_id,
          u.isim,
          u.soyisim,
          u.profil_fotografi,
          u.gonullu_dernek,
          u.il,
          u.ilce,
          u.role
        FROM faaliyet_yorumlar y
        JOIN users u ON y.user_id = u.id
        WHERE y.id = ?`,
        [yorumId]
      );

      return rows[0];
    } catch (error) {
      console.error('Get yorum by id error:', error);
      throw error;
    }
  }

  // Faaliyetin yorumlarını getir (pagination ile)
  static async getYorumlar(faaliyetId, options = {}) {
    try {
      const limit = parseInt(options.limit) || 20;
      const offset = parseInt(options.offset) || 0;

      const [rows] = await pool.execute(
        `SELECT 
          y.id,
          y.yorum,
          y.created_at,
          u.id as user_id,
          u.isim,
          u.soyisim,
          u.profil_fotografi,
          u.gonullu_dernek,
          u.il,
          u.ilce,
          u.role
        FROM faaliyet_yorumlar y
        JOIN users u ON y.user_id = u.id
        WHERE y.faaliyet_id = ?
        ORDER BY y.created_at ASC
        LIMIT ${limit} OFFSET ${offset}`,
        [faaliyetId]
      );

      // Toplam yorum sayısı
      const total = await this.getYorumCount(faaliyetId);

      return {
        yorumlar: rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + rows.length < total
        }
      };
    } catch (error) {
      console.error('Get yorumlar error:', error);
      throw error;
    }
  }

  // Yorum sayısını getir
  static async getYorumCount(faaliyetId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM faaliyet_yorumlar WHERE faaliyet_id = ?',
        [faaliyetId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Get yorum count error:', error);
      throw error;
    }
  }

  // Yorum sil (sadece kendi yorumu veya admin)
  static async deleteYorum(yorumId, userId, isAdmin = false) {
    try {
      // Önce yorum var mı ve kullanıcıya ait mi kontrol et
      const [yorum] = await pool.execute(
        'SELECT user_id, faaliyet_id FROM faaliyet_yorumlar WHERE id = ?',
        [yorumId]
      );

      if (yorum.length === 0) {
        throw new Error('Yorum bulunamadı');
      }

      // Admin değilse ve yorum kendisine ait değilse hata ver
      if (!isAdmin && yorum[0].user_id !== userId) {
        throw new Error('Bu yorumu silme yetkiniz yok');
      }

      const [result] = await pool.execute(
        'DELETE FROM faaliyet_yorumlar WHERE id = ?',
        [yorumId]
      );

      return {
        success: result.affectedRows > 0,
        faaliyetId: yorum[0].faaliyet_id
      };
    } catch (error) {
      console.error('Delete yorum error:', error);
      throw error;
    }
  }

  // ==================== TOPLU İSTATİSTİKLER ====================

  // Bir faaliyetin tüm etkileşim istatistiklerini getir
  static async getFaaliyetInteractions(faaliyetId, userId = null) {
    try {
      const begeniCount = await this.getBegeniCount(faaliyetId);
      const yorumCount = await this.getYorumCount(faaliyetId);
      
      let userBegendi = false;
      if (userId) {
        userBegendi = await this.checkUserBegeni(faaliyetId, userId);
      }

      return {
        begeni_sayisi: begeniCount,
        yorum_sayisi: yorumCount,
        user_begendi: userBegendi
      };
    } catch (error) {
      console.error('Get faaliyet interactions error:', error);
      throw error;
    }
  }

  // Kullanıcının toplam beğeni ve yorum istatistikleri
  static async getUserInteractionStats(userId) {
    try {
      // Kullanıcının yaptığı toplam beğeni sayısı
      const [begeniRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM faaliyet_begeniler WHERE user_id = ?',
        [userId]
      );

      // Kullanıcının yaptığı toplam yorum sayısı
      const [yorumRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM faaliyet_yorumlar WHERE user_id = ?',
        [userId]
      );

      // Kullanıcının faaliyetlerine gelen toplam beğeni sayısı
      const [alinanBegeniRows] = await pool.execute(
        `SELECT COUNT(*) as count 
        FROM faaliyet_begeniler b
        JOIN faaliyet_paylasimlar f ON b.faaliyet_id = f.id
        WHERE f.user_id = ?`,
        [userId]
      );

      // Kullanıcının faaliyetlerine gelen toplam yorum sayısı
      const [alinanYorumRows] = await pool.execute(
        `SELECT COUNT(*) as count 
        FROM faaliyet_yorumlar y
        JOIN faaliyet_paylasimlar f ON y.faaliyet_id = f.id
        WHERE f.user_id = ? AND y.user_id != ?`,
        [userId, userId]
      );

      return {
        yapilan_begeni: begeniRows[0].count,
        yapilan_yorum: yorumRows[0].count,
        alinan_begeni: alinanBegeniRows[0].count,
        alinan_yorum: alinanYorumRows[0].count
      };
    } catch (error) {
      console.error('Get user interaction stats error:', error);
      throw error;
    }
  }
}

module.exports = FaaliyetInteraction;
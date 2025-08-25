// models/Notification.js - SQL hatası düzeltilmiş versiyon
const { pool } = require('../config/database');

class Notification {
  // Bildirim oluştur (Admin tarafından)
  static async create(notificationData) {
    const {
      baslik,
      icerik,
      tip = 'genel',
      gonderici_admin_id,
      hedef_kullanici_ids = null,
      bitis_tarihi = null
    } = notificationData;

    const [result] = await pool.execute(
      `INSERT INTO notifications (
        baslik, icerik, tip, gonderici_admin_id, 
        hedef_kullanici_ids, bitis_tarihi, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        baslik,
        icerik,
        tip,
        gonderici_admin_id,
        hedef_kullanici_ids ? JSON.stringify(hedef_kullanici_ids) : null,
        bitis_tarihi
      ]
    );

    return result.insertId;
  }

  // Kullanıcının bildirimlerini getir - BASIT YAKLAŞIM
  static async getForUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sadece_okunmamis = false
    } = options;

    const offset = (page - 1) * limit;

    try {
      // Önce tüm bildirimleri al, sonra filtreleme yap
      let query = `
        SELECT 
          n.id, n.baslik, n.icerik, n.tip, n.created_at, n.bitis_tarihi,
          n.hedef_kullanici_ids,
          admin.isim as gonderici_isim, admin.soyisim as gonderici_soyisim,
          CASE 
            WHEN nr.id IS NOT NULL THEN 1 
            ELSE 0 
          END as okundu,
          nr.okunma_tarihi
        FROM notifications n
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
        LEFT JOIN users admin ON n.gonderici_admin_id = admin.id
        WHERE (n.bitis_tarihi IS NULL OR n.bitis_tarihi > NOW())
      `;

      const params = [userId];

      if (sadece_okunmamis) {
        query += ` AND nr.id IS NULL`;
      }

      query += ` ORDER BY n.created_at DESC`;

      console.log('Executing SQL:', query);
      console.log('With params:', params);

      const [allRows] = await pool.execute(query, params);

      // JavaScript'te hedef kullanıcı filtresi uygula
      const filteredRows = allRows.filter(notification => {
        // Eğer hedef_kullanici_ids null ise tüm kullanıcılara gönderilmiş
        if (!notification.hedef_kullanici_ids || 
            notification.hedef_kullanici_ids === 'null' || 
            notification.hedef_kullanici_ids === '') {
          return true;
        }

        try {
          // JSON parse et ve kullanıcı ID'si var mı kontrol et
          const targetUsers = JSON.parse(notification.hedef_kullanici_ids);
          return Array.isArray(targetUsers) && targetUsers.includes(parseInt(userId));
        } catch (error) {
          console.error('JSON parse error for notification:', notification.id, error);
          // Parse hatası varsa tüm kullanıcılara gönderilmiş kabul et
          return true;
        }
      });

      // Sayfalama uygula
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedRows = filteredRows.slice(startIndex, endIndex);

      // hedef_kullanici_ids'i temizle (frontend'e gönderme)
      const cleanRows = paginatedRows.map(row => {
        const { hedef_kullanici_ids, ...cleanRow } = row;
        return cleanRow;
      });

      return {
        notifications: cleanRows,
        total: filteredRows.length,
        page: parseInt(page),
        limit: parseInt(limit)
      };

    } catch (error) {
      console.error('getForUser error:', error);
      throw error;
    }
  }

  // Bildirimi okundu olarak işaretle
  static async markAsRead(notificationId, userId) {
    try {
      // Önce okunmuş mu kontrol et
      const [existing] = await pool.execute(
        'SELECT id FROM notification_reads WHERE notification_id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (existing.length > 0) {
        return true; // Zaten okunmuş
      }

      // Okundu kaydı oluştur
      const [result] = await pool.execute(
        'INSERT INTO notification_reads (notification_id, user_id, okunma_tarihi) VALUES (?, ?, NOW())',
        [notificationId, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  // Kullanıcının okunmamış bildirim sayısı - BASIT YAKLAŞIM
  static async getUnreadCount(userId) {
    try {
      // Önce tüm okunmamış bildirimleri al
      const [rows] = await pool.execute(
        `SELECT n.id, n.hedef_kullanici_ids
        FROM notifications n
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
        WHERE (n.bitis_tarihi IS NULL OR n.bitis_tarihi > NOW())
        AND nr.id IS NULL`,
        [userId]
      );

      // JavaScript'te hedef kullanıcı filtresi uygula
      const filteredRows = rows.filter(notification => {
        // Eğer hedef_kullanici_ids null ise tüm kullanıcılara gönderilmiş
        if (!notification.hedef_kullanici_ids || 
            notification.hedef_kullanici_ids === 'null' || 
            notification.hedef_kullanici_ids === '') {
          return true;
        }

        try {
          // JSON parse et ve kullanıcı ID'si var mı kontrol et
          const targetUsers = JSON.parse(notification.hedef_kullanici_ids);
          return Array.isArray(targetUsers) && targetUsers.includes(parseInt(userId));
        } catch (error) {
          console.error('JSON parse error for unread count:', notification.id, error);
          // Parse hatası varsa tüm kullanıcılara gönderilmiş kabul et
          return true;
        }
      });

      return filteredRows.length;

    } catch (error) {
      console.error('getUnreadCount error:', error);
      return 0;
    }
  }

  // Bildirimi ID ile getir
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        n.*, 
        admin.isim as gonderici_isim, 
        admin.soyisim as gonderici_soyisim
      FROM notifications n
      LEFT JOIN users admin ON n.gonderici_admin_id = admin.id
      WHERE n.id = ?`,
      [id]
    );

    return rows[0];
  }

  // Admin için bildirim listesi
  static async getByAdmin(adminId, options = {}) {
    const {
      page = 1,
      limit = 20
    } = options;

    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT 
        n.id, n.baslik, n.icerik, n.tip, n.created_at, n.bitis_tarihi,
        n.hedef_kullanici_ids,
        COUNT(nr.id) as okunma_sayisi,
        CASE 
          WHEN n.hedef_kullanici_ids IS NULL OR n.hedef_kullanici_ids = 'null' OR n.hedef_kullanici_ids = ''
          THEN (SELECT COUNT(*) FROM users WHERE role IN ('uye', 'dernek_admin'))
          ELSE (
            SELECT COUNT(*) 
            FROM users 
            WHERE role IN ('uye', 'dernek_admin') 
            AND JSON_SEARCH(n.hedef_kullanici_ids, 'one', CAST(id AS CHAR)) IS NOT NULL
          )
        END as hedef_kullanici_sayisi
      FROM notifications n
      LEFT JOIN notification_reads nr ON n.id = nr.notification_id
      WHERE n.gonderici_admin_id = ?
      GROUP BY n.id
      ORDER BY n.created_at DESC 
      LIMIT ? OFFSET ?`,
      [adminId, limit, offset]
    );

    // Toplam sayı
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM notifications WHERE gonderici_admin_id = ?',
      [adminId]
    );

    return {
      notifications: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  // Tüm kullanıcıları okundu işaretle - BASIT YAKLAŞIM
  static async markAllAsReadForUser(userId) {
    try {
      // Kullanıcının okunmamış bildirimlerini getir
      const [unreadNotifications] = await pool.execute(
        `SELECT n.id, n.hedef_kullanici_ids
        FROM notifications n
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
        WHERE (n.bitis_tarihi IS NULL OR n.bitis_tarihi > NOW())
        AND nr.id IS NULL`,
        [userId]
      );

      // JavaScript'te hedef kullanıcı filtresi uygula
      const filteredNotifications = unreadNotifications.filter(notification => {
        // Eğer hedef_kullanici_ids null ise tüm kullanıcılara gönderilmiş
        if (!notification.hedef_kullanici_ids || 
            notification.hedef_kullanici_ids === 'null' || 
            notification.hedef_kullanici_ids === '') {
          return true;
        }

        try {
          // JSON parse et ve kullanıcı ID'si var mı kontrol et
          const targetUsers = JSON.parse(notification.hedef_kullanici_ids);
          return Array.isArray(targetUsers) && targetUsers.includes(parseInt(userId));
        } catch (error) {
          console.error('JSON parse error for mark all:', notification.id, error);
          // Parse hatası varsa tüm kullanıcılara gönderilmiş kabul et
          return true;
        }
      });

      // Her birini okundu olarak işaretle
      for (const notification of filteredNotifications) {
        await pool.execute(
          'INSERT IGNORE INTO notification_reads (notification_id, user_id, okunma_tarihi) VALUES (?, ?, NOW())',
          [notification.id, userId]
        );
      }

      return filteredNotifications.length;
    } catch (error) {
      console.error('Mark all as read error:', error);
      return 0;
    }
  }

  // Bildirimi sil (Admin)
  static async delete(id, adminId) {
    try {
      // Önce bildirimin bu admin tarafından oluşturulduğunu kontrol et
      const notification = await this.findById(id);
      
      if (!notification || notification.gonderici_admin_id !== adminId) {
        return false;
      }

      // Önce okunma kayıtlarını sil
      await pool.execute(
        'DELETE FROM notification_reads WHERE notification_id = ?',
        [id]
      );

      // Sonra bildirimi sil
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE id = ? AND gonderici_admin_id = ?',
        [id, adminId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  // Bildirim istatistikleri
  static async getStats(adminId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as toplam_bildirim,
          COUNT(CASE WHEN n.bitis_tarihi IS NULL OR n.bitis_tarihi > NOW() THEN 1 END) as aktif_bildirim,
          COUNT(CASE WHEN n.bitis_tarihi IS NOT NULL AND n.bitis_tarihi <= NOW() THEN 1 END) as suresi_dolan
        FROM notifications n
      `;

      const params = [];
      
      if (adminId) {
        query += ' WHERE n.gonderici_admin_id = ?';
        params.push(adminId);
      }

      const [stats] = await pool.execute(query, params);

      // Toplam okunma istatistikleri
      let readQuery = `
        SELECT 
          COUNT(nr.id) as toplam_okunma,
          COUNT(DISTINCT nr.user_id) as okuyan_kullanici_sayisi
        FROM notification_reads nr
        JOIN notifications n ON nr.notification_id = n.id
      `;

      if (adminId) {
        readQuery += ' WHERE n.gonderici_admin_id = ?';
      }

      const [readStats] = await pool.execute(readQuery, adminId ? [adminId] : []);

      return {
        ...stats[0],
        ...readStats[0]
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      return null;
    }
  }
}

module.exports = Notification;
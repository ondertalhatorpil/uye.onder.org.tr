const { pool } = require('../config/database');

class PasswordReset {
  // SMS kodu oluştur ve kaydet
  static async createResetCode(userId, telefon, code, ipAddress = null, userAgent = null) {
    const expireMinutes = process.env.SMS_CODE_EXPIRE_MINUTES || 5;
    
    // Mevcut kodları pasif yap
    await pool.execute(
      'UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0',
      [userId]
    );

    const [result] = await pool.execute(
      `INSERT INTO password_reset_codes 
       (user_id, telefon, code, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?, ?)`,
      [userId, telefon, code, expireMinutes, ipAddress, userAgent]
    );

    return result.insertId;
  }

  // SMS kodunu doğrula
  static async verifyCode(telefon, code) {
    const [rows] = await pool.execute(
      `SELECT prc.*, u.id as user_id, u.email 
       FROM password_reset_codes prc 
       JOIN users u ON prc.user_id = u.id 
       WHERE prc.telefon = ? AND prc.code = ? AND prc.used = 0 AND prc.expires_at > NOW()
       ORDER BY prc.created_at DESC 
       LIMIT 1`,
      [telefon, code]
    );

    return rows[0] || null;
  }

  // Kodu kullanıldı olarak işaretle
  static async markCodeAsUsed(codeId) {
    const [result] = await pool.execute(
      'UPDATE password_reset_codes SET used = 1, updated_at = NOW() WHERE id = ?',
      [codeId]
    );

    return result.affectedRows > 0;
  }

  // Deneme sayısını artır
  static async incrementAttempt(codeId) {
    const [result] = await pool.execute(
      'UPDATE password_reset_codes SET attempt_count = attempt_count + 1, updated_at = NOW() WHERE id = ?',
      [codeId]
    );

    return result.affectedRows > 0;
  }

  // Rate limiting kontrol
  static async checkRateLimit(telefon) {
    const rateLimitMinutes = process.env.SMS_RATE_LIMIT_MINUTES || 1;
    const maxRequests = process.env.SMS_RATE_LIMIT_MAX_REQUESTS || 1;

    // Son N dakikadaki istek sayısını kontrol et
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as request_count 
       FROM password_reset_codes 
       WHERE telefon = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [telefon, rateLimitMinutes]
    );

    const requestCount = rows[0].request_count;
    
    return {
      allowed: requestCount < maxRequests,
      requestCount,
      maxRequests,
      rateLimitMinutes
    };
  }

  // Kullanıcıyı telefon ile bul
  static async findUserByPhone(telefon) {
  console.log('🔍 MODEL - findUserByPhone çağrıldı:', telefon);
  
  // Farklı telefon formatlarını dene
  const phoneVariations = [
    telefon,                          // 5457929406
    '0' + telefon,                    // 05457929406
    telefon.startsWith('0') ? telefon.substring(1) : telefon, // 5457929406
  ];
  
  console.log('🔍 Denenecek telefon formatları:', phoneVariations);
  
  for (let phone of phoneVariations) {
    console.log('🔍 Database\'de aranan:', phone);
    
    const [rows] = await pool.execute(
      'SELECT id, isim, soyisim, email, telefon FROM users WHERE telefon = ? AND role IN ("uye", "dernek_admin")',
      [phone]
    );
    
    console.log('🔍 Bulunan sonuç sayısı:', rows.length);
    if (rows.length > 0) {
      console.log('✅ Kullanıcı bulundu:', rows[0]);
      return rows[0];
    }
  }
  
  console.log('❌ Hiçbir telefon formatında kullanıcı bulunamadı');
  return null;
}

  // Eski kodları temizle (24 saatten eski)
  static async cleanExpiredCodes() {
    const [result] = await pool.execute(
      'DELETE FROM password_reset_codes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    );

    return result.affectedRows;
  }

  // Şifreyi güncelle
  static async updateUserPassword(userId, hashedPassword) {
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    return result.affectedRows > 0;
  }

  // İstatistikler
  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as successful_resets,
        SUM(CASE WHEN expires_at < NOW() AND used = 0 THEN 1 ELSE 0 END) as expired_codes,
        AVG(attempt_count) as avg_attempts
      FROM password_reset_codes 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return rows[0];
  }

  // Kullanıcının aktif kodlarını getir (admin için)
  static async getUserActiveCodes(userId) {
    const [rows] = await pool.execute(
      `SELECT id, telefon, code, expires_at, attempt_count, created_at 
       FROM password_reset_codes 
       WHERE user_id = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows;
  }

  // Telefon numarasının son istek zamanını güncelle (rate limiting için)
  static async updateRateLimit(telefon) {
    const [existing] = await pool.execute(
      'SELECT * FROM sms_rate_limits WHERE telefon = ?',
      [telefon]
    );

    if (existing.length > 0) {
      // Mevcut kaydı güncelle
      await pool.execute(
        `UPDATE sms_rate_limits 
         SET request_count = request_count + 1, last_request_at = NOW() 
         WHERE telefon = ?`,
        [telefon]
      );
    } else {
      // Yeni kayıt oluştur
      await pool.execute(
        'INSERT INTO sms_rate_limits (telefon, request_count, last_request_at) VALUES (?, 1, NOW())',
        [telefon]
      );
    }
  }

  // Rate limit süresini kontrol et
  static async getRateLimitStatus(telefon) {
    const [rows] = await pool.execute(
      `SELECT *, 
        CASE 
          WHEN blocked_until IS NOT NULL AND blocked_until > NOW() THEN TRUE
          ELSE FALSE
        END as is_blocked
       FROM sms_rate_limits 
       WHERE telefon = ?`,
      [telefon]
    );

    return rows[0] || null;
  }
}

module.exports = PasswordReset;
const bcrypt = require('bcryptjs');
const PasswordReset = require('../models/PasswordReset');
const smsService = require('../services/smsService');

// 1. Şifremi unuttum - SMS gönder
const sendResetCode = async (req, res) => {
  try {
    const { telefon } = req.body;

    // Validasyon
    if (!telefon) {
      return res.status(400).json({
        success: false,
        error: 'Telefon numarası gerekli'
      });
    }

    // Telefon numarasını temizle
    const cleanPhone = telefon.replace(/[^0-9]/g, '');
    
    console.log('🔍 DEBUG - Telefon formatları:');
    console.log('📱 Frontend\'den gelen:', telefon);
    console.log('📱 Temizlenmiş:', cleanPhone);
    
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir telefon numarası girin'
      });
    }

    // Rate limiting kontrol
    const rateLimit = await PasswordReset.checkRateLimit(cleanPhone);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: `Çok fazla istek. ${rateLimit.rateLimitMinutes} dakika sonra tekrar deneyin.`
      });
    }

    // Kullanıcıyı telefon ile bul - DEBUG ekle
    console.log('🔍 Database\'de aranacak telefon:', cleanPhone);
    const user = await PasswordReset.findUserByPhone(cleanPhone);
    console.log('🔍 Bulunan kullanıcı:', user ? `${user.email} (${user.telefon})` : 'BULUNAMADI');
    
    if (!user) {
      // Güvenlik için aynı response döndür
      console.log('❌ Telefon numarası bulunamadı, güvenlik mesajı gönderiliyor');
      return res.json({
        success: true,
        message: 'Eğer bu telefon numarası sistemde kayıtlıysa, SMS kodu gönderildi'
      });
    }

    // SMS kodu oluştur
    const resetCode = smsService.generateCode();
    console.log('📱 Oluşturulan SMS kodu:', resetCode);

    // Veritabanına kaydet
    await PasswordReset.createResetCode(user.id, cleanPhone, resetCode);

    // SMS gönder
    try {
      const smsResult = await smsService.sendPasswordResetCode(cleanPhone, resetCode);
      
      if (smsResult.success) {
        console.log(`✅ Şifre sıfırlama kodu gönderildi: ${user.email} (${cleanPhone})`);
        
        res.json({
          success: true,
          message: 'SMS kodu gönderildi. Lütfen telefonunuzu kontrol edin.',
          data: {
            telefon: cleanPhone,
            expiresIn: process.env.SMS_CODE_EXPIRE_MINUTES || 5
          }
        });
      } else {
        throw new Error('SMS gönderilemedi');
      }
    } catch (smsError) {
      console.error('SMS gönderme hatası:', smsError.message);
      
      res.status(500).json({
        success: false,
        error: 'SMS gönderilirken hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
    }

  } catch (error) {
    console.error('Send reset code error:', error);
    res.status(500).json({
      success: false,
      error: 'İşlem sırasında hata oluştu: ' + error.message
    });
  }
};






// 2. SMS kodunu doğrula
const verifyResetCode = async (req, res) => {
  try {
    const { telefon, code } = req.body;

    // Validasyon
    if (!telefon || !code) {
      return res.status(400).json({
        success: false,
        error: 'Telefon numarası ve kod gerekli'
      });
    }

    // Kod formatı kontrol
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Kod 6 haneli sayı olmalıdır'
      });
    }

    const cleanPhone = telefon.replace(/[^0-9]/g, '');

    // Kodu doğrula
    const resetRecord = await PasswordReset.verifyCode(cleanPhone, code);
    
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş kod'
      });
    }

    // Max deneme kontrol
    const maxAttempts = process.env.SMS_MAX_ATTEMPTS || 3;
    if (resetRecord.attempt_count >= maxAttempts) {
      return res.status(400).json({
        success: false,
        error: 'Çok fazla yanlış deneme. Yeni kod talep edin.'
      });
    }

    console.log(`✅ SMS kodu doğrulandı: ${resetRecord.email} (${cleanPhone})`);

    res.json({
      success: true,
      message: 'Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz.',
      data: {
        resetToken: resetRecord.id, // Frontend'de yeni şifre için kullanılacak
        email: resetRecord.email,
        telefon: cleanPhone
      }
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      error: 'Kod doğrulama sırasında hata oluştu: ' + error.message
    });
  }
};

// 3. Yeni şifre belirleme
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Validasyon
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Tüm alanlar gerekli'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Şifreler eşleşmiyor'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Reset token'ı kontrol et (bu aslında password_reset_codes tablosundaki ID)
    const [resetRecord] = await require('../config/database').pool.execute(
      `SELECT prc.*, u.email, u.isim, u.soyisim 
       FROM password_reset_codes prc 
       JOIN users u ON prc.user_id = u.id 
       WHERE prc.id = ? AND prc.used = 0 AND prc.expires_at > NOW()`,
      [resetToken]
    );

    if (!resetRecord.length) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş reset token'
      });
    }

    const record = resetRecord[0];

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    const passwordUpdated = await PasswordReset.updateUserPassword(record.user_id, hashedPassword);
    
    if (!passwordUpdated) {
      return res.status(500).json({
        success: false,
        error: 'Şifre güncellenemedi'
      });
    }

    // Reset kodunu kullanıldı olarak işaretle
    await PasswordReset.markCodeAsUsed(resetToken);

    // Kullanıcının diğer aktif reset kodlarını da pasif yap
    await require('../config/database').pool.execute(
      'UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0',
      [record.user_id]
    );

    console.log(`✅ Şifre başarıyla sıfırlandı: ${record.email} (${record.telefon})`);

    res.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
      data: {
        email: record.email,
        isim: record.isim,
        soyisim: record.soyisim
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlama sırasında hata oluştu: ' + error.message
    });
  }
};

// 4. SMS servis durumunu kontrol et (admin için)
const checkSmsService = async (req, res) => {
  try {
    const serviceStatus = await smsService.checkServiceHealth();
    
    res.json({
      success: true,
      data: serviceStatus
    });
  } catch (error) {
    console.error('SMS service check error:', error);
    res.status(500).json({
      success: false,
      error: 'SMS servis kontrolü başarısız: ' + error.message
    });
  }
};

// 5. Şifre sıfırlama istatistikleri (admin için)
const getResetStats = async (req, res) => {
  try {
    const stats = await PasswordReset.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get reset stats error:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınamadı: ' + error.message
    });
  }
};

// 6. Eski kodları temizle (cron job için)
const cleanExpiredCodes = async (req, res) => {
  try {
    const deletedCount = await PasswordReset.cleanExpiredCodes();
    
    console.log(`🧹 ${deletedCount} eski şifre sıfırlama kodu temizlendi`);
    
    res.json({
      success: true,
      message: `${deletedCount} eski kod temizlendi`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Clean expired codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Kod temizleme başarısız: ' + error.message
    });
  }
};

module.exports = {
  sendResetCode,
  verifyResetCode, 
  resetPassword,
  checkSmsService,
  getResetStats,
  cleanExpiredCodes
};
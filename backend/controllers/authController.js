const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Kayıt ol
const register = async (req, res) => {
  try {
    const {
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul
    } = req.body;

    // Basit validasyon
    if (!isim || !soyisim || !email || !password || !dogum_tarihi || !sektor  || !meslek || !telefon || !il || !ilce || !gonullu_dernek || !calisma_komisyon || !mezun_okul ) {
      return res.status(400).json({ 
        success: false, 
        error: 'İsim, soyisim, email, doğum tarihi ve şifre zorunlu' 
      });
    }

    // Email kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu email zaten kayıtlı'
      });
    }

    // Kullanıcı oluştur
    const userId = await User.create({
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul
    });

    // JWT token oluştur
    const token = jwt.sign(
      { id: userId, email, role: 'uye' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      token,
      user: { id: userId, isim, soyisim, email, role: 'uye' }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kayıt sırasında hata oluştu: ' + error.message 
    });
  }
};

// Giriş yap
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basit validasyon
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ve şifre gerekli' 
      });
    }

    // Kullanıcı bul
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email veya şifre hatalı' 
      });
    }

    // Şifre kontrol
    const isPasswordValid = await User.checkPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email veya şifre hatalı' 
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        isim: user.isim,
        soyisim: user.soyisim,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Giriş sırasında hata oluştu: ' + error.message 
    });
  }
};

// Profil bilgileri
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kullanıcı bulunamadı' 
      });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Profil bilgileri alınamadı: ' + error.message 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek,
      telefon, il, ilce, gonullu_dernek, calisma_komisyon, mezun_okul
    } = req.body;

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Email değişikliği varsa kontrol et
    if (req.body.email && req.body.email !== existingUser.email) {
      const emailExists = await User.findByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        });
      }
    }

    // Profil güncelle
    const [result] = await require('../config/database').pool.execute(`
      UPDATE users 
      SET isim = ?, soyisim = ?, dogum_tarihi = ?, sektor = ?, meslek = ?,
          telefon = ?, il = ?, ilce = ?, gonullu_dernek = ?, 
          calisma_komisyon = ?, mezun_okul = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      isim || existingUser.isim,
      soyisim || existingUser.soyisim,
      dogum_tarihi || existingUser.dogum_tarihi,
      sektor || existingUser.sektor,
      meslek || existingUser.meslek,
      telefon || existingUser.telefon,
      il || existingUser.il,
      ilce || existingUser.ilce,
      gonullu_dernek || existingUser.gonullu_dernek,
      calisma_komisyon || existingUser.calisma_komisyon,
      mezun_okul || existingUser.mezun_okul,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Profil güncellenemedi'
      });
    }

    // Güncellenmiş kullanıcıyı getir
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Profil güncellenirken hata oluştu: ' + error.message
    });
  }
};

// Şifre değiştirme
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mevcut şifre ve yeni şifre gerekli'
      });
    }

    // Mevcut kullanıcıyı getir
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await User.checkPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mevcut şifre yanlış'
      });
    }

    // Yeni şifreyi hashle
    const bcrypt = require('bcryptjs');
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    const [result] = await require('../config/database').pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Şifre güncellenemedi'
      });
    }

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre değiştirilirken hata oluştu: ' + error.message
    });
  }
};

module.exports = { register, login, getProfile, changePassword, updateProfile};
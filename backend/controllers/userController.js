const User = require('../models/User');
const Faaliyet = require('../models/Faaliyet');
const { pool } = require('../config/database');

// Kullanıcı arama - PROFİL FOTOĞRAFI EKLENDİ + GİZLİLİK KONTROLÜ
const searchUsers = async (req, res) => {
  try {
    const {
      name,           // İsim/soyisim arama
      sektor,         // Sektör filtresi
      meslek,         // Meslek arama
      il,             // İl filtresi
      ilce,           // İlçe filtresi
      dernek,         // Dernek filtresi
      komisyon,       // Komisyon filtresi
      page = 1,
      limit = 20
    } = req.query;

    console.log('User search params:', req.query);

    let query = `
      SELECT 
        id, isim, soyisim, sektor, meslek, il, ilce, 
        gonullu_dernek, calisma_komisyon, profil_fotografi, created_at,
        email, telefon, show_email, show_phone
      FROM users 
      WHERE role IN ('uye', 'dernek_admin')
    `;
    
    const conditions = [];
    const params = [];

    // İsim/soyisim arama - BOŞ STRING KONTROLÜ
    if (name && name.trim() !== '') {
      conditions.push('(isim LIKE ? OR soyisim LIKE ? OR CONCAT(isim, " ", soyisim) LIKE ?)');
      const searchTerm = `%${name.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sektör filtresi - BOŞ STRING KONTROLÜ
    if (sektor && sektor.trim() !== '') {
      conditions.push('sektor LIKE ?');
      params.push(`%${sektor.trim()}%`);
    }

    // Meslek arama - BOŞ STRING KONTROLÜ
    if (meslek && meslek.trim() !== '') {
      conditions.push('meslek LIKE ?');
      params.push(`%${meslek.trim()}%`);
    }

    // İl filtresi - BOŞ STRING KONTROLÜ
    if (il && il.trim() !== '') {
      conditions.push('il = ?');
      params.push(il.trim());
    }

    // İlçe filtresi - BOŞ STRING KONTROLÜ
    if (ilce && ilce.trim() !== '') {
      conditions.push('ilce = ?');
      params.push(ilce.trim());
    }

    // Dernek filtresi - BOŞ STRING KONTROLÜ
    if (dernek && dernek.trim() !== '') {
      conditions.push('gonullu_dernek LIKE ?');
      params.push(`%${dernek.trim()}%`);
    }

    // Komisyon filtresi - BOŞ STRING KONTROLÜ
    if (komisyon && komisyon.trim() !== '') {
      conditions.push('calisma_komisyon LIKE ?');
      params.push(`%${komisyon.trim()}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY isim ASC';

    // MySQL 8.0 için LIMIT/OFFSET direkt string olarak ekle
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    // Güvenlik kontrolü
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      throw new Error('Invalid page or limit values');
    }
    
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    console.log('User search SQL:', query);
    console.log('User search params:', params);

    const [users] = await pool.execute(query, params);

    // GİZLİLİK KONTROLÜ - Her kullanıcı için bilgileri filtrele
    const viewerId = req.user ? req.user.id : null;
    const filteredUsers = users.map(user => {
      // Gizlilik ayarlarına göre filtrele
      const filteredUser = { ...user };
      
      // E-posta gizliliği kontrolü
      if (!user.show_email && (!viewerId || (viewerId !== user.id))) {
        filteredUser.email = null;
      }
      
      // Telefon gizliliği kontrolü
      if (!user.show_phone && (!viewerId || (viewerId !== user.id))) {
        filteredUser.telefon = null;
      }
      
      // Gizlilik ayarlarını response'dan kaldır (güvenlik)
      delete filteredUser.show_email;
      delete filteredUser.show_phone;
      
      return filteredUser;
    });

    // Toplam sayı için count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      WHERE role IN ('uye', 'dernek_admin')
    `;
    
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: filteredUsers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı arama hatası: ' + error.message
    });
  }
};

// Kullanıcı profil detayı - ONAY DURUMU EKLENDİ + GİZLİLİK KONTROLÜ
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user ? req.user.id : null;

    // Kullanıcı bilgilerini getir (User.findById zaten profil_fotografi'yi dahil ediyor)
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // GİZLİLİK KONTROLÜ - User model'indeki fonksiyonu kullan
    const filteredUser = User.filterUserDataByPrivacy(user, viewerId);

    // Kullanıcının TÜM faaliyetlerini getir (sadece kendisi görüyorsa)
    // Başkaları sadece onaylananları görür
    let faaliyetler;
    if (req.user && req.user.id === parseInt(id)) {
      // Kendi profilini görüyorsa, tüm faaliyetlerini getir
      faaliyetler = await Faaliyet.getByUserId(id);
    } else {
      // Başkasının profilini görüyorsa, sadece onaylananları getir
      faaliyetler = await Faaliyet.getOnaylanmisFaaliyetler({ user_id: id });
    }

    // Faaliyet istatistikleri - ONAY DURUMU EKLENDİ
    const [statsResult] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
        SUM(CASE WHEN durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan_faaliyet,
        SUM(CASE WHEN durum = 'beklemede' THEN 1 ELSE 0 END) as bekleyen_faaliyet,
        SUM(CASE WHEN durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen_faaliyet,
        DATE(MIN(created_at)) as ilk_faaliyet_tarihi,
        DATE(MAX(created_at)) as son_faaliyet_tarihi
      FROM faaliyet_paylasimlar 
      WHERE user_id = ?
    `, [id]);

    const stats = statsResult[0];

    res.json({
      success: true,
      data: {
        user: filteredUser,
        faaliyetler,
        stats: {
          toplam_faaliyet: stats.toplam_faaliyet,
          onaylanan_faaliyet: stats.onaylanan_faaliyet,
          bekleyen_faaliyet: stats.bekleyen_faaliyet,
          reddedilen_faaliyet: stats.reddedilen_faaliyet,
          ilk_faaliyet_tarihi: stats.ilk_faaliyet_tarihi,
          son_faaliyet_tarihi: stats.son_faaliyet_tarihi,
          uye_olma_tarihi: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı profili getirilemedi: ' + error.message
    });
  }
};

// Dernek üyelerini listele - PROFİL FOTOĞRAFI EKLENDİ + GİZLİLİK KONTROLÜ
const getDernekMembers = async (req, res) => {
  try {
    const { dernekAdi } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const viewerId = req.user ? req.user.id : null;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // MySQL 8.0 uyumlu query - profil_fotografi eklendi + gizlilik alanları
    const [users] = await pool.execute(`
      SELECT 
        id, isim, soyisim, sektor, meslek, il, ilce,
        calisma_komisyon, profil_fotografi, created_at,
        email, telefon, show_email, show_phone
      FROM users 
      WHERE gonullu_dernek = ? 
        AND role IN ('uye', 'dernek_admin')
      ORDER BY 
        CASE WHEN role = 'dernek_admin' THEN 0 ELSE 1 END,
        isim ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `, [dernekAdi]);

    // GİZLİLİK KONTROLÜ
    const filteredUsers = users.map(user => {
      const filteredUser = { ...user };
      
      // E-posta gizliliği kontrolü
      if (!user.show_email && (!viewerId || (viewerId !== user.id))) {
        filteredUser.email = null;
      }
      
      // Telefon gizliliği kontrolü
      if (!user.show_phone && (!viewerId || (viewerId !== user.id))) {
        filteredUser.telefon = null;
      }
      
      // Gizlilik ayarlarını response'dan kaldır
      delete filteredUser.show_email;
      delete filteredUser.show_phone;
      
      return filteredUser;
    });

    // Toplam üye sayısı
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM users 
      WHERE gonullu_dernek = ? 
        AND role IN ('uye', 'dernek_admin')
    `, [dernekAdi]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: filteredUsers,
      dernek: dernekAdi,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get dernek members error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek üyeleri getirilemedi: ' + error.message
    });
  }
};

// Tüm kullanıcıları listele (admin) - PROFİL FOTOĞRAFI EKLENDİ
const getAllUsers = async (req, res) => {
  try {
    // Sadece admin erişebilir
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    // ADMİN TÜM BİLGİLERİ GÖREBİLİR - GİZLİLİK KISITLAMASI YOK
    const [users] = await pool.execute(`
      SELECT 
        id, isim, soyisim, email, role, sektor, meslek, 
        il, ilce, gonullu_dernek, profil_fotografi, created_at,
        telefon, show_email, show_phone
      FROM users 
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `);

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcılar getirilemedi: ' + error.message
    });
  }
};

// Kullanıcı istatistikleri (admin) - ONAY DURUMU EKLENDİ
const getUserStats = async (req, res) => {
  try {
    // Sadece admin erişebilir
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    // Genel istatistikler
    const [generalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_kullanici,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as admin_sayisi,
        SUM(CASE WHEN role = 'dernek_admin' THEN 1 ELSE 0 END) as dernek_admin_sayisi,
        SUM(CASE WHEN role = 'uye' THEN 1 ELSE 0 END) as uye_sayisi,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as son_30_gun_kayit,
        SUM(CASE WHEN show_email = 1 THEN 1 ELSE 0 END) as email_gosterenler,
        SUM(CASE WHEN show_phone = 1 THEN 1 ELSE 0 END) as telefon_gosterenler
      FROM users
    `);

    // En aktif kullanıcılar (onaylanan faaliyet sayısına göre)
    const [aktifKullanicilar] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.gonullu_dernek,
        COUNT(f.id) as toplam_faaliyet,
        SUM(CASE WHEN f.durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan_faaliyet
      FROM users u
      LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING onaylanan_faaliyet > 0
      ORDER BY onaylanan_faaliyet DESC
      LIMIT 10
    `);

    // İl bazında dağılım
    const [ilStats] = await pool.execute(`
      SELECT 
        il,
        COUNT(*) as kullanici_sayisi
      FROM users 
      WHERE role IN ('uye', 'dernek_admin') AND il IS NOT NULL
      GROUP BY il
      ORDER BY kullanici_sayisi DESC
      LIMIT 10
    `);

    // Sektör bazında dağılım
    const [sektorStats] = await pool.execute(`
      SELECT 
        sektor,
        COUNT(*) as kullanici_sayisi
      FROM users 
      WHERE role IN ('uye', 'dernek_admin') AND sektor IS NOT NULL
      GROUP BY sektor
      ORDER BY kullanici_sayisi DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        genel: generalStats[0],
        aktifKullanicilar,
        ilBazinda: ilStats,
        sektorBazinda: sektorStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı istatistikleri getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  getDernekMembers,
  getAllUsers,
  getUserStats
};
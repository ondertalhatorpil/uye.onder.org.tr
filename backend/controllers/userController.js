const User = require('../models/User');
const Faaliyet = require('../models/Faaliyet');
const { pool } = require('../config/database');

// Kullanıcı arama
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

    let query = `
      SELECT 
        id, isim, soyisim, sektor, meslek, il, ilce, 
        gonullu_dernek, calisma_komisyon, created_at
      FROM users 
      WHERE role IN ('uye', 'dernek_admin')
    `;
    
    const conditions = [];
    const params = [];

    // İsim/soyisim arama
    if (name) {
      conditions.push('(isim LIKE ? OR soyisim LIKE ? OR CONCAT(isim, " ", soyisim) LIKE ?)');
      const searchTerm = `%${name}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sektör filtresi
    if (sektor) {
      conditions.push('sektor LIKE ?');
      params.push(`%${sektor}%`);
    }

    // Meslek arama
    if (meslek) {
      conditions.push('meslek LIKE ?');
      params.push(`%${meslek}%`);
    }

    // İl filtresi
    if (il) {
      conditions.push('il = ?');
      params.push(il);
    }

    // İlçe filtresi
    if (ilce) {
      conditions.push('ilce = ?');
      params.push(ilce);
    }

    // Dernek filtresi
    if (dernek) {
      conditions.push('gonullu_dernek LIKE ?');
      params.push(`%${dernek}%`);
    }

    // Komisyon filtresi
    if (komisyon) {
      conditions.push('calisma_komisyon LIKE ?');
      params.push(`%${komisyon}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY isim ASC';

    // Sayfalama
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.execute(query, params);

    // Toplam sayı için count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      WHERE role IN ('uye', 'dernek_admin')
    `;
    
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.execute(countQuery, params.slice(0, -2)); // LIMIT ve OFFSET'i çıkar
    const total = countResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı arama hatası: ' + error.message
    });
  }
};

// Kullanıcı profil detayı
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanıcı bilgilerini getir
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcının faaliyetlerini getir
    const faaliyetler = await Faaliyet.getByUserId(id);

    // Faaliyet istatistikleri
    const [statsResult] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
        DATE(MIN(created_at)) as ilk_faaliyet_tarihi,
        DATE(MAX(created_at)) as son_faaliyet_tarihi
      FROM faaliyet_paylasimlar 
      WHERE user_id = ?
    `, [id]);

    const stats = statsResult[0];

    res.json({
      success: true,
      data: {
        user,
        faaliyetler,
        stats: {
          toplam_faaliyet: stats.toplam_faaliyet,
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

// Dernek üyelerini listele
const getDernekMembers = async (req, res) => {
  try {
    const { dernekAdi } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const [users] = await pool.execute(`
      SELECT 
        id, isim, soyisim, sektor, meslek, il, ilce,
        calisma_komisyon, created_at
      FROM users 
      WHERE gonullu_dernek = ? 
        AND role IN ('uye', 'dernek_admin')
      ORDER BY 
        CASE WHEN role = 'dernek_admin' THEN 0 ELSE 1 END,
        isim ASC
      LIMIT ? OFFSET ?
    `, [dernekAdi, parseInt(limit), parseInt(offset)]);

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
      data: users,
      dernek: dernekAdi,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
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

// Tüm kullanıcıları listele (admin)
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
    const offset = (page - 1) * limit;

    const [users] = await pool.execute(`
      SELECT 
        id, isim, soyisim, email, role, sektor, meslek, 
        il, ilce, gonullu_dernek, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
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

// Kullanıcı istatistikleri (admin)
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
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as son_30_gun_kayit
      FROM users
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
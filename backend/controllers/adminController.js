const User = require('../models/User');
const Dernek = require('../models/Dernek');
const Faaliyet = require('../models/Faaliyet');
const { pool } = require('../config/database');

// Dashboard ana istatistikleri - ONAY SİSTEMİ EKLENDİ
const getDashboard = async (req, res) => {
  try {
    // Kullanıcı istatistikleri
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_kullanici,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as admin_sayisi,
        SUM(CASE WHEN role = 'dernek_admin' THEN 1 ELSE 0 END) as dernek_admin_sayisi,
        SUM(CASE WHEN role = 'uye' THEN 1 ELSE 0 END) as uye_sayisi,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as son_7_gun_kayit,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as son_30_gun_kayit
      FROM users
    `);

    // Dernek istatistikleri
    const [dernekStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_dernek,
        COUNT(DISTINCT il) as il_sayisi,
        COUNT(DISTINCT ilce) as ilce_sayisi
      FROM dernekler
    `);

    // Faaliyet istatistikleri - ONAY DURUMU EKLENDİ
    const [faaliyetStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
        SUM(CASE WHEN durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan_faaliyet,
        SUM(CASE WHEN durum = 'beklemede' THEN 1 ELSE 0 END) as bekleyen_faaliyet,
        SUM(CASE WHEN durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen_faaliyet,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as son_7_gun_faaliyet,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as son_30_gun_faaliyet
      FROM faaliyet_paylasimlar
    `);

    // Son kayıt olan kullanıcılar
    const [recentUsers] = await pool.execute(`
      SELECT 
        id, isim, soyisim, email, role, gonullu_dernek, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // ONAY BEKLEYENLERİ ÖNE ÇIKART - Son paylaşılan faaliyetler
    const [recentFaaliyetler] = await pool.execute(`
      SELECT 
        f.id, f.created_at, f.durum,
        u.isim, u.soyisim, u.gonullu_dernek
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      ORDER BY 
        CASE WHEN f.durum = 'beklemede' THEN 0 ELSE 1 END,
        f.created_at DESC 
      LIMIT 10
    `);

    // Bekleyen faaliyetlerin detayları - YENİ
    const [bekleyenFaaliyetler] = await pool.execute(`
      SELECT 
        f.id, f.aciklama, f.created_at,
        u.isim, u.soyisim, u.gonullu_dernek, u.il, u.ilce
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE f.durum = 'beklemede'
      ORDER BY f.created_at ASC
      LIMIT 5
    `);

    // İl bazında kullanıcı dağılımı
    const [ilDagilim] = await pool.execute(`
      SELECT 
        il,
        COUNT(*) as kullanici_sayisi
      FROM users 
      WHERE role IN ('uye', 'dernek_admin') AND il IS NOT NULL
      GROUP BY il
      ORDER BY kullanici_sayisi DESC
      LIMIT 10
    `);

    // Aktif dernekler (faaliyet sayısına göre) - ONAY DURUMU EKLENDİ
    const [aktifDernekler] = await pool.execute(`
      SELECT 
        u.gonullu_dernek,
        COUNT(f.id) as toplam_faaliyet,
        SUM(CASE WHEN f.durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan_faaliyet,
        SUM(CASE WHEN f.durum = 'beklemede' THEN 1 ELSE 0 END) as bekleyen_faaliyet,
        COUNT(DISTINCT f.user_id) as aktif_uye_sayisi
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE u.gonullu_dernek IS NOT NULL
      GROUP BY u.gonullu_dernek
      ORDER BY toplam_faaliyet DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: {
          kullanici: userStats[0],
          dernek: dernekStats[0],
          faaliyet: faaliyetStats[0]
        },
        recentUsers,
        recentFaaliyetler,
        bekleyenFaaliyetler, // YENİ
        ilDagilim,
        aktifDernekler
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Dashboard verileri getirilemedi: ' + error.message
    });
  }
};

// Bekleyen faaliyetleri listele - YENİ
const getBekleyenFaaliyetler = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      il,
      ilce,
      dernek
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        f.id, f.aciklama, f.gorseller, f.created_at,
        u.isim, u.soyisim, u.gonullu_dernek, u.il, u.ilce, u.sektor
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE f.durum = 'beklemede'
    `;

    const conditions = [];
    const params = [];

    if (il && il.trim() !== '') {
      conditions.push('u.il = ?');
      params.push(il.trim());
    }

    if (ilce && ilce.trim() !== '') {
      conditions.push('u.ilce = ?');
      params.push(ilce.trim());
    }

    if (dernek && dernek.trim() !== '') {
      conditions.push('u.gonullu_dernek LIKE ?');
      params.push(`%${dernek.trim()}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` ORDER BY f.created_at ASC LIMIT ${limitNum} OFFSET ${offset}`;

    const [faaliyetler] = await pool.execute(query, params);

    // Toplam sayı
    let countQuery = `
      SELECT COUNT(*) as total
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE f.durum = 'beklemede'
    `;

    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Görselleri parse et
    const faaliyetlerWithImages = faaliyetler.map(faaliyet => ({
      ...faaliyet,
      gorseller: faaliyet.gorseller ? JSON.parse(faaliyet.gorseller) : []
    }));

    res.json({
      success: true,
      data: faaliyetlerWithImages,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get bekleyen faaliyetler error:', error);
    res.status(500).json({
      success: false,
      error: 'Bekleyen faaliyetler getirilemedi: ' + error.message
    });
  }
};

// Faaliyet onaylama - YENİ
const onaylaFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Faaliyet var mı ve beklemede mi kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'beklemede') {
      return res.status(400).json({
        success: false,
        error: 'Bu faaliyet zaten işleme alınmış'
      });
    }

    // Onaylama işlemi
    const onaylandi = await Faaliyet.onaylaFaaliyet(id, adminId);

    if (!onaylandi) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet onaylanamadı'
      });
    }

    res.json({
      success: true,
      message: `${faaliyet.isim} ${faaliyet.soyisim} kullanıcısının faaliyeti onaylandı`
    });

  } catch (error) {
    console.error('Onayla faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet onaylanırken hata oluştu: ' + error.message
    });
  }
};

// Faaliyet reddetme - YENİ
const reddetFaaliyet = async (req, res) => {
  try {
    const { id } = req.params;
    const { red_nedeni } = req.body;
    const adminId = req.user.id;

    if (!red_nedeni || red_nedeni.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Red nedeni gerekli'
      });
    }

    // Faaliyet var mı ve beklemede mi kontrol et
    const faaliyet = await Faaliyet.findById(id);
    
    if (!faaliyet) {
      return res.status(404).json({
        success: false,
        error: 'Faaliyet bulunamadı'
      });
    }

    if (faaliyet.durum !== 'beklemede') {
      return res.status(400).json({
        success: false,
        error: 'Bu faaliyet zaten işleme alınmış'
      });
    }

    // Reddetme işlemi
    const reddedildi = await Faaliyet.reddetFaaliyet(id, adminId, red_nedeni);

    if (!reddedildi) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet reddedilemedi'
      });
    }

    res.json({
      success: true,
      message: `${faaliyet.isim} ${faaliyet.soyisim} kullanıcısının faaliyeti reddedildi`
    });

  } catch (error) {
    console.error('Reddet faaliyet error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet reddedilirken hata oluştu: ' + error.message
    });
  }
};

// Toplu faaliyet onaylama - YENİ
const topluFaaliyetOnayla = async (req, res) => {
  try {
    const { faaliyet_ids } = req.body;

    if (!faaliyet_ids || !Array.isArray(faaliyet_ids) || faaliyet_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Faaliyet ID\'leri gerekli'
      });
    }

    const adminId = req.user.id;
    const sonuclar = [];

    for (const faaliyetId of faaliyet_ids) {
      try {
        const onaylandi = await Faaliyet.onaylaFaaliyet(faaliyetId, adminId);
        sonuclar.push({
          faaliyet_id: faaliyetId,
          durum: onaylandi ? 'onaylandi' : 'hata'
        });
      } catch (error) {
        sonuclar.push({
          faaliyet_id: faaliyetId,
          durum: 'hata',
          hata: error.message
        });
      }
    }

    const basarili = sonuclar.filter(s => s.durum === 'onaylandi').length;
    const basarisiz = sonuclar.filter(s => s.durum === 'hata').length;

    res.json({
      success: true,
      message: `${basarili} faaliyet onaylandı, ${basarisiz} faaliyet onaylanamadı`,
      data: {
        basarili,
        basarisiz,
        detaylar: sonuclar
      }
    });

  } catch (error) {
    console.error('Toplu faaliyet onay error:', error);
    res.status(500).json({
      success: false,
      error: 'Toplu onay işlemi sırasında hata oluştu: ' + error.message
    });
  }
};

const getFaaliyetOnayGecmisi = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            durum,
            admin_id,
            tarih_baslangic,
            tarih_bitis
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        let query = `
      SELECT 
        f.id, f.aciklama, f.durum, f.onay_tarihi, f.red_nedeni, f.created_at,
        u.isim as user_isim, u.soyisim as user_soyisim, u.gonullu_dernek,
        admin.isim as admin_isim, admin.soyisim as admin_soyisim
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users admin ON f.onaylayan_admin_id = admin.id
      WHERE f.durum IN ('onaylandi', 'reddedildi')`;

        const conditions = [];
        const params = [];

        if (durum && durum.trim() !== '') {
            conditions.push('f.durum = ?');
            params.push(durum.trim());
        }

        if (admin_id && admin_id.trim() !== '') {
            conditions.push('f.onaylayan_admin_id = ?');
            params.push(parseInt(admin_id));
        }

        if (tarih_baslangic && tarih_baslangic.trim() !== '') {
            conditions.push('DATE(f.created_at) >= ?');
            params.push(tarih_baslangic);
        }

        if (tarih_bitis && tarih_bitis.trim() !== '') {
            conditions.push('DATE(f.created_at) <= ?');
            params.push(tarih_bitis);
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += ` ORDER BY f.onay_tarihi DESC LIMIT ${limitNum} OFFSET ${offset}`;

        console.log('getFaaliyetOnayGecmisi query:', query);
        console.log('getFaaliyetOnayGecmisi params:', params);

        const [faaliyetler] = await pool.execute(query, params);

        // Toplam sayı sorgusu
        let countQuery = `
      SELECT COUNT(*) as total
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN users admin ON f.onaylayan_admin_id = admin.id
      WHERE f.durum IN ('onaylandi', 'reddedildi')`;

        if (conditions.length > 0) {
            countQuery += ' AND ' + conditions.join(' AND ');
        }

        const [countResult] = await pool.execute(countQuery, params);
        const total = countResult[0].total;


        res.json({
            success: true,
            data: faaliyetler,  // Faaliyet array'i direkt olarak
            pagination: {
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Faaliyet geçmişi alınırken bir hata oluştu'
        });
    }
};

// getFaaliyetOnayStats fonksiyonu düzeltme
const getFaaliyetOnayStats = async (req, res) => {
  try {
    console.log('getFaaliyetOnayStats called');

    // Genel onay istatistikleri
    const [onayStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
        SUM(CASE WHEN durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan,
        SUM(CASE WHEN durum = 'beklemede' THEN 1 ELSE 0 END) as beklemede,
        SUM(CASE WHEN durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen
      FROM faaliyet_paylasimlar
    `);

    console.log('Onay stats:', onayStats[0]);

    // Günlük onay trendi (son 30 gün)
    const [gunlukTrend] = await pool.execute(`
      SELECT 
        DATE(onay_tarihi) as tarih,
        COUNT(*) as sayi,
        SUM(CASE WHEN durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan,
        SUM(CASE WHEN durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen
      FROM faaliyet_paylasimlar
      WHERE onay_tarihi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND durum IN ('onaylandi', 'reddedildi')
      GROUP BY DATE(onay_tarihi)
      ORDER BY tarih DESC
    `);

    console.log('Günlük trend:', gunlukTrend.length);

    // En çok onaylayan adminler
    const [adminStats] = await pool.execute(`
      SELECT 
        admin.isim, admin.soyisim, admin.id,
        COUNT(*) as toplam_islem,
        SUM(CASE WHEN f.durum = 'onaylandi' THEN 1 ELSE 0 END) as onaylanan,
        SUM(CASE WHEN f.durum = 'reddedildi' THEN 1 ELSE 0 END) as reddedilen
      FROM faaliyet_paylasimlar f
      JOIN users admin ON f.onaylayan_admin_id = admin.id
      WHERE f.durum IN ('onaylandi', 'reddedildi')
      GROUP BY admin.id
      ORDER BY toplam_islem DESC
      LIMIT 10
    `);

    console.log('Admin stats:', adminStats.length);

    const result = {
      genel: onayStats[0],
      gunlukTrend,
      adminStats
    };

    console.log('Final result:', result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get faaliyet onay stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Faaliyet onay istatistikleri getirilemedi: ' + error.message
    });
  }
};

// Mevcut fonksiyonlar (değişiklik yok)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['super_admin', 'dernek_admin', 'uye'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol. Geçerli roller: ' + validRoles.join(', ')
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Rol güncellenemedi'
      });
    }

    res.json({
      success: true,
      message: `${user.isim} ${user.soyisim} kullanıcısının rolü ${role} olarak güncellendi`
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Rol güncellenirken hata oluştu: ' + error.message
    });
  }
};

const assignDernekAdmin = async (req, res) => {
  try {
    const { userId, dernekId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const dernek = await Dernek.getById(dernekId);
    if (!dernek) {
      return res.status(404).json({
        success: false,
        error: 'Dernek bulunamadı'
      });
    }

    if (dernek.admin_user_id) {
      await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['uye', dernek.admin_user_id]
      );
    }

    const [dernekResult] = await pool.execute(
      'UPDATE dernekler SET admin_user_id = ? WHERE id = ?',
      [userId, dernekId]
    );

    const [userResult] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      ['dernek_admin', userId]
    );

    if (dernekResult.affectedRows === 0 || userResult.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Admin ataması yapılamadı'
      });
    }

    res.json({
      success: true,
      message: `${user.isim} ${user.soyisim}, ${dernek.dernek_adi} derneğinin admini olarak atandı`
    });

  } catch (error) {
    console.error('Assign dernek admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin ataması sırasında hata oluştu: ' + error.message
    });
  }
};

const deleteDernek = async (req, res) => {
  try {
    const { id } = req.params;

    const dernek = await Dernek.getById(id);
    if (!dernek) {
      return res.status(404).json({
        success: false,
        error: 'Dernek bulunamadı'
      });
    }

    const [memberCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE gonullu_dernek = ?',
      [dernek.dernek_adi]
    );

    if (memberCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `Bu derneğin ${memberCount[0].count} üyesi var. Önce üyeleri başka derneğe taşıyın.`
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM dernekler WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dernek silinemedi'
      });
    }

    res.json({
      success: true,
      message: `${dernek.dernek_adi} derneği başarıyla silindi`
    });

  } catch (error) {
    console.error('Delete dernek error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek silinirken hata oluştu: ' + error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Super admin kullanıcıları silinemez'
      });
    }

    if (user.role === 'dernek_admin') {
      await pool.execute(
        'UPDATE dernekler SET admin_user_id = NULL WHERE admin_user_id = ?',
        [id]
      );
    }

    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı silinemedi'
      });
    }

    res.json({
      success: true,
      message: `${user.isim} ${user.soyisim} kullanıcısı başarıyla silindi`
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı silinirken hata oluştu: ' + error.message
    });
  }
};

const getSystemSettings = async (req, res) => {
  try {
    const settings = {
      system_name: 'Dernek Yönetim Sistemi',
      version: '1.0.0',
      maintenance_mode: false,
      max_file_size: '5MB',
      max_files_per_post: 5,
      supported_file_types: ['jpg', 'jpeg', 'png', 'gif'],
      faaliyet_onay_sistemi: true // YENİ
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Sistem ayarları getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  getDashboard,
  updateUserRole,
  assignDernekAdmin,
  deleteDernek,
  deleteUser,
  getSystemSettings,
  getBekleyenFaaliyetler,
  onaylaFaaliyet,
  reddetFaaliyet,
  topluFaaliyetOnayla,
  getFaaliyetOnayGecmisi,
  getFaaliyetOnayStats
};
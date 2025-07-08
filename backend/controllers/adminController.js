const User = require('../models/User');
const Dernek = require('../models/Dernek');
const Faaliyet = require('../models/Faaliyet');
const { pool } = require('../config/database');

// Dashboard ana istatistikleri
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

    // Faaliyet istatistikleri
    const [faaliyetStats] = await pool.execute(`
      SELECT 
        COUNT(*) as toplam_faaliyet,
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

    // Son paylaşılan faaliyetler
    const [recentFaaliyetler] = await pool.execute(`
      SELECT 
        f.id, f.baslik, f.created_at,
        u.isim, u.soyisim, u.gonullu_dernek
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC 
      LIMIT 10
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

    // Aktif dernekler (faaliyet sayısına göre)
    const [aktifDernekler] = await pool.execute(`
      SELECT 
        u.gonullu_dernek,
        COUNT(f.id) as faaliyet_sayisi,
        COUNT(DISTINCT f.user_id) as aktif_uye_sayisi
      FROM faaliyet_paylasimlar f
      JOIN users u ON f.user_id = u.id
      WHERE u.gonullu_dernek IS NOT NULL
      GROUP BY u.gonullu_dernek
      ORDER BY faaliyet_sayisi DESC
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

// Kullanıcı role güncelleme
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Geçerli roller
    const validRoles = ['super_admin', 'dernek_admin', 'uye'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol. Geçerli roller: ' + validRoles.join(', ')
      });
    }

    // Kullanıcı var mı kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Role güncelle
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

// Dernek admin atama
const assignDernekAdmin = async (req, res) => {
  try {
    const { userId, dernekId } = req.body;

    // Kullanıcı kontrolü
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Dernek kontrolü
    const dernek = await Dernek.getById(dernekId);
    if (!dernek) {
      return res.status(404).json({
        success: false,
        error: 'Dernek bulunamadı'
      });
    }

    // Eski admin varsa role'ünü uye yap
    if (dernek.admin_user_id) {
      await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['uye', dernek.admin_user_id]
      );
    }

    // Yeni admin ata
    const [dernekResult] = await pool.execute(
      'UPDATE dernekler SET admin_user_id = ? WHERE id = ?',
      [userId, dernekId]
    );

    // Kullanıcının role'ünü dernek_admin yap
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

// Dernek silme
const deleteDernek = async (req, res) => {
  try {
    const { id } = req.params;

    // Dernek var mı kontrol et
    const dernek = await Dernek.getById(id);
    if (!dernek) {
      return res.status(404).json({
        success: false,
        error: 'Dernek bulunamadı'
      });
    }

    // Derneğin üyeleri var mı kontrol et
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

    // Derneği sil
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

// Kullanıcı silme
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanıcı var mı kontrol et
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Super admin silinmesin
    if (user.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Super admin kullanıcıları silinemez'
      });
    }

    // Eğer dernek admini ise, derneğin admin_user_id'sini null yap
    if (user.role === 'dernek_admin') {
      await pool.execute(
        'UPDATE dernekler SET admin_user_id = NULL WHERE admin_user_id = ?',
        [id]
      );
    }

    // Kullanıcıyı sil (CASCADE ile faaliyetleri de silinir)
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

// Sistem ayarları (gelecekte eklenebilir)
const getSystemSettings = async (req, res) => {
  try {
    // Şimdilik basit sistem bilgileri
    const settings = {
      system_name: 'Dernek Yönetim Sistemi',
      version: '1.0.0',
      maintenance_mode: false,
      max_file_size: '5MB',
      max_files_per_post: 5,
      supported_file_types: ['jpg', 'jpeg', 'png', 'gif']
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
  getSystemSettings
};
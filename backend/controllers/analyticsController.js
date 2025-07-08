const { pool } = require('../config/database');

// Kullanıcı segmentasyon analizi
const getUserSegments = async (req, res) => {
  try {
    // Süper aktif kullanıcılar (haftada 3+ paylaşım)
    const [superActiveUsers] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek,
        COUNT(f.id) as faaliyet_sayisi,
        COUNT(f.id) / 7 as haftalik_ortalama
      FROM users u
      JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING faaliyet_sayisi >= 3
      ORDER BY faaliyet_sayisi DESC
      LIMIT 50
    `);

    // Orta aktif kullanıcılar (ayda 1+ paylaşım)
    const [moderateActiveUsers] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek,
        COUNT(f.id) as faaliyet_sayisi
      FROM users u
      JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING faaliyet_sayisi >= 1 AND faaliyet_sayisi < 12
      ORDER BY faaliyet_sayisi DESC
      LIMIT 100
    `);

    // Pasif kullanıcılar (3 ayda paylaşım yok)
    const [passiveUsers] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.created_at,
        COALESCE(MAX(f.created_at), 'Hiç paylaşım yok') as son_faaliyet
      FROM users u
      LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE u.role IN ('uye', 'dernek_admin')
        AND (f.created_at IS NULL OR f.created_at < DATE_SUB(NOW(), INTERVAL 90 DAY))
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 100
    `);

    // Yeni kayıtlar (son 30 gün)
    const [newUsers] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.created_at,
        COUNT(f.id) as faaliyet_sayisi
      FROM users u
      LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    // Dernek liderleri (en çok faaliyet organize eden)
    const [dernekLeaders] = await pool.execute(`
      SELECT 
        u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.role,
        COUNT(f.id) as toplam_faaliyet,
        COUNT(CASE WHEN f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as son_30_gun_faaliyet,
        MIN(f.created_at) as ilk_faaliyet,
        MAX(f.created_at) as son_faaliyet
      FROM users u
      JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING toplam_faaliyet >= 5
      ORDER BY toplam_faaliyet DESC, son_30_gun_faaliyet DESC
      LIMIT 20
    `);

    // Segment sayıları
    const [segmentCounts] = await pool.execute(`
      SELECT 
        'super_active' as segment,
        COUNT(DISTINCT u.id) as count
      FROM users u
      JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING COUNT(f.id) >= 3
      
      UNION ALL
      
      SELECT 
        'moderate_active' as segment,
        COUNT(DISTINCT u.id) as count
      FROM users u
      JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY u.id
      HAVING COUNT(f.id) >= 1 AND COUNT(f.id) < 12
      
      UNION ALL
      
      SELECT 
        'passive' as segment,
        COUNT(*) as count
      FROM users u
      LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
      WHERE u.role IN ('uye', 'dernek_admin')
        AND (f.created_at IS NULL OR f.created_at < DATE_SUB(NOW(), INTERVAL 90 DAY))
      
      UNION ALL
      
      SELECT 
        'new_users' as segment,
        COUNT(*) as count
      FROM users u
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND u.role IN ('uye', 'dernek_admin')
    `);

    res.json({
      success: true,
      data: {
        segments: {
          super_active: {
            count: superActiveUsers.length,
            users: superActiveUsers
          },
          moderate_active: {
            count: moderateActiveUsers.length,
            users: moderateActiveUsers
          },
          passive: {
            count: passiveUsers.length,
            users: passiveUsers
          },
          new_users: {
            count: newUsers.length,
            users: newUsers
          },
          dernek_leaders: {
            count: dernekLeaders.length,
            users: dernekLeaders
          }
        },
        summary: segmentCounts
      }
    });

  } catch (error) {
    console.error('Get user segments error:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcı segmentleri getirilemedi: ' + error.message
    });
  }
};

// Dernek segmentasyon analizi
const getDernekSegments = async (req, res) => {
  try {
    // En büyük dernekler (üye sayısına göre)
    const [biggestDernekler] = await pool.execute(`
      SELECT 
        d.id, d.dernek_adi, d.il, d.ilce, d.dernek_baskani,
        COUNT(u.id) as uye_sayisi,
        d.created_at as dernek_kuruluş
      FROM dernekler d
      LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi 
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY d.id
      ORDER BY uye_sayisi DESC
      LIMIT 20
    `);

    // En aktif dernekler (faaliyet sayısına göre)
    const [mostActiveDernekler] = await pool.execute(`
      SELECT 
        d.id, d.dernek_adi, d.il, d.ilce, d.dernek_baskani,
        COUNT(u.id) as uye_sayisi,
        COUNT(f.id) as toplam_faaliyet,
        COUNT(CASE WHEN f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as son_30_gun_faaliyet,
        COUNT(DISTINCT f.user_id) as aktif_uye_sayisi
      FROM dernekler d
      LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi 
        AND u.role IN ('uye', 'dernek_admin')
      LEFT JOIN faaliyet_paylasimlar f ON f.user_id = u.id
      GROUP BY d.id
      HAVING toplam_faaliyet > 0
      ORDER BY toplam_faaliyet DESC, son_30_gun_faaliyet DESC
      LIMIT 20
    `);

    // Büyüyen dernekler (üye artış hızına göre)
    const [growingDernekler] = await pool.execute(`
      SELECT 
        d.id, d.dernek_adi, d.il, d.ilce,
        COUNT(u.id) as toplam_uye,
        COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as son_30_gun_yeni_uye,
        COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as son_7_gun_yeni_uye,
        ROUND(
          COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) * 100.0 / 
          NULLIF(COUNT(u.id), 0), 2
        ) as aylik_buyume_orani
      FROM dernekler d
      LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi 
        AND u.role IN ('uye', 'dernek_admin')
      GROUP BY d.id
      HAVING son_30_gun_yeni_uye > 0
      ORDER BY aylik_buyume_orani DESC, son_30_gun_yeni_uye DESC
      LIMIT 20
    `);

    // Pasif dernekler (son 3 ayda faaliyet yok)
    const [passiveDernekler] = await pool.execute(`
      SELECT 
        d.id, d.dernek_adi, d.il, d.ilce, d.dernek_baskani,
        COUNT(u.id) as uye_sayisi,
        COUNT(f.id) as toplam_faaliyet,
        MAX(f.created_at) as son_faaliyet_tarihi,
        DATEDIFF(NOW(), MAX(f.created_at)) as son_faaliyetten_gecen_gun
      FROM dernekler d
      LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi 
        AND u.role IN ('uye', 'dernek_admin')
      LEFT JOIN faaliyet_paylasimlar f ON f.user_id = u.id
      WHERE COUNT(u.id) > 0  -- En az 1 üyesi olan dernekler
      GROUP BY d.id
      HAVING (son_faaliyet_tarihi IS NULL OR son_faaliyet_tarihi < DATE_SUB(NOW(), INTERVAL 90 DAY))
      ORDER BY uye_sayisi DESC
      LIMIT 50
    `);

    // Dernek segment sayıları
    const [dernekSegmentCounts] = await pool.execute(`
      SELECT 
        'biggest' as segment,
        COUNT(*) as count
      FROM (
        SELECT d.id
        FROM dernekler d
        LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi 
        GROUP BY d.id
        HAVING COUNT(u.id) >= 5
      ) as big_dernekler
      
      UNION ALL
      
      SELECT 
        'most_active' as segment,
        COUNT(*) as count
      FROM (
        SELECT d.id
        FROM dernekler d
        LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi
        LEFT JOIN faaliyet_paylasimlar f ON f.user_id = u.id
        GROUP BY d.id
        HAVING COUNT(f.id) >= 3
      ) as active_dernekler
      
      UNION ALL
      
      SELECT 
        'growing' as segment,
        COUNT(*) as count
      FROM (
        SELECT d.id
        FROM dernekler d
        LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY d.id
        HAVING COUNT(u.id) > 0
      ) as growing_dernekler
      
      UNION ALL
      
      SELECT 
        'passive' as segment,
        COUNT(*) as count
      FROM (
        SELECT d.id
        FROM dernekler d
        LEFT JOIN users u ON u.gonullu_dernek = d.dernek_adi
        LEFT JOIN faaliyet_paylasimlar f ON f.user_id = u.id
        GROUP BY d.id
        HAVING COUNT(u.id) > 0 AND (MAX(f.created_at) IS NULL OR MAX(f.created_at) < DATE_SUB(NOW(), INTERVAL 90 DAY))
      ) as passive_dernekler
    `);

    res.json({
      success: true,
      data: {
        segments: {
          biggest: {
            count: biggestDernekler.length,
            dernekler: biggestDernekler
          },
          most_active: {
            count: mostActiveDernekler.length,
            dernekler: mostActiveDernekler
          },
          growing: {
            count: growingDernekler.length,
            dernekler: growingDernekler
          },
          passive: {
            count: passiveDernekler.length,
            dernekler: passiveDernekler
          }
        },
        summary: dernekSegmentCounts
      }
    });

  } catch (error) {
    console.error('Get dernek segments error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek segmentleri getirilemedi: ' + error.message
    });
  }
};

// Segment detayları (belirli bir segmentteki kullanıcıları detaylı getir)
const getSegmentDetails = async (req, res) => {
  try {
    const { type, segment } = req.params; // user/dernek ve segment adı

    if (type === 'user') {
      // Kullanıcı segment detayları
      let query = '';
      let params = [];

      switch (segment) {
        case 'super_active':
          query = `
            SELECT 
              u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.il, u.ilce,
              COUNT(f.id) as haftalik_faaliyet,
              COUNT(f.id) / 7 as gunluk_ortalama
            FROM users u
            JOIN faaliyet_paylasimlar f ON u.id = f.user_id
            WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND u.role IN ('uye', 'dernek_admin')
            GROUP BY u.id
            HAVING haftalik_faaliyet >= 3
            ORDER BY haftalik_faaliyet DESC
          `;
          break;

        case 'moderate_active':
          query = `
            SELECT 
              u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.il, u.ilce,
              COUNT(f.id) as aylik_faaliyet
            FROM users u
            JOIN faaliyet_paylasimlar f ON u.id = f.user_id
            WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND u.role IN ('uye', 'dernek_admin')
            GROUP BY u.id
            HAVING aylik_faaliyet >= 1 AND aylik_faaliyet < 12
            ORDER BY aylik_faaliyet DESC
          `;
          break;

        case 'passive':
          query = `
            SELECT 
              u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.il, u.ilce, u.created_at,
              COALESCE(MAX(f.created_at), 'Hiç paylaşım yok') as son_faaliyet,
              COALESCE(DATEDIFF(NOW(), MAX(f.created_at)), 999) as gun_gecti
            FROM users u
            LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
            WHERE u.role IN ('uye', 'dernek_admin')
              AND (f.created_at IS NULL OR f.created_at < DATE_SUB(NOW(), INTERVAL 90 DAY))
            GROUP BY u.id
            ORDER BY gun_gecti DESC
          `;
          break;

        case 'new_users':
          query = `
            SELECT 
              u.id, u.isim, u.soyisim, u.email, u.gonullu_dernek, u.il, u.ilce, u.created_at,
              COUNT(f.id) as faaliyet_sayisi,
              DATEDIFF(NOW(), u.created_at) as kayit_gun_sayisi
            FROM users u
            LEFT JOIN faaliyet_paylasimlar f ON u.id = f.user_id
            WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND u.role IN ('uye', 'dernek_admin')
            GROUP BY u.id
            ORDER BY u.created_at DESC
          `;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Geçersiz kullanıcı segment'
          });
      }

      const [results] = await pool.execute(query, params);

      res.json({
        success: true,
        data: {
          type: 'user',
          segment: segment,
          count: results.length,
          results: results
        }
      });

    } else if (type === 'dernek') {
      // Dernek segment detayları implementation'ı buraya eklenebilir
      res.json({
        success: true,
        message: 'Dernek segment detayları henüz implement edilmedi'
      });

    } else {
      res.status(400).json({
        success: false,
        error: 'Geçersiz tip. user veya dernek olmalı'
      });
    }

  } catch (error) {
    console.error('Get segment details error:', error);
    res.status(500).json({
      success: false,
      error: 'Segment detayları getirilemedi: ' + error.message
    });
  }
};

module.exports = {
  getUserSegments,
  getDernekSegments,
  getSegmentDetails
};
const Dernek = require('../models/Dernek');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const geocodingService = require('../services/GeocodingService');


// Excel'den dernek yükleme (Super Admin)
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Excel dosyası seçiniz' 
      });
    }

    console.log('Excel dosyası yüklendi:', req.file.filename);

    // Excel dosyasını oku
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON'a çevir
    const rawData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('Excel satır sayısı:', rawData.length);
    console.log('İlk satır sütunları:', Object.keys(rawData[0]));
    console.log('İlk 3 satır:', rawData.slice(0, 3));

    if (rawData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Excel dosyası boş veya hatalı' 
      });
    }

    // Veri temizleme ve doğrulama
    const cleanedData = [];
    const errors = [];

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // Excel'de başlık satırı 1, veri 2'den başlar
      
      // Excel sütun isimlerinize göre mapping
      const il = row['İL'] || row['IL'];
      const ilce = row['İLÇE'] || row['ILCE'];
      const dernekAdi = row['DERNEK ADI'] || row['DERNEK_ADI'];
      const adi = row['ADI'];
      const soyadi = row['SOYADI'];
      const gsm = row['GSM'];
      const email = row['E-posta'];

      console.log(`Satır ${rowNumber}:`, { il, ilce, dernekAdi, adi, soyadi }); // Debug için

      // Zorunlu alanları kontrol et
      if (!il || !dernekAdi) {
        errors.push(`Satır ${rowNumber}: İl ve Dernek Adı bilgisi zorunlu (İl: ${il}, Dernek: ${dernekAdi})`);
        return;
      }

      // Dernek başkanının tam adını oluştur
      let dernekBaskani = null;
      if (adi && soyadi) {
        dernekBaskani = `${String(adi).trim()} ${String(soyadi).trim()}`;
      } else if (adi) {
        dernekBaskani = String(adi).trim();
      }

      // Temizlenmiş veriyi ekle
      cleanedData.push({
        dernek_adi: String(dernekAdi).trim(),
        il: String(il).trim(),
        ilce: ilce ? String(ilce).trim() : '',
        dernek_baskani: dernekBaskani,
        dernek_telefon: gsm ? String(gsm).trim() : null,
        dernek_email: email ? String(email).trim() : null
      });
    });

    console.log('Temizlenmiş veri sayısı:', cleanedData.length);
    console.log('İlk 3 temizlenmiş veri:', cleanedData.slice(0, 3));

    if (cleanedData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geçerli veri bulunamadı',
        details: errors.slice(0, 10) // İlk 10 hatayı göster
      });
    }

    // Database'e ekle
    const insertedCount = await Dernek.bulkInsert(cleanedData);

    // Geçici dosyayı sil
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Excel dosyası başarıyla yüklendi',
      stats: {
        totalRows: rawData.length,
        validRows: cleanedData.length,
        insertedRows: insertedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    
    // Hata durumunda geçici dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Excel işleme hatası: ' + error.message 
    });
  }
};

const getDerneklerByLocation = async (req, res) => {
  try {
    const { il, ilce } = req.query;

    if (!il) {
      return res.status(400).json({ 
        success: false, 
        error: 'İl parametresi gerekli' 
      });
    }

    const dernekler = await Dernek.getByLocation(il, ilce);
    
    res.json({ 
      success: true,
      data: dernekler,
      count: dernekler.length
    });

  } catch (error) {
    console.error('Get dernekler error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Dernekler getirilemedi' 
    });
  }
};

const getAllDernekler = async (req, res) => {
  try {
    const dernekler = await Dernek.getAll();
    res.json({ 
      success: true,
      data: dernekler,
      count: dernekler.length
    });
  } catch (error) {
    console.error('Get all dernekler error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Dernekler getirilemedi' 
    });
  }
};

// YENİ: Harita için konum bilgisi olan dernekleri getir
const getDerneklerWithLocation = async (req, res) => {
  try {
    const dernekler = await Dernek.getAllWithLocation();
    res.json({ 
      success: true,
      data: dernekler,
      count: dernekler.length
    });
  } catch (error) {
    console.error('Get dernekler with location error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Konum bilgili dernekler getirilemedi' 
    });
  }
};

const updateMyDernek = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      dernek_adi,
      dernek_baskani,
      dernek_telefon,
      dernek_email,
      dernek_kuruluş_tarihi,  
      dernek_sosyal_medya_hesaplari,
      dernek_latitude,    // YENİ
      dernek_longitude,   // YENİ
      dernek_adres        // YENİ
    } = req.body;

    // Bu kullanıcının admin olduğu derneği bul
    const [dernekRows] = await require('../config/database').pool.execute(`
      SELECT * FROM dernekler WHERE admin_user_id = ?
    `, [userId]);

    if (dernekRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Size atanmış bir dernek bulunamadı'
      });
    }

    const dernek = dernekRows[0];

    // Tarih formatını kontrol et (YYYY-MM-DD)
    let formattedDate = dernek.dernek_kuruluş_tarihi;
    if (dernek_kuruluş_tarihi) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dernek_kuruluş_tarihi)) {
        return res.status(400).json({
          success: false,
          error: 'Kuruluş tarihi YYYY-MM-DD formatında olmalıdır (örn: 2020-05-15)'
        });
      }
      formattedDate = dernek_kuruluş_tarihi;
    }

    // Koordinat validasyonu
    if (dernek_latitude && dernek_longitude) {
      const lat = parseFloat(dernek_latitude);
      const lng = parseFloat(dernek_longitude);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz koordinat bilgisi'
        });
      }
    }

    // Dernek güncelle
    const [result] = await require('../config/database').pool.execute(`
      UPDATE dernekler 
      SET dernek_adi = ?, dernek_baskani = ?, dernek_telefon = ?, 
          dernek_email = ?, dernek_kuruluş_tarihi = ?, 
          dernek_sosyal_medya_hesaplari = ?,
          dernek_latitude = ?, dernek_longitude = ?, dernek_adres = ?,
          updated_at = NOW()
      WHERE id = ? AND admin_user_id = ?
    `, [
      dernek_adi || dernek.dernek_adi,
      dernek_baskani || dernek.dernek_baskani,
      dernek_telefon || dernek.dernek_telefon,
      dernek_email || dernek.dernek_email,
      formattedDate,
      JSON.stringify(dernek_sosyal_medya_hesaplari || dernek.dernek_sosyal_medya_hesaplari),
      dernek_latitude || dernek.dernek_latitude,      // YENİ
      dernek_longitude || dernek.dernek_longitude,    // YENİ
      dernek_adres || dernek.dernek_adres,            // YENİ
      dernek.id,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dernek güncellenemedi'
      });
    }

    // Güncellenmiş derneği getir
    const updatedDernek = await Dernek.getById(dernek.id);

    res.json({
      success: true,
      message: 'Dernek bilgileri başarıyla güncellendi',
      data: updatedDernek
    });

  } catch (error) {
    console.error('Update my dernek error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek güncellenirken hata oluştu: ' + error.message
    });
  }
};

//updateDernekLocation fonksiyonu zaten var ve çalışıyor:
const updateDernekLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, adres } = req.body;

    // Koordinat validasyonu
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Enlem ve boylam bilgisi zorunlu'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz koordinat bilgisi'
      });
    }

    // Bu kullanıcının admin olduğu derneği bul
    const [dernekRows] = await require('../config/database').pool.execute(`
      SELECT * FROM dernekler WHERE admin_user_id = ?
    `, [userId]);

    if (dernekRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Size atanmış bir dernek bulunamadı'
      });
    }

    const dernek = dernekRows[0];

    // Konum güncelle
    const success = await require('../models/Dernek').updateLocation(dernek.id, userId, {
      latitude: lat,
      longitude: lng,
      adres: adres || null
    });

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Konum güncellenemedi'
      });
    }

    res.json({
      success: true,
      message: 'Dernek konumu başarıyla güncellendi',
      data: {
        latitude: lat,
        longitude: lng,
        adres: adres
      }
    });

  } catch (error) {
    console.error('Update dernek location error:', error);
    res.status(500).json({
      success: false,
      error: 'Konum güncellenirken hata oluştu: ' + error.message
    });
  }
};

// Dernek admin'in kendi dernek bilgilerini getirmesi
const getMyDernek = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('getMyDernek - User ID:', userId, 'Role:', userRole);

    // Önce kullanıcının admin olduğu derneği bul
    const [dernekRows] = await require('../config/database').pool.execute(`
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
      FROM dernekler d 
      WHERE d.admin_user_id = ?
    `, [userId]);

    console.log('Direct admin assignment result:', dernekRows.length);

    // Eğer doğrudan admin ataması yoksa ve kullanıcı dernek_admin rolündeyse
    if (dernekRows.length === 0 && userRole === 'dernek_admin') {
      console.log('No direct assignment found, checking user dernek...');
      
      // Kullanıcının hangi derneğe üye olduğunu kontrol et
      const [userInfo] = await require('../config/database').pool.execute(`
        SELECT gonullu_dernek FROM users WHERE id = ?
      `, [userId]);

      if (userInfo.length > 0 && userInfo[0].gonullu_dernek) {
        const userDernek = userInfo[0].gonullu_dernek;
        console.log('User belongs to dernek:', userDernek);

        // Bu derneği bul
        const [userDernekRows] = await require('../config/database').pool.execute(`
          SELECT 
            d.*,
            (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
          FROM dernekler d 
          WHERE d.dernek_adi = ?
        `, [userDernek]);

        if (userDernekRows.length > 0) {
          const dernek = userDernekRows[0];
          
          // Eğer bu derneğin henüz admin'i yoksa, bu kullanıcıyı admin yap
          if (!dernek.admin_user_id) {
            console.log('Auto-assigning user as admin for:', userDernek);
            
            await require('../config/database').pool.execute(`
              UPDATE dernekler SET admin_user_id = ? WHERE dernek_adi = ?
            `, [userId, userDernek]);

            // Güncellenmiş dernek bilgisini getir
            const [updatedDernekRows] = await require('../config/database').pool.execute(`
              SELECT 
                d.*,
                (SELECT COUNT(*) FROM users WHERE gonullu_dernek = d.dernek_adi) as uye_sayisi
              FROM dernekler d 
              WHERE d.admin_user_id = ?
            `, [userId]);

            if (updatedDernekRows.length > 0) {
              const updatedDernek = updatedDernekRows[0];

              // Sosyal medya JSON parse et
              if (updatedDernek.dernek_sosyal_medya_hesaplari) {
                try {
                  updatedDernek.dernek_sosyal_medya_hesaplari = JSON.parse(updatedDernek.dernek_sosyal_medya_hesaplari);
                } catch (e) {
                  updatedDernek.dernek_sosyal_medya_hesaplari = {};
                }
              }

              return res.json({
                success: true,
                data: updatedDernek,
                message: 'Otomatik olarak dernek admin\'i olarak atandınız'
              });
            }
          } else {
            return res.status(403).json({
              success: false,
              error: `${userDernek} derneğinin zaten bir admin'i var. Lütfen sistem yöneticisi ile iletişime geçin.`
            });
          }
        }
      }
    }

    // Normal akış - doğrudan admin ataması var
    if (dernekRows.length > 0) {
      const dernek = dernekRows[0];

      // Sosyal medya JSON parse et
      if (dernek.dernek_sosyal_medya_hesaplari) {
        try {
          dernek.dernek_sosyal_medya_hesaplari = JSON.parse(dernek.dernek_sosyal_medya_hesaplari);
        } catch (e) {
          dernek.dernek_sosyal_medya_hesaplari = {};
        }
      }

      return res.json({
        success: true,
        data: dernek
      });
    }

    // Hiçbir dernek bulunamadı
    return res.status(404).json({
      success: false,
      error: 'Size atanmış bir dernek bulunamadı'
    });

  } catch (error) {
    console.error('Get my dernek error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek bilgileri getirilemedi: ' + error.message
    });
  }
};

// Dernek logosu yükleme
const uploadDernekLogo = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Logo dosyası seçiniz'
      });
    }

    // Bu kullanıcının admin olduğu derneği bul
    const [dernekRows] = await require('../config/database').pool.execute(`
      SELECT * FROM dernekler WHERE admin_user_id = ?
    `, [userId]);

    if (dernekRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Size atanmış bir dernek bulunamadı'
      });
    }

    const dernek = dernekRows[0];
    const logoFileName = req.file.filename;

    // Eski logoyu sil
    if (dernek.dernek_logosu) {
      const oldLogoPath = path.join(__dirname, '../uploads/dernek-logos', dernek.dernek_logosu);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Logo dosya adını database'e kaydet
    const [result] = await require('../config/database').pool.execute(`
      UPDATE dernekler 
      SET dernek_logosu = ?, updated_at = NOW()
      WHERE id = ? AND admin_user_id = ?
    `, [logoFileName, dernek.id, userId]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        error: 'Logo güncellenemedi'
      });
    }

    res.json({
      success: true,
      message: 'Logo başarıyla güncellendi',
      data: {
        logo_url: `/uploads/dernek-logos/${logoFileName}`,
        filename: logoFileName
      }
    });

  } catch (error) {
    console.error('Upload dernek logo error:', error);
    res.status(500).json({
      success: false,
      error: 'Logo yüklenirken hata oluştu: ' + error.message
    });
  }
};

const getDernekProfile = async (req, res) => {
  try {
    const { dernekAdi } = req.params;
    const decodedDernekAdi = decodeURIComponent(dernekAdi);

    // Derneği bul
    const dernek = await Dernek.getByName(decodedDernekAdi);
    
    if (!dernek) {
      return res.status(404).json({
        success: false,
        error: 'Dernek bulunamadı'
      });
    }

    // Sosyal medya JSON parse et
    if (dernek.dernek_sosyal_medya_hesaplari) {
      try {
        dernek.dernek_sosyal_medya_hesaplari = JSON.parse(dernek.dernek_sosyal_medya_hesaplari);
      } catch (e) {
        dernek.dernek_sosyal_medya_hesaplari = {};
      }
    }

    res.json({
      success: true,
      data: dernek
    });

  } catch (error) {
    console.error('Get dernek profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Dernek profili getirilemedi: ' + error.message
    });
  }
};



module.exports = {
  uploadExcel,
  getDerneklerByLocation,
  getAllDernekler,
  getDerneklerWithLocation,  
  getMyDernek,
  updateMyDernek,
  updateDernekLocation,      
  uploadDernekLogo,
  getDernekProfile,


};
const mysql = require('mysql2');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Database bağlantısı - config/database.js'deki ayarları kullanın
const db = mysql.createConnection({
  host: 'localhost',     // Kendi database ayarlarınızı yazın
  user: 'root',          // Kendi database ayarlarınızı yazın  
  password: '',          // Kendi database ayarlarınızı yazın
  database: 'dernek_system' // Kendi database adınızı yazın
});

// Excel dosyalarını import eden fonksiyon
async function importDerneklerExcel(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    
    console.log(`\n=== DERNEKLER Import Başlıyor ===`);
    console.log(`Dosya: ${filePath}`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Dosya bulunamadı: ${filePath}`);
      return;
    }

    // Excel dosyasını oku
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Excel'i raw data olarak oku (header kullanmadan)
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📁 Excel okundu: ${rawData.length} satır bulundu`);
    
    if (rawData.length < 2) {
      console.error('❌ Excel dosyasında yeterli veri yok!');
      return;
    }

    // İlk satırı (başlık) kontrol et
    console.log('🔍 Header satırı:');
    console.log(rawData[0]);
    
    // İkinci satırdan itibaren veriyi işle
    console.log('🔍 İlk veri satırı örneği:');
    console.log(rawData[1]);

    // Mevcut dernekler tablosunu temizle
    console.log('\n🗑️ Mevcut dernekler tablosu temizleniyor...');
    const deleteResult = await queryDatabase('DELETE FROM dernekler');
    console.log(`✅ ${deleteResult.affectedRows} kayıt silindi`);

    // Auto increment'i sıfırla
    await queryDatabase('ALTER TABLE dernekler AUTO_INCREMENT = 1');
    console.log('✅ Auto increment sıfırlandı');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Veri satırlarını işle (1. satırdan itibaren - 0. satır header)
    for (let i = 1; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        
        // Satır boşsa geç
        if (!row || row.length < 6) {
          continue;
        }

        // Excel kolonları (görsel temel alınarak):
        // 0: SIRA, 1: İL, 2: İLÇE, 3: DERNEK ADI, 4: ADI, 5: SOYADI, 6: GSM
        const sira = row[0];
        const il = row[1];
        const ilce = row[2];
        const dernekAdi = row[3];
        const adi = row[4];
        const soyadi = row[5];
        const gsm = row[6];

        // İlk satırı (header içeriğini) atla
        if (sira === 'Sıra' || sira === 'SIRA' || sira === undefined || il === 'İl' || il === 'IL') {
          continue;
        }

        // Zorunlu alanları kontrol et
        if (!il || !dernekAdi) {
          errors.push(`Satır ${i + 1}: Eksik bilgi - İl: "${il}", Dernek: "${dernekAdi}"`);
          errorCount++;
          continue;
        }

        // Veri temizliği
        const cleanIl = il ? il.toString().trim().toUpperCase() : null;
        const cleanIlce = ilce ? ilce.toString().trim().toUpperCase() : null;
        let cleanDernekAdi = dernekAdi ? dernekAdi.toString().trim() : null;
        const cleanAdi = adi ? adi.toString().trim().toUpperCase() : null;
        const cleanSoyadi = soyadi ? soyadi.toString().trim().toUpperCase() : null;
        const cleanGsm = gsm ? gsm.toString().trim().replace(/\s/g, '') : null;

        // Dernek adını benzersiz yap (aynı isimli dernekler için il/ilçe ekle)
        if (cleanDernekAdi === 'Temsilci' || cleanDernekAdi === 'TEMSİLCİ') {
          cleanDernekAdi = `${cleanDernekAdi} - ${cleanIl}`;
          if (cleanIlce) {
            cleanDernekAdi += ` / ${cleanIlce}`;
          }
        }

        // Boş değerleri kontrol et
        if (!cleanIl || !cleanDernekAdi) {
          continue;
        }

        // GSM temizliği ve kısaltma
        let cleanedGsm = null;
        if (cleanGsm) {
          cleanedGsm = cleanGsm.replace(/[^0-9]/g, '');
          
          // Telefon numarası çok uzunsa kısalt (15 karakter limit)
          if (cleanedGsm.length > 15) {
            console.log(`⚠️ Uzun telefon kısaltıldı: ${cleanedGsm} -> ${cleanedGsm.substring(0, 15)}`);
            cleanedGsm = cleanedGsm.substring(0, 15);
          }
          
          if (cleanedGsm.length < 10) {
            cleanedGsm = null; // Geçersiz GSM
          }
        }

        // Insert query - doğru sütun adlarıyla (ş harfli)
        const insertQuery = `
          INSERT INTO dernekler (
            dernek_adi, 
            dernek_logosu,
            dernek_baskani,
            dernek_kuruluş_tarihi,
            dernek_sosyal_medya_hesaplari,
            dernek_telefon,
            dernek_email,
            admin_user_id,
            il, 
            ilce,
            dernek_latitude,
            dernek_longitude,
            dernek_adres
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Dernek başkanı adı soyadı birleştir
        let dernekBaskani = null;
        if (cleanAdi || cleanSoyadi) {
          dernekBaskani = `${cleanAdi || ''} ${cleanSoyadi || ''}`.trim();
          if (dernekBaskani === '') dernekBaskani = null;
        }
        
        await queryDatabase(insertQuery, [
          cleanDernekAdi,      // dernek_adi (Excel'den)
          null,                // dernek_logosu (Excel'de yok)
          dernekBaskani,       // dernek_baskani (Excel'den ad+soyad)
          null,                // dernek_kuruluş_tarihi (Excel'de yok - NULL)
          null,                // dernek_sosyal_medya_hesaplari (Excel'de yok)
          cleanedGsm,          // dernek_telefon (Excel'den)
          null,                // dernek_email (Excel'de yok)
          null,                // admin_user_id (Excel'de yok)
          cleanIl,             // il (Excel'den)
          cleanIlce,           // ilce (Excel'den)
          null,                // dernek_latitude (Excel'de yok)
          null,                // dernek_longitude (Excel'de yok)
          null                 // dernek_adres (Excel'de yok)
        ]);

        successCount++;

        // Progress göstergesi
        if (successCount % 100 === 0) {
          console.log(`⏳ İşlenen: ${successCount}/${rawData.length - 1}`);
        }

      } catch (error) {
        console.error(`❌ Satır ${i + 1} hatası:`, error.message);
        errors.push(`Satır ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    // Sonuçları göster
    console.log(`\n✅ DERNEKLER Import Tamamlandı!`);
    console.log(`📊 Toplam satır: ${rawData.length - 1}`);
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hata: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ İlk 10 hata:`);
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
    }

  } catch (error) {
    console.error(`❌ Dernekler import genel hatası:`, error);
  }
}

// Database query helper
function queryDatabase(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🚀 Dernekler Import İşlemi Başlıyor...');
    
    // Database bağlantısını test et
    await queryDatabase('SELECT 1');
    console.log('✅ Database bağlantısı başarılı');

    // Tabloyu kontrol et
    try {
      await queryDatabase('SELECT COUNT(*) as count FROM dernekler');
      console.log('✅ Dernekler tablosu mevcut');
    } catch (error) {
      console.error('❌ Dernekler tablosu bulunamadı! Önce tabloyu oluşturun.');
      process.exit(1);
    }

    // Import işlemini başlat
    // Excel dosya adını buraya yazın (script ile aynı klasörde olmalı)
    await importDerneklerExcel('dernekler.xlsx');

    // Final istatistikleri
    const finalStats = await queryDatabase(`
      SELECT 
        COUNT(*) as toplam_dernek,
        COUNT(DISTINCT il) as il_sayisi,
        COUNT(DISTINCT ilce) as ilce_sayisi,
        COUNT(dernek_baskani) as baskani_olan,
        COUNT(dernek_telefon) as telefonu_olan
      FROM dernekler
    `);

    console.log('\n📊 FINAL İSTATİSTİKLER:');
    const stats = finalStats[0];
    console.log(`📍 Toplam Dernek: ${stats.toplam_dernek}`);
    console.log(`🏙️ İl Sayısı: ${stats.il_sayisi}`);
    console.log(`🏘️ İlçe Sayısı: ${stats.ilce_sayisi}`);
    console.log(`👤 Başkanı Olan: ${stats.baskani_olan}`);
    console.log(`📞 Telefonu Olan: ${stats.telefonu_olan}`);

    // İl bazında dağılım
    const ilStats = await queryDatabase(`
      SELECT il, COUNT(*) as dernek_sayisi
      FROM dernekler 
      GROUP BY il 
      ORDER BY dernek_sayisi DESC 
      LIMIT 10
    `);

    console.log('\n🏆 EN ÇOK DERNEK OLAN İLLER:');
    ilStats.forEach((item, index) => {
      console.log(`${index + 1}. ${item.il}: ${item.dernek_sayisi} dernek`);
    });

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    db.end();
    console.log('\n🏁 İşlem tamamlandı!');
  }
}

// Scripti çalıştır
main();
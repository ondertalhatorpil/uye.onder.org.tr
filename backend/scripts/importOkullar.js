const mysql = require('mysql2');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Database bağlantısı - config/database.js'deki ayarları kullanın
const db = mysql.createConnection({
  host: 'localhost',     // Kendi database ayarlarınızı yazın
  user: 'root',          // Kendi database ayarlarınızı yazın  
  password: '',  // Kendi database ayarlarınızı yazın
  database: 'dernek_system' // Kendi database adınızı yazın
});

// Excel dosyalarını import eden fonksiyon
async function importOkulExcel(filename, okulTuru) {
  try {
    const filePath = path.join(__dirname, '..', filename);
    
    console.log(`\n=== ${okulTuru.toUpperCase()} Import Başlıyor ===`);
    console.log(`Dosya: ${filePath}`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Dosya bulunamadı: ${filePath}`);
      return;
    }

    // Excel dosyasını oku - header satırını atla
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

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors = [];

    // Mevcut kayıtları kontrol et
    const existingQuery = 'SELECT COUNT(*) as count FROM okullar WHERE okul_turu = ?';
    const existingResult = await queryDatabase(existingQuery, [okulTuru]);
    console.log(`📊 Mevcut ${okulTuru} kayıt sayısı: ${existingResult[0].count}`);

    // Veri satırlarını işle (1. satırdan itibaren - 0. satır header)
    for (let i = 1; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        
        // Satır boşsa geç
        if (!row || row.length < 4) {
          continue;
        }

        // Excel kolonları (sırasıyla)
        // 0: SIRA NO, 1: IL ADI, 2: ILCE ADI, 3: KURUM KODU, 4: KURUM ADI, 5: ALT TUR (varsa), 6: ACILIS TARIHI (varsa)
        const siraNo = row[0];
        const ilAdi = row[1];
        const ilceAdi = row[2];
        const kurumKodu = row[3];
        const kurumAdi = row[4];

        // İlk satırı (header içeriğini) atla
        if (siraNo === 'SIRA NO' || siraNo === undefined || ilAdi === 'İL ADI' || ilAdi === 'IL ADI') {
          continue;
        }

        // Zorunlu alanları kontrol et
        if (!ilAdi || !kurumAdi) {
          errors.push(`Satır ${i + 1}: Eksik bilgi - İl: "${ilAdi}", Kurum: "${kurumAdi}"`);
          errorCount++;
          continue;
        }

        // Temizlik
        const cleanIlAdi = ilAdi.toString().trim().toUpperCase();
        const cleanIlceAdi = ilceAdi ? ilceAdi.toString().trim().toUpperCase() : null;
        const cleanKurumKodu = kurumKodu ? kurumKodu.toString().trim() : null;
        const cleanKurumAdi = kurumAdi.toString().trim();

        // Boş değerleri kontrol et
        if (cleanIlAdi === '' || cleanKurumAdi === '') {
          continue;
        }

        // Duplicate kontrolü
        const duplicateQuery = `
          SELECT COUNT(*) as count FROM okullar 
          WHERE okul_turu = ? AND (
            (kurum_kodu IS NOT NULL AND kurum_kodu = ?) OR
            (il_adi = ? AND COALESCE(ilce_adi, '') = COALESCE(?, '') AND kurum_adi = ?)
          )
        `;
        
        const duplicateResult = await queryDatabase(duplicateQuery, [
          okulTuru, cleanKurumKodu, cleanIlAdi, cleanIlceAdi, cleanKurumAdi
        ]);

        if (duplicateResult[0].count > 0) {
          duplicateCount++;
          continue;
        }

        // Insert
        const insertQuery = `
          INSERT INTO okullar (il_adi, ilce_adi, kurum_kodu, kurum_adi, okul_turu) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await queryDatabase(insertQuery, [
          cleanIlAdi, cleanIlceAdi, cleanKurumKodu, cleanKurumAdi, okulTuru
        ]);

        successCount++;

        // Progress
        if (successCount % 500 === 0) {
          console.log(`⏳ İşlenen: ${successCount}/${rawData.length - 1}`);
        }

      } catch (error) {
        console.error(`❌ Satır ${i + 1} hatası:`, error.message);
        errors.push(`Satır ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    // Sonuçları göster
    console.log(`\n✅ ${okulTuru.toUpperCase()} Import Tamamlandı!`);
    console.log(`📊 Toplam satır: ${rawData.length - 1}`);
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hata: ${errorCount}`);
    console.log(`🔄 Duplicate: ${duplicateCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ İlk 10 hata:`);
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
    }

  } catch (error) {
    console.error(`❌ ${okulTuru} import genel hatası:`, error);
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
    console.log('🚀 Okul Import İşlemi Başlıyor...');
    
    // Database bağlantısını test et
    await queryDatabase('SELECT 1');
    console.log('✅ Database bağlantısı başarılı');

    // Tabloyu kontrol et
    try {
      await queryDatabase('SELECT COUNT(*) FROM okullar');
      console.log('✅ Okullar tablosu mevcut');
    } catch (error) {
      console.error('❌ Okullar tablosu bulunamadı! Önce tabloyu oluşturun.');
      process.exit(1);
    }

    // İmport işlemlerini başlat
    await importOkulExcel('ortaokul.xlsx', 'ortaokul');
    await importOkulExcel('lise.xlsx', 'lise');

    // Final istatistikleri
    const finalStats = await queryDatabase(`
      SELECT 
        okul_turu, 
        COUNT(*) as sayi,
        COUNT(DISTINCT il_adi) as il_sayi
      FROM okullar 
      GROUP BY okul_turu
    `);

    console.log('\n📊 FINAL İSTATİSTİKLER:');
    finalStats.forEach(stat => {
      console.log(`${stat.okul_turu}: ${stat.sayi} okul, ${stat.il_sayi} il`);
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

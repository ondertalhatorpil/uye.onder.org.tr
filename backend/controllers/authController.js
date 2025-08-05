const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer konfigürasyonu - profil fotoğrafları için
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profile-images';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Dosya adı: user_id + timestamp + orijinal uzantı
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `user_${req.user.id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

const register = async (req, res) => {
  try {
    const {
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul,
      
      // EĞİTİM BİLGİLERİ - Yeni yapı (eski durumlar kaldırıldı)
      ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
      lise_id, lise_custom, lise_mezun_yili,
      universite_durumu, universite_adi, universite_bolum, universite_mezun_yili,
      
      // KVKK
      kvkk_onay, aydinlatma_metni_onay
    } = req.body;

    console.log('Backend Controller - Received data:', {
      universite_durumu,
      universite_adi,
      universite_bolum,
      universite_mezun_yili
    });

    // Basit validasyon
    if (!isim || !soyisim || !email || !password || !dogum_tarihi || !sektor || !meslek || !telefon || !il || !ilce || !gonullu_dernek || !calisma_komisyon) {
      return res.status(400).json({
        success: false,
        error: 'Zorunlu alanlar eksik'
      });
    }

    // KVKK onayları kontrolü
    if (!kvkk_onay || !aydinlatma_metni_onay) {
      return res.status(400).json({
        success: false,
        error: 'KVKK ve Aydınlatma Metni onayı zorunludur'
      });
    }

    // EĞİTİM BİLGİLERİ VALİDASYONU
    // Ortaokul validasyonu - Eğer ortaokul bilgisi verilmişse mezuniyet yılı gerekli
    if ((ortaokul_id || ortaokul_custom) && !ortaokul_mezun_yili) {
      return res.status(400).json({
        success: false,
        error: 'Ortaokul mezuniyet yılı gerekli'
      });
    }

    if (ortaokul_mezun_yili && !ortaokul_id && !ortaokul_custom) {
      return res.status(400).json({
        success: false,
        error: 'Ortaokul seçimi veya manuel giriş gerekli'
      });
    }

    // Lise validasyonu - Eğer lise bilgisi verilmişse mezuniyet yılı gerekli
    if ((lise_id || lise_custom) && !lise_mezun_yili) {
      return res.status(400).json({
        success: false,
        error: 'Lise mezuniyet yılı gerekli'
      });
    }

    if (lise_mezun_yili && !lise_id && !lise_custom) {
      return res.status(400).json({
        success: false,
        error: 'Lise seçimi veya manuel giriş gerekli'
      });
    }

    // Üniversite validasyonu
    if (universite_durumu && !['devam_ediyor', 'mezun', 'okumadi'].includes(universite_durumu)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz üniversite durumu'
      });
    }

    // Üniversite bilgilerinin validasyonu
    if (universite_durumu === 'mezun' || universite_durumu === 'devam_ediyor') {
      if (!universite_adi || !universite_adi.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Üniversite adı zorunlu'
        });
      }
      
      if (!universite_bolum || !universite_bolum.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Üniversite bölümü zorunlu'
        });
      }
      
      if (universite_durumu === 'mezun' && !universite_mezun_yili) {
        return res.status(400).json({
          success: false,
          error: 'Üniversite mezuniyet yılı zorunlu'
        });
      }
    }

    // Email kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Bu email zaten kayıtlı'
      });
    }

    // Seçilen okulların var olup olmadığını kontrol et
    if (ortaokul_id) {
      const ortaokulExists = await User.checkOkulExists(ortaokul_id, 'ortaokul');
      if (!ortaokulExists) {
        return res.status(400).json({
          success: false,
          error: 'Seçilen ortaokul bulunamadı'
        });
      }
    }

    if (lise_id) {
      const liseExists = await User.checkOkulExists(lise_id, 'lise');
      if (!liseExists) {
        return res.status(400).json({
          success: false,
          error: 'Seçilen lise bulunamadı'
        });
      }
    }

    // Kullanıcı oluştur - YENİ YAPIYLA (eski durumlar kaldırıldı)
    const userId = await User.create({
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul,
      
      // Eğitim bilgileri - Yeni yapı (durumlar otomatik belirlenecek)
      ortaokul_id, ortaokul_custom, ortaokul_mezun_yili,
      lise_id, lise_custom, lise_mezun_yili,
      
      // Üniversite bilgileri - Tam destekli
      universite_durumu: universite_durumu || 'okumadi',
      universite_adi: universite_adi || null,
      universite_bolum: universite_bolum || null,
      universite_mezun_yili: universite_mezun_yili || null,
      
      kvkk_onay, aydinlatma_metni_onay,
      
      // Profil fotoğrafı başlangıçta null
      profil_fotografi: null
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

const getKvkkTexts = async (req, res) => {
  try {
    const texts = {
      kvkk_metni: `VERİ SAHİBİNİN AÇIK RIZA BEYAN FORMU

6698 sayılı "Kişisel Verilerin Korunması Kanunu" gereğince, kişisel verilerimin, özel nitelikli kişisel verilerimin, iletişim bilgilerimin işlenmesine, tarafımca sözlü/yazılı ve/veya elektronik ortamda verilen kimliğimi ve iletişim bilgilerimi belirleyen veya belirlemeye yarayanlar da dahil olmak üzere her türlü kişisel verimin, ÖNDER İmam Hatipliler Derneği tarafından, mevzuata uygun faaliyetlerin yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi, internet sitesinin etkili ve kolay kullanımının sağlanması, düzenleyici kurumların taleplerinin yerine getirilmesi ve denetimlerin yapılması, telefon veya e-posta adresi üzerinden iletişim kurulması amacıyla; çevrimiçi ziyaretçi verilerinin işlenmesine, ilgili mevzuatlar kapsamında paylaşım gerektiren diğer üyeler ile paylaşılmasına; kişisel veriler ve iletişim bilgilerinin 6698 sayılı Kişisel Verilerin Korunması Kanunu'nda tanımlanan kapsamda aşağıda detayları verilen kişisel ve iletişim verilerinin işlenmesine muvafakat ettiğimi kabul, beyan ve taahhüt ederim.

• Kimliği belirli veya belirlenebilir bir gerçek kişiye ait olduğu açık olan; kısmen veya tamamen otomatik şekilde veya veri kayıt sisteminin bir parçası olarak otomatik olmayan şekilde işlenen; kişinin kimliğine dair bilgilerin bulunduğu verilerdir; ad, soyad, yaşadığı şehir ve doğum tarihi bilgisi

• Kimliği belirli veya belirlenebilir bir gerçek kişiye ait olduğu açık olan; kısmen veya tamamen otomatik şekilde veya veri kayıt sisteminin bir parçası olarak otomatik olmayan şekilde işlenen; kişinin iletişim bilgilerinin bulunduğu verilerdir; telefon numarası, e-posta adresi

• Kimliği belirli veya belirlenebilir bir gerçek kişiye ait olduğu açık olan; kısmen veya tamamen otomatik şekilde veya veri kayıt sisteminin bir parçası olarak otomatik olmayan şekilde işlenen; kullanıcının eğitim, meslek ve üyeliğine dair bilgilerin bulunduğu verilerdir; mesleki bilgiler, sektör, mezun olunan okullar, gönüllü olunan dernek bilgileri, dernek lokasyonu ve çalışma komisyonu bilgileri

• Kimliği belirli veya belirlenebilir bir gerçek kişiye ait olduğu açık olan; kısmen veya tamamen otomatik şekilde veya veri kayıt sisteminin bir parçası olarak otomatik olmayan şekilde işlenen; işlem güvenliğine dair bilgilerin bulunduğu verilerdir; internet sitesi ziyaretine ilişkin bağlantı(giriş)/çıkış tarih ve saati bilgisi, IP adresi

Kişisel verilerimin 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun "Kişisel verilerin yurt dışına aktarılması" başlıklı 9 uncu maddesinde yer alan hukuki düzenlemelere uygun olarak ÖNDER İmam Hatipliler Derneği ile anlaşmalı olan sunucularda saklanmasına muvafakat ettiğimi kabul, beyan ve taahhüt ederim.

6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerimin ve iletişim bilgilerimin ÖNDER İmam Hatipliler Derneği tarafından yasadaki esaslar çerçevesinde toplanmasına, kaydedilmesine, işlenmesine, saklanmasına ve diğer dernek üyeleri ve paydaşlar ile paylaşılmasına peşinen izin verdiğimi kabul, beyan ve taahhüt ederim.`,

      aydinlatma_metni: `Kişisel Verilerin Korunması ve İşlenmesi Hakkında Aydınlatma Metni

ÖNDER İmam Hatipliler Derneği, veri sorumlusu sıfatıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat kapsamında kişisel verilerinizin hukuka uygun olarak toplanması, saklanması ve paylaşılmasını sağlamak ve gizliliğinizi korumak amacıyla mümkün olan en üst seviyede güvenlik tedbirlerini almaktadır.

Bu kapsamda Aydınlatma Metninde, ÖNDER İmam Hatipliler Derneği olarak veri sorumlusu sıfatıyla işlemekte olduğumuz kişisel verilerinizin hangileri olduğu ve bu verilerin hangi amaçlarla işlendikleri başta olmak üzere verilerinizin paylaşıldığı üçüncü taraflara, haklarınıza ve bizimle iletişime geçebileceğiniz yöntemlere ilişkin bilgiler sunulmaktadır.

1. Veri Sorumlusunun Kimliği
Unvanı: ÖNDER İmam Hatipliler Derneği
İnternet Adresi: https://www.onder.org.tr
E-Posta Adresi: onder@onder.org.tr
Adresi: Akşemsettin Mh. Şair Fuzuli Sk. No: 22 Fatih – İSTANBUL

2. Kişisel Verilerin İşlenme Amaçları
KVKK'NIN 10. maddesi ve Tebliğ'in 5. maddesi kapsamında; KVKK'NIN 4. maddesinde belirtilen işleme şartlarına uygun olarak tedarik kapsamında elde edilen kişisel veriler şu amaçlarla işlenebilmektedir:
• Telefon veya e-posta adresi üzerinden iletişim kurulması
• Mevzuata uygun faaliyetlerin yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi
• İnternet sitesinin etkili ve kolay kullanımının sağlanması
• Çevrimiçi ziyaretçi verilerinin işlenmesi

3. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi
Kişisel verileriniz, tamamen veya kısmen otomatik olan yollarla, İnternet sitesini ziyaret etmeniz halinde, İnternet sitesi içerisinde bulunan çerezler ve kayıt formu aracılığıyla toplanmaktadır.

Bu yöntemle toplanan kişisel verileriniz 6698 sayılı Kanun'un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları kapsamında işlenebilmekte ve aktarılabilmektedir.

4. Kişisel Verilerin Aktarılması
Toplanan kişisel verileriniz;
• Hukuka uygunluk gereği düzenleyici kurumlar, mahkemeler ve resmi makamlara,
• Taleplerinizin yerine getirilmesi adına tarafınızca yetki verilmiş vekiller ve temsilcilere,
• Yazılım, bulut sistemleri ve e-posta altyapısı sağlayan yurtiçi ve yurtdışı hizmet sağlayıcılara,
• Sisteme kayıtlı diğer dernek üyelerimize
6698 sayılı Kanun'un 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir.

5. Kişisel Veri Sahibinin 6698 sayılı Kanun'un 11. Maddesinde Sayılan Hakları
Kişisel veri sahipleri olarak, haklarınıza ilişkin taleplerinizi Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun bir şekilde iletebilir. Aşağıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici gerekli bilgiler ile talep dilekçenizi bizzat elden teslim edebilir, noter kanalıyla veya Kişisel Verileri Koruma Kurulu tarafından belirlenen diğer yöntemler ile iletebilirsiniz. ÖNDER İmam Hatipliler Derneği'ne talebinizi iletmeniz durumunda ÖNDER İmam Hatipliler Derneği talebin niteliğine göre talebi en kısa sürede sonuçlandıracaktır.

Bu kapsamda kişisel veri sahipleri;
• Kişisel veri işlenip işlenmediğini öğrenme,
• Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
• Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
• Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,
• Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
• 6698 sayılı Kanun ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması halinde kişisel verilerin silinmesini veya yok edilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,
• Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme haklarına sahiptir.`
    };

    res.json({
      success: true,
      data: texts
    });
  } catch (error) {
    console.error('Get KVKK texts error:', error);
    res.status(500).json({
      success: false,
      error: 'KVKK metinleri getirilemedi: ' + error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ve şifre gerekli' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email veya şifre hatalı' 
      });
    }

    const isPasswordValid = await User.checkPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email veya şifre hatalı' 
      });
    }

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
    const userId = req.user.id; // auth middleware'den gelir
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce,
      gonullu_dernek, calisma_komisyon,
      
      // Eğitim bilgileri
      ortaokul_durumu, ortaokul_id, ortaokul_custom, ortaokul_mezun_yili, ortaokul_sinif,
      lise_durumu, lise_id, lise_custom, lise_mezun_yili, lise_sinif,
      universite_durumu
    } = req.body;

    // Eğer profil fotoğrafı yüklenmişse, dosya yolunu ekle
    let updateData = {
      isim, soyisim, dogum_tarihi, sektor, meslek, telefon, il, ilce,
      gonullu_dernek, calisma_komisyon,
      
      // Eğitim bilgileri - null değerler için default'lar
      ortaokul_durumu: ortaokul_durumu || 'okumadi',
      ortaokul_id: ortaokul_id || null,
      ortaokul_custom: ortaokul_custom || null,
      ortaokul_mezun_yili: ortaokul_mezun_yili || null,
      ortaokul_sinif: ortaokul_sinif || null,
      
      lise_durumu: lise_durumu || 'okumadi',
      lise_id: lise_id || null,
      lise_custom: lise_custom || null, 
      lise_mezun_yili: lise_mezun_yili || null,
      lise_sinif: lise_sinif || null,
      
      universite_durumu: universite_durumu || 'okumadi'
    };

    if (req.file) {
      // Eski profil fotoğrafını sil
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profil_fotografi) {
        const oldImagePath = path.join(__dirname, '../', oldUser.profil_fotografi);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      updateData.profil_fotografi = `uploads/profile-images/${req.file.filename}`;
    }

    // Basit validasyon
    if (!isim || !soyisim || !sektor || !meslek) {
      return res.status(400).json({
        success: false,
        error: 'İsim, soyisim, sektör ve meslek zorunlu'
      });
    }

    // EĞİTİM VALİDASYONLARI (register'daki gibi)
    if (ortaokul_durumu && !['mezun', 'devam_ediyor', 'okumadi'].includes(ortaokul_durumu)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz ortaokul durumu'
      });
    }

    if (ortaokul_durumu === 'mezun' && !ortaokul_mezun_yili) {
      return res.status(400).json({
        success: false,
        error: 'Ortaokul mezuniyet yılı gerekli'
      });
    }

    if (ortaokul_durumu === 'devam_ediyor' && (!ortaokul_sinif || ![5,6,7,8].includes(parseInt(ortaokul_sinif)))) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli ortaokul sınıfı seçin (5,6,7,8)'
      });
    }

    if (lise_durumu && !['mezun', 'devam_ediyor', 'okumadi'].includes(lise_durumu)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz lise durumu'
      });
    }

    if (lise_durumu === 'mezun' && !lise_mezun_yili) {
      return res.status(400).json({
        success: false,
        error: 'Lise mezuniyet yılı gerekli'
      });
    }

    if (lise_durumu === 'devam_ediyor' && (!lise_sinif || ![9,10,11,12].includes(parseInt(lise_sinif)))) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli lise sınıfı seçin (9,10,11,12)'
      });
    }

    // Seçilen okulları kontrol et
    if (ortaokul_id) {
      const ortaokulExists = await User.checkOkulExists(ortaokul_id, 'ortaokul');
      if (!ortaokulExists) {
        return res.status(400).json({
          success: false,
          error: 'Seçilen ortaokul bulunamadı'
        });
      }
    }

    if (lise_id) {
      const liseExists = await User.checkOkulExists(lise_id, 'lise');
      if (!liseExists) {
        return res.status(400).json({
          success: false,
          error: 'Seçilen lise bulunamadı'
        });
      }
    }

    // Profil güncelle
    const updated = await User.updateProfile(userId, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Güncellenmiş kullanıcı bilgilerini getir
    const updatedUser = await User.findById(userId);
    
    console.log('Updated user profil_fotografi:', updatedUser.profil_fotografi);
    console.log('File was uploaded:', !!req.file);
    console.log('Update data profil_fotografi:', updateData.profil_fotografi);

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Eğer hata oluştuysa ve dosya yüklenmişse, dosyayı sil
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/profile-images/', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Profil güncellenirken hata oluştu: ' + error.message
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Kullanıcının mevcut profil fotoğrafını al
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (!user.profil_fotografi) {
      return res.status(400).json({
        success: false,
        error: 'Silinecek profil fotoğrafı bulunamadı'
      });
    }

    // Dosyayı fiziksel olarak sil
    const imagePath = path.join(__dirname, '../', user.profil_fotografi);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Veritabanından profil fotoğrafı yolunu kaldır
    await User.updateProfile(userId, { profil_fotografi: null });

    res.json({
      success: true,
      message: 'Profil fotoğrafı başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      error: 'Profil fotoğrafı silinirken hata oluştu: ' + error.message
    });
  }
};

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

    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const isCurrentPasswordValid = await User.checkPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mevcut şifre yanlış'
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

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


const getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        show_email: Boolean(user.show_email),
        show_phone: Boolean(user.show_phone)
      }
    });

  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Gizlilik ayarları getirilemedi: ' + error.message
    });
  }
};

// Gizlilik ayarlarını güncelle
const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { show_email, show_phone } = req.body;

    // Validasyon
    if (show_email !== undefined && typeof show_email !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'show_email boolean değer olmalıdır'
      });
    }

    if (show_phone !== undefined && typeof show_phone !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'show_phone boolean değer olmalıdır'
      });
    }

    // En az bir ayar gönderilmiş olmalı
    if (show_email === undefined && show_phone === undefined) {
      return res.status(400).json({
        success: false,
        error: 'En az bir gizlilik ayarı belirtilmelidir'
      });
    }

    // Ayarları güncelle
    const updated = await User.updatePrivacySettings(userId, { show_email, show_phone });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı veya güncelleme başarısız'
      });
    }

    // Güncellenmiş ayarları getir
    const user = await User.findById(userId);

    res.json({
      success: true,
      message: 'Gizlilik ayarları başarıyla güncellendi',
      data: {
        show_email: Boolean(user.show_email),
        show_phone: Boolean(user.show_phone)
      }
    });

  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Gizlilik ayarları güncellenirken hata oluştu: ' + error.message
    });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  updateProfile,
  deleteProfileImage,
  getKvkkTexts,
  getPrivacySettings,     
  updatePrivacySettings,  
  upload 
};
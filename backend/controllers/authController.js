const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Kayıt ol
const register = async (req, res) => {
  try {
    const {
      isim, soyisim, email, password, dogum_tarihi,
      sektor, meslek, telefon, il, ilce, gonullu_dernek,
      calisma_komisyon, mezun_okul,
      kvkk_onay, aydinlatma_metni_onay // YENİ ALANLAR
    } = req.body;

    // Basit validasyon
    if (!isim || !soyisim || !email || !password || !dogum_tarihi || !sektor  || !meslek || !telefon || !il || !ilce || !gonullu_dernek || !calisma_komisyon || !mezun_okul ) {
      return res.status(400).json({ 
        success: false, 
        error: 'İsim, soyisim, email, doğum tarihi ve şifre zorunlu' 
      });
    }

    // KVKK onayları kontrolü
    if (!kvkk_onay || !aydinlatma_metni_onay) {
      return res.status(400).json({ 
        success: false, 
        error: 'KVKK ve Aydınlatma Metni onayı zorunludur' 
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
      calisma_komisyon, mezun_okul,
      kvkk_onay, aydinlatma_metni_onay
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
    const userId = req.user.id;
    const {
      isim, soyisim, dogum_tarihi, sektor, meslek,
      telefon, il, ilce, gonullu_dernek, calisma_komisyon, mezun_okul
    } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    if (req.body.email && req.body.email !== existingUser.email) {
      const emailExists = await User.findByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Bu email adresi zaten kullanılıyor'
        });
      }
    }

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

module.exports = { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  updateProfile,
  getKvkkTexts // YENİ ENDPOINT
};
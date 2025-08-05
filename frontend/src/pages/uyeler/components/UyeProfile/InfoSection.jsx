import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiUsers, FiHome, FiBook, FiEyeOff
} from 'react-icons/fi';

const InfoSection = ({ user, formatDateForDisplay }) => {
  // DEBUG: Kullanıcı verisini konsola yazdır
  console.log('InfoSection - User data:', user);
  console.log('InfoSection - Email visibility:', { 
    email: user.email, 
    show_email: user.show_email,
    isEmailPrivate: !user.email 
  });
  console.log('InfoSection - Phone visibility:', { 
    telefon: user.telefon, 
    show_phone: user.show_phone,
    isPhonePrivate: !user.telefon 
  });

  // Eğitim durumu belirleme fonksiyonu
  const getEducationStatus = (mezunYili, okulId, customOkul) => {
    if (mezunYili) return 'mezun';           // Mezuniyet yılı varsa mezun
    if (okulId || customOkul) return 'mezun'; // Okul seçilmişse mezun
    return 'okumadi';                        // Hiçbiri yoksa okumadı
  };

  // Eğitim durumu metinleri
  const getEducationStatusText = (status) => {
    switch (status) {
      case 'mezun': return 'Mezun';
      case 'devam_ediyor': return 'Devam Ediyor';
      case 'okumadi': return 'Okumadı';
      default: return 'Belirtilmemiş';
    }
  };

  // Okul adını getir (yeni DB yapısına uygun)
  const getSchoolName = (okulId, customName, schoolField) => {
    if (customName) return customName;
    if (user[schoolField]) return user[schoolField];
    if (okulId) return 'Okul ID: ' + okulId; // Fallback
    return 'Belirtilmemiş';
  };

  const EducationSection = ({ title, icon: Icon, iconColor, status, schoolName, graduationYear, currentClass, location }) => (
    <div className="p-4 sm:p-5 border border-gray-700 rounded-xl bg-gray-700">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${iconColor} flex items-center justify-center mr-2 sm:mr-3 text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-white text-base sm:text-lg">{title}</h4>
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Durum:</span>
          <span className="font-medium text-white">{getEducationStatusText(status)}</span>
        </div>
        
        {(status === 'mezun' || status === 'devam_ediyor') && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Okul:</span>
              <span className="font-medium text-white text-right flex-1 ml-2 break-words">{schoolName}</span>
            </div>
            
            {location && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Konum:</span>
                <span className="font-medium text-white">{location}</span>
              </div>
            )}
            
            {status === 'mezun' && graduationYear && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mezuniyet Yılı:</span>
                <span className="font-medium text-white">{graduationYear}</span>
              </div>
            )}
            
            {status === 'devam_ediyor' && currentClass && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sınıf:</span>
                <span className="font-medium text-white">{currentClass}. Sınıf</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // GİZLİLİK KONTROLÜ İÇİN InfoField COMPONENT'İ GÜNCELLENDİ
  const InfoField = ({ label, value, icon: Icon, isPrivate = false, privateReason = '' }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-xl border border-gray-600">
      <div className="flex items-center">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gray-600 flex items-center justify-center mr-2 sm:mr-3 shadow-sm">
          <Icon className="h-4 w-4 text-gray-300" />
        </div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      
      {isPrivate ? (
        <div className="flex items-center text-right">
          <div className="flex items-center text-gray-500 text-sm">
            <FiEyeOff className="h-4 w-4 mr-1" />
            <span>{privateReason}</span>
          </div>
        </div>
      ) : (
        <span className="text-sm font-semibold text-white text-right break-words max-w-[60%] sm:max-w-none">
          {value || 'Belirtilmemiş'}
        </span>
      )}
    </div>
  );

  // Dinamik durum belirleme
  const ortaokulStatus = getEducationStatus(user.ortaokul_mezun_yili, user.ortaokul_id, user.ortaokul_custom);
  const liseStatus = getEducationStatus(user.lise_mezun_yili, user.lise_id, user.lise_custom);
  const universiteStatus = user.universite_durumu || 'okumadi';

  // GİZLİLİK KONTROLÜ - E-posta ve telefon için
  const isEmailPrivate = !user.email; // Backend'den null geliyorsa gizli demektir
  const isPhonePrivate = !user.telefon; // Backend'den null geliyorsa gizli demektir

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {/* Kişisel Bilgiler */}
      <div className="space-y-6 sm:space-y-8">
        {/* Kişisel Bilgiler Card */}
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-800 flex items-center justify-center mr-2 sm:mr-3 text-white">
                <FiUser className="h-4 w-4" />
              </div>
              Kişisel Bilgiler
            </h3>
          </div>
          
          <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
            <InfoField
              label="Ad Soyad"
              value={`${user.isim} ${user.soyisim}`}
              icon={FiUser}
            />
            
            {/* E-POSTA GİZLİLİK KONTROLÜ */}
            <InfoField
              label="Email"
              value={user.email}
              icon={FiMail}
              isPrivate={isEmailPrivate}
              privateReason="Gizli"
            />
            
            {/* TELEFON GİZLİLİK KONTROLÜ */}
            <InfoField
              label="Telefon"
              value={user.telefon}
              icon={FiPhone}
              isPrivate={isPhonePrivate}
              privateReason="Gizli"
            />
            
            <InfoField
              label="Doğum Tarihi"
              value={formatDateForDisplay(user.dogum_tarihi)}
              icon={FiCalendar}
            />
            <InfoField
              label="Lokasyon"
              value={user.il && user.ilce ? `${user.il} / ${user.ilce}` : user.il}
              icon={FiMapPin}
            />
          </div>
        </div>

        {/* Mesleki Bilgiler Card */}
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-800 flex items-center justify-center mr-2 sm:mr-3 text-white">
                <FiBriefcase className="h-4 w-4" />
              </div>
              Mesleki Bilgiler
            </h3>
          </div>
          
          <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
            <InfoField
              label="Sektör"
              value={user.sektor}
              icon={FiBriefcase}
            />
            <InfoField
              label="Meslek"
              value={user.meslek}
              icon={FiBriefcase}
            />
            <InfoField
              label="Çalışma Komisyonu"
              value={user.calisma_komisyon}
              icon={FiUsers}
            />
            <InfoField
              label="Gönüllü Dernek"
              value={user.gonullu_dernek}
              icon={FiHome}
            />
          </div>
        </div>
      </div>

      {/* Eğitim Bilgileri */}
      <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-800 flex items-center justify-center mr-2 sm:mr-3 text-white">
              <FiBook className="h-4 w-4" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
          {/* Ortaokul */}
          <EducationSection
            title="Ortaokul"
            icon={FiBook}
            iconColor="bg-orange-800"
            status={ortaokulStatus}
            schoolName={getSchoolName(user.ortaokul_id, user.ortaokul_custom, 'ortaokul_adi')}
            graduationYear={user.ortaokul_mezun_yili}
            currentClass={user.ortaokul_sinif}
            location={user.ortaokul_il && user.ortaokul_ilce ? `${user.ortaokul_il} / ${user.ortaokul_ilce}` : user.ortaokul_il}
          />

          {/* Lise */}
          <EducationSection
            title="Lise"
            icon={FiBook}
            iconColor="bg-blue-800"
            status={liseStatus}
            schoolName={getSchoolName(user.lise_id, user.lise_custom, 'lise_adi')}
            graduationYear={user.lise_mezun_yili}
            currentClass={user.lise_sinif}
            location={user.lise_il && user.lise_ilce ? `${user.lise_il} / ${user.lise_ilce}` : user.lise_il}
          />

          <EducationSection
            title="Üniversite"
            icon={FiBook}
            iconColor="bg-green-800"
            status={universiteStatus}
            schoolName={user.universite_adi || 'Belirtilmemiş'}
            graduationYear={user.universite_mezun_yili}
            currentClass={user.universite_sinif}
            location={user.universite_il && user.universite_ilce ? `${user.universite_il} / ${user.universite_ilce}` : user.universite_il}
          />
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
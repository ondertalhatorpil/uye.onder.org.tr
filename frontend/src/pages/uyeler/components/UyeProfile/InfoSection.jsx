import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiUsers, FiHome, FiBook, FiEyeOff
} from 'react-icons/fi';

// *** YARDIMCI FONKSİYONLAR (DEĞİŞMEDİ) ***
const getEducationStatus = (mezunYili, okulId, customOkul) => {
  if (mezunYili) return 'mezun';
  if (okulId || customOkul) return 'mezun';
  return 'okumadi';
};

const getEducationStatusText = (status) => {
  switch (status) {
    case 'mezun': return 'Mezun';
    case 'devam_ediyor': return 'Devam Ediyor';
    case 'okumadi': return 'Okumadı';
    default: return 'Belirtilmemiş';
  }
};

const getSchoolName = (user, okulId, customName, schoolField) => { 
  if (customName) return customName;
  if (user[schoolField]) return user[schoolField]; // Artık user objesine erişebilir
  if (okulId) return 'Okul ID: ' + okulId;
  return 'Belirtilmemiş';
};

// --- GÜNCELLENMİŞ EDUCATION SECTION (DEĞİŞMEDİ) ---
const EducationSection = ({ title, icon: Icon, status, schoolName, graduationYear, currentClass, location }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center mb-3 pb-2 border-b border-gray-700/50"> 
      <div className={`h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-3 flex-shrink-0 text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="font-bold text-white text-base tracking-wide">{title}</h4>
    </div>
    <div className="space-y-1.5 text-sm"> 
      <p className={`font-semibold text-sm ${status === 'mezun' ? 'text-green-400' : 'text-orange-400'}`}>
        {getEducationStatusText(status)}
      </p>
      {(status === 'mezun' || status === 'devam_ediyor') && (
        <>
          <p className="text-white font-medium break-words leading-snug">{schoolName}</p>
          {status === 'mezun' && graduationYear && (
            <p className="text-gray-400">Mezuniyet Yılı: {graduationYear}</p>
          )}
          {status === 'devam_ediyor' && currentClass && (
            <p className="text-gray-400">{currentClass}. Sınıf</p>
          )}
          {location && (
            <p className="text-gray-400 italic pt-1">{location}</p> 
          )}
        </>
      )}
    </div>
  </div>
);

// --- YENİ MİNİMAL BİLEŞEN (LABEL'SIZ) ---
const MinimalInfoField = ({ value, icon: Icon, isPrivate = false }) => (
    // Ana Kapsayıcı: İkonu ve değeri ortalamak için
    <div className={`flex items-center py-2 px-3 rounded-lg transition-colors 
        ${isPrivate ? 'bg-gray-900 border border-gray-800' : 'bg-gray-850 border border-gray-700 hover:bg-gray-800'}`}>
      
      {/* SOL ALAN (İkon) */}
      <div className={`h-7 w-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 text-white mr-3`}>
        <Icon className="h-4 w-4" />
      </div>
      
      {/* SAĞ ALAN (Değer veya Gizli İfadesi) - Flex Grow ile geri kalan alanı kaplar */}
      <div className="flex-1 min-w-0">
          {isPrivate ? (
            // Gizli Durum
            <div className="flex items-center text-red-400 text-sm font-semibold">
              <FiEyeOff className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">Gizli Bilgi</span>
            </div>
          ) : (
            // Değer Durumu: Mobil için text-sm, büyük ekranlar için sm:text-base (Mobile First)
            <span className="text-xs sm:text-base font-bold text-white break-words">
              {value || 'Belirtilmemiş'}
            </span>
          )}
      </div>
    </div>
);


const InfoSection = ({ user, formatDateForDisplay }) => {
  // Dinamik durum belirleme
  const ortaokulStatus = getEducationStatus(user.ortaokul_mezun_yili, user.ortaokul_id, user.ortaokul_custom);
  const liseStatus = getEducationStatus(user.lise_mezun_yili, user.lise_id, user.lise_custom);
  const universiteStatus = user.universite_durumu || 'okumadi';

  // Gizlilik kontrolü
  const isEmailPrivate = user.email === null;
  const isPhonePrivate = user.telefon === null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Kişisel Bilgiler ve Mesleki Bilgiler Sol Kolon */}
      <div className="space-y-4">
        
        {/* Kişisel Bilgiler Card */}
        <div className="bg-gray-850 rounded-lg shadow-md border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900">
            <h3 className="text-base font-semibold text-white flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-2 text-white">
                <FiUser className="h-4 w-4" />
              </div>
              Kişisel Bilgiler
            </h3>
          </div>
          
          {/* MİNİMAL INFO FIELD KULLANIMI */}
          <div className="p-4 space-y-3">
            <MinimalInfoField value={`${user.isim} ${user.soyisim}`} icon={FiUser} />
            <MinimalInfoField value={user.email} icon={FiMail} isPrivate={isEmailPrivate} />
            <MinimalInfoField value={user.telefon} icon={FiPhone} isPrivate={isPhonePrivate} />
            <MinimalInfoField value={formatDateForDisplay(user.dogum_tarihi)} icon={FiCalendar} />
            <MinimalInfoField value={user.il && user.ilce ? `${user.il} / ${user.ilce}` : user.il} icon={FiMapPin} />
          </div>
        </div>

        {/* Mesleki Bilgiler Card */}
        <div className="bg-gray-850 rounded-lg shadow-md border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900">
            <h3 className="text-base font-semibold text-white flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-2 text-white">
                <FiBriefcase className="h-4 w-4" />
              </div>
              Mesleki Bilgiler
            </h3>
          </div>
          
          {/* MİNİMAL INFO FIELD KULLANIMI */}
          <div className="p-4 space-y-3">
            <MinimalInfoField value={user.sektor} icon={FiBriefcase} />
            <MinimalInfoField value={user.meslek} icon={FiBriefcase} />
            <MinimalInfoField value={user.calisma_komisyon} icon={FiUsers} />
            <MinimalInfoField value={user.gonullu_dernek} icon={FiHome} />
          </div>
        </div>
      </div>

      {/* Eğitim Bilgileri Kartı Sağ Kolon (EducationSection bileşeni label'sız olduğu için aynı kaldı) */}
      <div className="bg-gray-850 rounded-lg shadow-md border border-gray-800 overflow-hidden h-fit">
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <h3 className="text-base font-semibold text-white flex items-center">
            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center mr-2 text-white">
              <FiBook className="h-4 w-4" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Ortaokul */}
          <EducationSection
            title="Ortaokul"
            icon={FiBook}
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
            status={liseStatus}
            schoolName={getSchoolName(user.lise_id, user.lise_custom, 'lise_adi')}
            graduationYear={user.lise_mezun_yili}
            currentClass={user.lise_sinif}
            location={user.lise_il && user.lise_ilce ? `${user.lise_il} / ${user.lise_ilce}` : user.lise_il}
          />

          {/* Üniversite */}
          <EducationSection
            title="Üniversite"
            icon={FiBook}
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
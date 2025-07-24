import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiUsers, FiHome, FiBook
} from 'react-icons/fi';

const InfoSection = ({ user, formatDateForDisplay }) => {
  // Eğitim durumu metinleri
  const getEducationStatusText = (status) => {
    switch (status) {
      case 'mezun': return 'Mezun';
      case 'devam_ediyor': return 'Devam Ediyor';
      case 'okumadi': return 'Okumadı';
      default: return 'Belirtilmemiş';
    }
  };

  // Okul adını getir (seçili okul ya da custom)
  const getSchoolName = (schoolId, customName, schoolType) => {
    if (customName) return customName;
    if (schoolId && user[`${schoolType}_adi`]) return user[`${schoolType}_adi`];
    return 'Belirtilmemiş';
  };

  const EducationSection = ({ title, icon: Icon, iconColor, status, schoolName, graduationYear, currentClass, location }) => (
    <div className="p-4 sm:p-5 border border-gray-700 rounded-xl bg-gray-700"> {/* Padding, kenarlık, arka plan */}
      <div className="flex items-center mb-2 sm:mb-3"> {/* Mobil boşluk */}
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${iconColor} flex items-center justify-center mr-2 sm:mr-3 text-white`}> {/* Boyut, yuvarlatma, renk */}
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-white text-base sm:text-lg">{title}</h4> {/* Font boyutu ve rengi */}
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 text-sm"> {/* Mobil boşluk */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Durum:</span>
          <span className="font-medium text-white">{getEducationStatusText(status)}</span>
        </div>
        
        {(status === 'mezun' || status === 'devam_ediyor') && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Okul:</span>
              <span className="font-medium text-white text-right flex-1 ml-2 break-words">{schoolName}</span> {/* break-words eklendi */}
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

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-xl border border-gray-600"> {/* Padding, arka plan, kenarlık */}
      <div className="flex items-center">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gray-600 flex items-center justify-center mr-2 sm:mr-3 shadow-sm"> {/* Boyut, yuvarlatma, arka plan */}
          <Icon className="h-4 w-4 text-gray-300" /> {/* İkon rengi */}
        </div>
        <span className="text-sm font-medium text-gray-300">{label}</span> {/* Font boyutu ve rengi */}
      </div>
      <span className="text-sm font-semibold text-white text-right break-words max-w-[60%] sm:max-w-none">{value || 'Belirtilmemiş'}</span> {/* Font boyutu ve rengi, break-words, max-w */}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"> {/* Responsive grid ve boşluk */}
      {/* Kişisel Bilgiler */}
      <div className="space-y-6 sm:space-y-8"> {/* Mobil boşluk */}
        {/* Kişisel Bilgiler Card */}
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Arka plan, yuvarlatma, gölge, kenarlık */}
          <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700"> {/* Padding, kenarlık, arka plan */}
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Font boyutu ve rengi */}
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-800 flex items-center justify-center mr-2 sm:mr-3 text-white"> {/* Boyut, yuvarlatma, arka plan */}
                <FiUser className="h-4 w-4" />
              </div>
              Kişisel Bilgiler
            </h3>
          </div>
          
          <div className="p-5 sm:p-6 space-y-3 sm:space-y-4"> {/* Padding ve boşluk */}
            <InfoField
              label="Ad Soyad"
              value={`${user.isim} ${user.soyisim}`}
              icon={FiUser}
            />
            <InfoField
              label="Email"
              value={user.email}
              icon={FiMail}
            />
            <InfoField
              label="Telefon"
              value={user.telefon}
              icon={FiPhone}
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
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Arka plan, yuvarlatma, gölge, kenarlık */}
          <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700"> {/* Padding, kenarlık, arka plan */}
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Font boyutu ve rengi */}
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-800 flex items-center justify-center mr-2 sm:mr-3 text-white"> {/* Boyut, yuvarlatma, arka plan */}
                <FiBriefcase className="h-4 w-4" />
              </div>
              Mesleki Bilgiler
            </h3>
          </div>
          
          <div className="p-5 sm:p-6 space-y-3 sm:space-y-4"> {/* Padding ve boşluk */}
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
      <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Arka plan, yuvarlatma, gölge, kenarlık */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700"> {/* Padding, kenarlık, arka plan */}
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Font boyutu ve rengi */}
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-800 flex items-center justify-center mr-2 sm:mr-3 text-white"> {/* Boyut, yuvarlatma, arka plan */}
              <FiBook className="h-4 w-4" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-5 sm:p-6 space-y-3 sm:space-y-4"> {/* Padding ve boşluk */}
          {/* Ortaokul */}
          <EducationSection
            title="Ortaokul"
            icon={FiBook}
            iconColor="bg-orange-800" // Renk güncellendi
            status={user.ortaokul_durumu}
            schoolName={getSchoolName(user.ortaokul_id, user.ortaokul_custom, 'ortaokul')}
            graduationYear={user.ortaokul_mezun_yili}
            currentClass={user.ortaokul_sinif}
            location={user.ortaokul_il && user.ortaokul_ilce ? `${user.ortaokul_il} / ${user.ortaokul_ilce}` : user.ortaokul_il}
          />

          {/* Lise */}
          <EducationSection
            title="Lise"
            icon={FiBook}
            iconColor="bg-blue-800" // Renk güncellendi
            status={user.lise_durumu}
            schoolName={getSchoolName(user.lise_id, user.lise_custom, 'lise')}
            graduationYear={user.lise_mezun_yili}
            currentClass={user.lise_sinif}
            location={user.lise_il && user.lise_ilce ? `${user.lise_il} / ${user.lise_ilce}` : user.lise_il}
          />

          {/* Üniversite */}
          <EducationSection
            title="Üniversite"
            icon={FiBook}
            iconColor="bg-green-800" // Renk güncellendi
            status={user.universite_durumu}
            schoolName="Üniversite bilgisi eklenmedi" // Buraya gerçek veriyi çekmeniz gerekebilir
            location=""
          />
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
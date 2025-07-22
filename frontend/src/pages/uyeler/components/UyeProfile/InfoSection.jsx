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
    <div className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50/50 to-white">
      <div className="flex items-center mb-3">
        <div className={`h-8 w-8 rounded-lg ${iconColor} flex items-center justify-center mr-3`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Durum:</span>
          <span className="font-medium text-gray-900">{getEducationStatusText(status)}</span>
        </div>
        
        {(status === 'mezun' || status === 'devam_ediyor') && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Okul:</span>
              <span className="font-medium text-gray-900 text-right flex-1 ml-2">{schoolName}</span>
            </div>
            
            {location && (
              <div className="flex justify-between">
                <span className="text-gray-600">Konum:</span>
                <span className="font-medium text-gray-900">{location}</span>
              </div>
            )}
            
            {status === 'mezun' && graduationYear && (
              <div className="flex justify-between">
                <span className="text-gray-600">Mezuniyet Yılı:</span>
                <span className="font-medium text-gray-900">{graduationYear}</span>
              </div>
            )}
            
            {status === 'devam_ediyor' && currentClass && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sınıf:</span>
                <span className="font-medium text-gray-900">{currentClass}. Sınıf</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-sm">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value || 'Belirtilmemiş'}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kişisel Bilgiler */}
      <div className="space-y-6">
        {/* Kişisel Bilgiler Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <FiUser className="h-4 w-4 text-red-600" />
              </div>
              Kişisel Bilgiler
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiBriefcase className="h-4 w-4 text-blue-600" />
              </div>
              Mesleki Bilgiler
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
              <FiBook className="h-4 w-4 text-purple-600" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Ortaokul */}
          <EducationSection
            title="Ortaokul"
            icon={FiBook}
            iconColor="bg-orange-100 text-orange-600"
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
            iconColor="bg-blue-100 text-blue-600"
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
            iconColor="bg-green-100 text-green-600"
            status={user.universite_durumu}
            schoolName="Üniversite bilgisi eklenmedi"
            location=""
          />
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
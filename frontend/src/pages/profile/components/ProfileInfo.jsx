import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiUsers, FiHome, FiBook, FiLock
} from 'react-icons/fi';

const ProfileInfo = ({ user, formData, isEditing, options, onChange }) => {
  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  // Okul adını getir (seçili okul ya da custom)
  const getSchoolName = (schoolId, customName, schoolType) => {
    if (customName) return customName;
    if (schoolId && user[`${schoolType}_adi`]) return user[`${schoolType}_adi`];
    return 'Belirtilmemiş';
  };

  const InputField = ({ label, name, type = "text", icon: Icon, value, placeholder, readOnly = false, options = null }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {readOnly && <span className="ml-2 text-xs text-gray-400">(Değiştirilemez)</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
        </div>
        {isEditing && !readOnly ? (
          options ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900 font-medium"
            >
              <option value="">{placeholder}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={type === 'date' ? formatDateForInput(value) : value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900 font-medium placeholder-gray-400"
            />
          )
        ) : (
          <div className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-xl bg-gray-50/50 text-gray-900 font-medium flex items-center">
            {type === 'date' ? formatDateForDisplay(value) : (value || 'Belirtilmemiş')}
            {readOnly && <FiLock className="ml-auto h-4 w-4 text-gray-400" />}
          </div>
        )}
      </div>
    </div>
  );

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

  return (
    <div className="space-y-6">
      {/* Kişisel Bilgiler */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
              <FiUser className="h-4 w-4 text-red-600" />
            </div>
            Kişisel Bilgiler
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="İsim"
              name="isim"
              icon={FiUser}
              value={formData.isim}
              placeholder="İsminizi giriniz"
            />

            <InputField
              label="Soyisim"
              name="soyisim"
              icon={FiUser}
              value={formData.soyisim}
              placeholder="Soyisminizi giriniz"
            />

            <InputField
              label="Email Adresi"
              name="email"
              type="email"
              icon={FiMail}
              value={user.email}
              readOnly={true}
            />

            <InputField
              label="Telefon Numarası"
              name="telefon"
              type="tel"
              icon={FiPhone}
              value={formData.telefon}
              placeholder="05xxxxxxxxx"
            />

            <InputField
              label="Doğum Tarihi"
              name="dogum_tarihi"
              type="date"
              icon={FiCalendar}
              value={formData.dogum_tarihi}
            />

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasyon</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <div className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-xl bg-gray-50/50 text-gray-900 font-medium">
                  {user.il}{user.ilce && `, ${user.ilce}`} || 'Belirtilmemiş'
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eğitim Bilgileri */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
              <FiBook className="h-4 w-4 text-purple-600" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {/* Mesleki Bilgiler */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <FiBriefcase className="h-4 w-4 text-blue-600" />
            </div>
            Mesleki Bilgiler
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Sektör"
              name="sektor"
              icon={FiBriefcase}
              value={formData.sektor}
              placeholder="Sektör seçiniz"
              options={options.sektorler}
            />

            <InputField
              label="Meslek"
              name="meslek"
              icon={FiBriefcase}
              value={formData.meslek}
              placeholder="Mesleğinizi giriniz"
            />

            <InputField
              label="Mezun Olunan Okul (Eski)"
              name="mezun_okul"
              icon={FiBook}
              value={formData.mezun_okul}
              placeholder="Mezun olduğunuz okulu giriniz"
            />

            <InputField
              label="Çalışma Komisyonu"
              name="calisma_komisyon"
              icon={FiUsers}
              value={formData.calisma_komisyon}
              placeholder="Komisyon seçiniz"
              options={options.komisyonlar}
            />
          </div>
        </div>
      </div>

      {/* Dernek Bilgileri */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
              <FiHome className="h-4 w-4 text-green-600" />
            </div>
            Dernek Bilgileri
          </h3>
        </div>
        
        <div className="p-6">
          <InputField
            label="Gönüllü Olunan Dernek"
            name="gonullu_dernek"
            icon={FiHome}
            value={user.gonullu_dernek}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
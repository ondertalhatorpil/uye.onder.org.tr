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
    if (isNaN(date.getTime())) {
        return '';
    }
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih';
    }
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // YENİ: Eğitim durumunu dinamik olarak belirle
  const getEducationStatus = (mezunYili, okulId, customOkul) => {
    // Mezuniyet yılı varsa mezun
    if (mezunYili) return 'mezun';
    // Okul seçilmiş ama mezuniyet yılı yoksa (teorik olarak olmamalı)
    if (okulId || customOkul) return 'mezun';
    // Hiçbiri yoksa okumadı
    return 'okumadi';
  };

  // Eğitim durumu metinleri
  const getEducationStatusText = (status) => {
    switch (status) {
      case 'mezun': return 'Mezun';
      case 'devam_ediyor': return 'Devam Ediyor';
      case 'okumadi': return 'Okumadım';
      default: return 'Belirtilmemiş';
    }
  };

  // YENİ: Okul adını getir (ortaokul/lise için)
  const getSchoolName = (okulId, customOkulName, okulAdiField) => {
    // Custom okul adı varsa onu kullan
    if (customOkulName) return customOkulName;
    // ID'ye bağlı okul adı varsa onu kullan
    if (okulId && user[okulAdiField]) return user[okulAdiField];
    return 'Belirtilmemiş';
  };

  // YENİ: Üniversite adını getir (direkt alan)
  const getUniversityInfo = () => {
    if (user.universite_durumu === 'okumadi') return 'Okumadım';
    if (user.universite_adi) {
      let info = user.universite_adi;
      if (user.universite_bolum) {
        info += ` - ${user.universite_bolum}`;
      }
      return info;
    }
    return 'Belirtilmemiş';
  };

  const InputField = ({ label, name, type = "text", icon: Icon, value, placeholder, readOnly = false, options = null, disabled = false }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
        {readOnly && <span className="ml-2 text-xs text-gray-500">(Değiştirilemez)</span>}
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
              disabled={disabled}
              className={`w-full pl-11 pr-4 py-3.5 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-700 text-white font-medium ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`} 
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
              className="w-full pl-11 pr-4 py-3.5 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-700 text-white font-medium placeholder-gray-500" 
            />
          )
        ) : (
          <div className="w-full pl-11 pr-4 py-3.5 border border-gray-700 rounded-xl bg-gray-700 text-gray-300 font-medium flex items-center">
            {type === 'date' ? formatDateForDisplay(value) : (value || 'Belirtilmemiş')}
            {readOnly && <FiLock className="ml-auto h-4 w-4 text-gray-500" />}
          </div>
        )}
      </div>
    </div>
  );

  const EducationSection = ({ title, icon: Icon, iconColor, status, schoolName, graduationYear, location, bölüm }) => (
    <div className="p-4 border border-gray-700 rounded-xl bg-gray-800 shadow-md">
      <div className="flex items-center mb-3">
        <div className={`h-8 w-8 rounded-lg ${iconColor} flex items-center justify-center mr-3`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-gray-200">{title}</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Durum:</span>
          <span className="font-medium text-gray-300">{getEducationStatusText(status)}</span>
        </div>
        
        {status === 'mezun' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Okul:</span>
              <span className="font-medium text-gray-300 text-right flex-1 ml-2 break-words">{schoolName}</span>
            </div>
            
            {bölüm && (
              <div className="flex justify-between">
                <span className="text-gray-400">Bölüm:</span>
                <span className="font-medium text-gray-300 text-right flex-1 ml-2 break-words">{bölüm}</span>
              </div>
            )}
            
            {location && (
              <div className="flex justify-between">
                <span className="text-gray-400">Konum:</span>
                <span className="font-medium text-gray-300">{location}</span>
              </div>
            )}
            
            {graduationYear && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mezuniyet Yılı:</span>
                <span className="font-medium text-gray-300">{graduationYear}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const ortaokulStatus = getEducationStatus(user.ortaokul_mezun_yili, user.ortaokul_id, user.ortaokul_custom);
  const liseStatus = getEducationStatus(user.lise_mezun_yili, user.lise_id, user.lise_custom);

  return (
    <div className="space-y-6">
      {/* Kişisel Bilgiler */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-700 flex items-center justify-center mr-3">
              <FiUser className="h-4 w-4 text-white" />
            </div>
            Kişisel Bilgiler
          </h3>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <InputField
              label="İsim"
              name="isim"
              icon={FiUser}
              value={formData.isim}
              placeholder="İsminizi giriniz"
              onChange={onChange}
            />

            <InputField
              label="Soyisim"
              name="soyisim"
              icon={FiUser}
              value={formData.soyisim}
              placeholder="Soyisminizi giriniz"
              onChange={onChange}
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
              onChange={onChange}
            />

            <InputField
              label="Doğum Tarihi"
              name="dogum_tarihi"
              type="date"
              icon={FiCalendar}
              value={formData.dogum_tarihi}
              onChange={onChange}
            />

            <InputField
              label="İl"
              name="il"
              icon={FiMapPin}
              value={formData.il}
              placeholder="İl seçiniz"
              options={options.iller}
              onChange={onChange}
            />

            <InputField
              label="İlçe"
              name="ilce"
              icon={FiMapPin}
              value={formData.ilce}
              placeholder="İlçe seçiniz"
              options={options.ilceler}
              onChange={onChange}
              disabled={!formData.il || options.ilceler.length === 0}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-700 flex items-center justify-center mr-3">
              <FiBook className="h-4 w-4 text-white" />
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <EducationSection
              title="Ortaokul"
              icon={FiBook}
              iconColor="bg-orange-700"
              status={ortaokulStatus}
              schoolName={getSchoolName(user.ortaokul_id, user.ortaokul_custom, 'ortaokul_adi')}
              graduationYear={user.ortaokul_mezun_yili}
              location={user.ortaokul_il && user.ortaokul_ilce ? `${user.ortaokul_il} / ${user.ortaokul_ilce}` : user.ortaokul_il}
            />

            <EducationSection
              title="Lise"
              icon={FiBook}
              iconColor="bg-blue-700"
              status={liseStatus}
              schoolName={getSchoolName(user.lise_id, user.lise_custom, 'lise_adi')}
              graduationYear={user.lise_mezun_yili}
              location={user.lise_il && user.lise_ilce ? `${user.lise_il} / ${user.lise_ilce}` : user.lise_il}
            />

            <EducationSection
              title="Üniversite"
              icon={FiBook}
              iconColor="bg-green-700"
              status={user.universite_durumu || 'okumadi'}
              schoolName={user.universite_adi || 'Belirtilmemiş'}
              bölüm={user.universite_bolum}
              graduationYear={user.universite_mezun_yili}
            />
          </div>
        </div>
      </div>

      {/* Mesleki Bilgiler */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-700 flex items-center justify-center mr-3">
              <FiBriefcase className="h-4 w-4 text-white" />
            </div>
            Mesleki Bilgiler
          </h3>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <InputField
              label="Sektör"
              name="sektor"
              icon={FiBriefcase}
              value={formData.sektor}
              placeholder="Sektör seçiniz"
              options={options.sektorler}
              onChange={onChange}
            />

            <InputField
              label="Meslek"
              name="meslek"
              icon={FiBriefcase}
              value={formData.meslek}
              placeholder="Mesleğinizi giriniz"
              onChange={onChange}
            />

            <InputField
              label="Çalışma Komisyonu"
              name="calisma_komisyon"
              icon={FiUsers}
              value={formData.calisma_komisyon}
              placeholder="Komisyon seçiniz"
              options={options.komisyonlar}
              onChange={onChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-green-700 flex items-center justify-center mr-3">
              <FiHome className="h-4 w-4 text-white" />
            </div>
            Dernek Bilgileri
          </h3>
        </div>
        
        <div className="p-4 sm:p-6">
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
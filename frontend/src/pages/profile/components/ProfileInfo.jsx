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
    // Ensure the date is valid before formatting
    if (isNaN(date.getTime())) {
        return ''; // Return empty string for invalid dates
    }
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih'; // Handle invalid dates for display
    }
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
  // Bu fonksiyona user.mezun_okul gibi merkezi bir alan yerine
  // ilgili okul türünün (ortaokul_adi, lise_adi) geçirilmesi daha doğru olur.
  // Ancak current user object'deki yapıyı koruyarak bir tahmin yapıyorum.
  const getSchoolName = (userSchoolId, userCustomSchoolName, userSchoolNameField) => {
    // Eğer custom okul adı varsa onu kullan
    if (userCustomSchoolName) return userCustomSchoolName;
    // Eğer ID'ye bağlı bir okul adı field'ı varsa onu kullan
    if (userSchoolId && user[userSchoolNameField]) return user[userSchoolNameField];
    return 'Belirtilmemiş';
  };

  const InputField = ({ label, name, type = "text", icon: Icon, value, placeholder, readOnly = false, options = null, disabled = false }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-300 mb-2"> {/* Metin rengi */}
        {label}
        {readOnly && <span className="ml-2 text-xs text-gray-500">(Değiştirilemez)</span>} {/* Metin rengi */}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" /> {/* İkon rengi */}
        </div>
        {isEditing && !readOnly ? (
          options ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled} // Disabled prop'unu select'e ekle
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
          <div className="w-full pl-11 pr-4 py-3.5 border border-gray-700 rounded-xl bg-gray-700 text-gray-300 font-medium flex items-center"> {/* Koyu tema stilleri */}
            {type === 'date' ? formatDateForDisplay(value) : (value || 'Belirtilmemiş')}
            {readOnly && <FiLock className="ml-auto h-4 w-4 text-gray-500" />} {/* İkon rengi */}
          </div>
        )}
      </div>
    </div>
  );

  const EducationSection = ({ title, icon: Icon, iconColor, status, schoolName, graduationYear, currentClass, location }) => (
    <div className="p-4 border border-gray-700 rounded-xl bg-gray-800 shadow-md"> {/* Koyu tema arka planı ve kenarlık */}
      <div className="flex items-center mb-3">
        <div className={`h-8 w-8 rounded-lg ${iconColor} flex items-center justify-center mr-3`}>
          <Icon className="h-4 w-4 text-white" /> {/* İkon rengi (içindeki ikonlar beyaz olsun) */}
        </div>
        <h4 className="font-semibold text-gray-200">{title}</h4> {/* Metin rengi */}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Durum:</span> {/* Metin rengi */}
          <span className="font-medium text-gray-300">{getEducationStatusText(status)}</span> {/* Metin rengi */}
        </div>
        
        {(status === 'mezun' || status === 'devam_ediyor') && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Okul:</span> {/* Metin rengi */}
              <span className="font-medium text-gray-300 text-right flex-1 ml-2 break-words">{schoolName}</span> {/* Metin rengi ve kelime kırma */}
            </div>
            
            {location && (
              <div className="flex justify-between">
                <span className="text-gray-400">Konum:</span> {/* Metin rengi */}
                <span className="font-medium text-gray-300">{location}</span> {/* Metin rengi */}
              </div>
            )}
            
            {status === 'mezun' && graduationYear && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mezuniyet Yılı:</span> {/* Metin rengi */}
                <span className="font-medium text-gray-300">{graduationYear}</span> {/* Metin rengi */}
              </div>
            )}
            
            {status === 'devam_ediyor' && currentClass && (
              <div className="flex justify-between">
                <span className="text-gray-400">Sınıf:</span> {/* Metin rengi */}
                <span className="font-medium text-gray-300">{currentClass}. Sınıf</span> {/* Metin rengi */}
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
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu tema arka planı */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700"> {/* Responsive padding, kenarlık rengi */}
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Metin rengi ve boyutu */}
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-700 flex items-center justify-center mr-3"> {/* Koyu kırmızı arka plan */}
              <FiUser className="h-4 w-4 text-white" /> {/* İkon rengi */}
            </div>
            Kişisel Bilgiler
          </h3>
        </div>
        
        <div className="p-4 sm:p-6"> {/* Responsive padding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
            <InputField
              label="İsim"
              name="isim"
              icon={FiUser}
              value={formData.isim}
              placeholder="İsminizi giriniz"
              onChange={onChange} // onChange prop'unu ekle
            />

            <InputField
              label="Soyisim"
              name="soyisim"
              icon={FiUser}
              value={formData.soyisim}
              placeholder="Soyisminizi giriniz"
              onChange={onChange} // onChange prop'unu ekle
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
              onChange={onChange} // onChange prop'unu ekle
            />

            <InputField
              label="Doğum Tarihi"
              name="dogum_tarihi"
              type="date"
              icon={FiCalendar}
              value={formData.dogum_tarihi}
              onChange={onChange} // onChange prop'unu ekle
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
              disabled={!formData.il || options.ilceler.length === 0} // İl seçilmeden ilçe pasif
            />
          </div>
        </div>
      </div>

      {/* Eğitim Bilgileri */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu tema arka planı */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700"> {/* Responsive padding, kenarlık rengi */}
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Metin rengi ve boyutu */}
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-700 flex items-center justify-center mr-3"> {/* Koyu mor arka plan */}
              <FiBook className="h-4 w-4 text-white" /> {/* İkon rengi */}
            </div>
            Eğitim Bilgileri
          </h3>
        </div>
        
        <div className="p-4 sm:p-6"> {/* Responsive padding */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
            {/* Ortaokul */}
            <EducationSection
              title="Ortaokul"
              icon={FiBook}
              iconColor="bg-orange-700" // Koyu turuncu
              status={user.ortaokul_durumu}
              schoolName={getSchoolName(user.ortaokul_id, user.ortaokul_custom, 'ortaokul_adi')}
              graduationYear={user.ortaokul_mezun_yili}
              currentClass={user.ortaokul_sinif}
              location={user.ortaokul_il && user.ortaokul_ilce ? `${user.ortaokul_il} / ${user.ortaokul_ilce}` : user.ortaokul_il}
            />

            {/* Lise */}
            <EducationSection
              title="Lise"
              icon={FiBook}
              iconColor="bg-blue-700" // Koyu mavi
              status={user.lise_durumu}
              schoolName={getSchoolName(user.lise_id, user.lise_custom, 'lise_adi')}
              graduationYear={user.lise_mezun_yili}
              currentClass={user.lise_sinif}
              location={user.lise_il && user.lise_ilce ? `${user.lise_il} / ${user.lise_ilce}` : user.lise_il}
            />

            {/* Üniversite */}
            <EducationSection
              title="Üniversite"
              icon={FiBook}
              iconColor="bg-green-700" // Koyu yeşil
              status={user.universite_durumu}
              schoolName={getSchoolName(user.universite_id, user.universite_custom, 'universite_adi')} // Üniversite bilgisi eklendi
              graduationYear={user.universite_mezun_yili}
              currentClass={user.universite_sinif}
              location={user.universite_il && user.universite_ilce ? `${user.universite_il} / ${user.universite_ilce}` : user.universite_il}
            />
          </div>
        </div>
      </div>

      {/* Mesleki Bilgiler */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu tema arka planı */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700"> {/* Responsive padding, kenarlık rengi */}
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Metin rengi ve boyutu */}
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-700 flex items-center justify-center mr-3"> {/* Koyu mavi arka plan */}
              <FiBriefcase className="h-4 w-4 text-white" /> {/* İkon rengi */}
            </div>
            Mesleki Bilgiler
          </h3>
        </div>
        
        <div className="p-4 sm:p-6"> {/* Responsive padding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
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
              label="Mezun Olunan Okul (Eski)" // Bu alan user.mezun_okul'dan geliyor, ancak yukarıdaki detaylı eğitim bilgileriyle çakışıyor gibi duruyor. API'de bu alanın rolünü netleştirmek gerekebilir. Şimdilik bıraktım.
              name="mezun_okul"
              icon={FiBook}
              value={formData.mezun_okul}
              placeholder="Mezun olduğunuz okulu giriniz"
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

      {/* Dernek Bilgileri */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu tema arka planı */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700"> {/* Responsive padding, kenarlık rengi */}
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Metin rengi ve boyutu */}
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-green-700 flex items-center justify-center mr-3"> {/* Koyu yeşil arka plan */}
              <FiHome className="h-4 w-4 text-white" /> {/* İkon rengi */}
            </div>
            Dernek Bilgileri
          </h3>
        </div>
        
        <div className="p-4 sm:p-6"> {/* Responsive padding */}
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
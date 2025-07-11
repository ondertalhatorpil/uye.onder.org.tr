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
              label="Mezun Olunan Okul"
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
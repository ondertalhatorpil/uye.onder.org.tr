import React from 'react';
import { FiEdit3, FiSave, FiX, FiCamera } from 'react-icons/fi';

const ProfileHeader = ({ user, isEditing, loading, onEdit, onSave, onCancel }) => {
  // Varsayılan avatar URL'sini temaya uygun ve daha dinamik hale getirelim
  // user.isim ve user.soyisim boşsa 'U' kullanılıyor.
  const userAvatar = user.profil_fotografi || `https://ui-avatars.com/api/?name=${user.isim || 'U'}+${user.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden p-4 sm:p-6 lg:p-8"> {/* Koyu tema arka planı, yuvarlatma, gölge, kenarlık ve responsive padding */}
      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"> {/* Responsive düzen ve boşluk */}
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto"> {/* Mobil: dikey, sm: yatay */}
          <div className="relative mb-4 sm:mb-0 mx-auto sm:mx-0"> {/* Avatarı mobilde ortala */}
            <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-gray-700 p-1 shadow-lg border-2 border-red-600"> {/* Arka planı koyu gri, kenarlık rengi ve boyutu */}
              <img
                src={userAvatar}
                alt={`${user.isim} ${user.soyisim}`}
                className="h-full w-full rounded-full object-cover" // object-cover resmi kırpmadan doldurur
              />
            </div>
            {/* Kamera butonu - kaldırabiliriz ya da stilini değiştirebiliriz */}
            <button 
                className="absolute bottom-1 right-1 p-2 bg-gray-700 rounded-full shadow-md border border-gray-600 hover:bg-gray-600 transition-colors z-10"
                title="Profil fotoğrafını değiştir" // Fare üzerine gelince bilgi göster
            >
              <FiCamera className="h-4 w-4 text-gray-300" /> {/* İkon boyutu ve rengi */}
            </button>
          </div>
          
          <div className="sm:ml-6 text-center sm:text-left mt-3 sm:mt-0"> {/* Responsive margin ve metin hizalama */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1"> {/* Metin rengi ve boyutu */}
              {user.isim} {user.soyisim}
            </h1>
            <p className="text-gray-400 font-medium text-sm sm:text-base"> {/* Metin rengi ve boyutu */}
              {user.meslek || 'Meslek belirtilmemiş'}
            </p>
            <div className="flex items-center justify-center sm:justify-start mt-2"> {/* Mobil ortalama, sm: sola hizalama */}
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
              <p className="text-sm text-red-400 font-medium"> {/* Metin rengi */}
                {user.gonullu_dernek || 'Dernek belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto"> {/* Responsive düzen, hizalama ve boşluk */}
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-gray-600 rounded-xl text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm"
              >
                <FiX className="mr-2 h-4 w-4" />
                İptal
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg" 
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]" 
            >
              <FiEdit3 className="mr-2 h-4 w-4" />
              Profili Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700"> {/* Üst boşluk, üst kenarlık ve kenarlık rengi */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white"> {/* Metin rengi ve boyutu */}
              {user.created_at ? 
                Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
                : '0'
              }
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Günlük Üye</div> {/* Metin rengi ve boyutu */}
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white"> {/* Metin rengi ve boyutu */}
              {user.il || 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Şehir</div> {/* Metin rengi ve boyutu */}
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white"> {/* Metin rengi ve boyutu */}
              {user.sektor ? (user.sektor.length > 15 ? user.sektor.substring(0, 12) + '...' : user.sektor) : 'N/A'} {/* Uzun sektör isimleri için kısaltma */}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Sektör</div> {/* Metin rengi ve boyutu */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
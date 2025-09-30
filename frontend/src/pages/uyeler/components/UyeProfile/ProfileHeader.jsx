import React from 'react';
import { FiPhone, FiMapPin, FiMail, FiArrowLeft, FiInfo } from 'react-icons/fi'; // FiInfo korunmuştur
import { UPLOADS_BASE_URL } from '../../../../services'; 

const ProfileHeader = ({ user, onBack, onContact, onMessage, onInfoClick, ProfileAvatar }) => {
  // Profil avatarı için URL oluşturma
  const getUserAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-uyesi-avatars/${avatarPath}`;
  };

  return (
    // mt-6 (margin-top) değeri daha küçük ekranlarda daha az olabilir, sm:mt-6 kullandık.
    <div className=" rounded-2xl sm:rounded-3xl shadow-xl  mt-4 sm:mt-6 pt-2 overflow-hidden relative">
      
      {/* Kapak Fotoğrafı veya Renkli Başlık Bölümü */}
      {/* h-20 (mobil) / sm:h-28 (masaüstü) */}
      <div className="h-20 sm:h-28 bg-gradient-to-r from-red-600/30 to-red-900/30 rounded-t-2xl sm:rounded-t-3xl border-b border-gray-800 relative">
        
        {/* Geri Git Butonu - Mobil ekranlarda biraz daha küçük ve az kenarlı olabilir */}
        <button
          onClick={onBack}
          className="absolute top-3 left-3 p-2 sm:p-3 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-full transition-colors duration-200 shadow-lg z-10"
          aria-label="Geri"
        >
          <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        {/* Detaylı Bilgiler Butonu (FiInfo) - Mobil ekranlarda biraz daha küçük */}
        <button
          onClick={onInfoClick}
          className="absolute top-3 right-3 p-2 sm:p-3 bg-red-700/80 hover:bg-red-700 text-white rounded-full transition-colors duration-200 shadow-lg z-10"
          aria-label="Detaylı Bilgiler"
        >
          <FiInfo className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Ana Profil Kartı */}
      {/* Avatarın taşma payı için -mt-12 (mobil) / sm:-mt-16 (masaüstü) */}
      <div className="flex flex-col items-center -mt-12 sm:-mt-16 px-4 sm:px-6 pb-4 sm:pb-6">

        {/* Avatar Alanı */}
        {/* Avatar boyutu h-24 w-24 (mobil) / sm:h-32 sm:w-32 (masaüstü) */}
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-gray-850 bg-gray-900 shadow-2xl overflow-hidden mb-3 sm:mb-4">
          {user.avatar ? (
            <img
              src={getUserAvatarUrl(user.avatar)}
              alt={`${user.isim} ${user.soyisim}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <ProfileAvatar user={user} size="full" />
          )}
        </div>

        {/* Kullanıcı Bilgileri */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-0.5 leading-tight">
            {user.isim} {user.soyisim}
          </h1>
          <p className="text-gray-400 font-medium flex flex-col sm:flex-row items-center justify-center text-sm sm:text-base">
            <span className="text-gray-300 mr-2">{user.meslek || 'Meslek belirtilmemiş'}</span>
            {user.gonullu_dernek && (
              <span className="text-red-400 font-bold">{user.gonullu_dernek}</span>
            )}
          </p>
          <div className="flex items-center justify-center mt-1 sm:mt-2 text-sm text-gray-400">
            <FiMapPin className="mr-2 h-4 w-4 text-green-400" />
            <span className="text-gray-300">{user.il}{user.ilce && `, ${user.ilce}`}</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-sm sm:max-w-none justify-center">
          {user.telefon && (
            <a
              href={`tel:${user.telefon}`}
              onClick={(e) => { e.preventDefault(); onContact(); }}
              // px-5 py-2.5 (mobil) / sm:px-6 sm:py-3 (masaüstü)
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-green-700 text-green-100 text-sm font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
              <FiPhone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Ara
            </a>
          )}
          <button
            onClick={onMessage}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gray-700 text-gray-200 text-sm font-bold rounded-full shadow-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
          >
            <FiMail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Mesaj Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
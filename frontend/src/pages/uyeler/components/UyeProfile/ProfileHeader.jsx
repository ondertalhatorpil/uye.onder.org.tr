import React from 'react';
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services'; // UPLOADS_BASE_URL'i ekleyin

const ProfileHeader = ({ user, onBack, onContact, onMessage, ProfileAvatar }) => {
  // Profil avatarı için URL oluşturma
  const getUserAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-uyesi-avatars/${avatarPath}`;
  };

  return (
    <div className="bg-gray-850 rounded-3xl shadow-xl border border-gray-800 mt-6 pt-2 overflow-hidden relative">

      {/* Kapak Fotoğrafı veya Renkli Başlık Bölümü */}
      <div className="h-28 bg-gradient-to-r from-red-600/30 to-red-900/30 rounded-t-3xl border-b border-gray-800"></div>

      {/* Ana Profil Kartı */}
      <div className="flex flex-col items-center -mt-16 px-6 pb-6">

        {/* Avatar Alanı */}
        <div className="relative h-32 w-32 rounded-full border-4 border-gray-850 bg-gray-900 shadow-2xl overflow-hidden mb-4">
          {user.avatar ? (
            <img
              src={getUserAvatarUrl(user.avatar)}
              alt={`${user.isim} ${user.soyisim}`}
              className="w-full h-full object-cover"
              // Hata durumunda ProfileAvatar bileşenini kullanabiliriz, ancak bu bir resim olduğu için bir placeholder daha mantıklı.
              // Gerekirse bu kısımda fallback logic ekleyebilirsiniz.
            />
          ) : (
            <ProfileAvatar user={user} size="full" /> // Size'ı 'full' olarak ayarlayarak container'a sığmasını sağlarız
          )}
        </div>

        {/* Kullanıcı Bilgileri */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1 leading-tight">
            {user.isim} {user.soyisim}
          </h1>
          <p className="text-gray-400 font-medium flex items-center justify-center text-sm sm:text-base">
            <span className="text-gray-300 mr-2">{user.meslek || 'Meslek belirtilmemiş'}</span>
            {user.gonullu_dernek && (
              <span className="text-red-400 font-bold">{user.gonullu_dernek}</span>
            )}
          </p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
            <FiMapPin className="mr-2 h-4 w-4 text-green-400" />
            <span className="text-gray-300">{user.il}{user.ilce && `, ${user.ilce}`}</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full justify-center">
          {user.telefon && (
            <a
              href={`tel:${user.telefon}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-700 text-green-100 font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
              <FiPhone className="mr-2 h-5 w-5" />
              Ara
            </a>
          )}
          <a
            href={`mailto:${user.email}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-gray-200 font-bold rounded-full shadow-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
          >
            <FiMail className="mr-2 h-5 w-5" />
            E-posta Gönder
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
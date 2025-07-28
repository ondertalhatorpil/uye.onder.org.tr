import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiMapPin, FiPlus,
  FiMaximize2, FiClock, FiMoreHorizontal, FiHeart,
  FiMessageCircle, FiShare, FiBookmark
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

// Profil Avatar Bileşeni
const ProfileAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  // Debug log
  console.log('ProfileAvatar Debug:', {
    user: user,
    profil_fotografi: user?.profil_fotografi,
    isim: user?.isim,
    soyisim: user?.soyisim
  });

  // Profil fotoğrafı URL'ini oluştur
  const getAvatarUrl = () => {
    if (user?.profil_fotografi) {
      let imageUrl;
      
      // Backend'den gelen tam URL mı kontrol et
      if (user.profil_fotografi.startsWith('http')) {
        imageUrl = user.profil_fotografi;
      } else {
        // Development vs Production URL belirleme
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isDevelopment 
          ? 'http://localhost:3001' // Backend'inizin local port'u
          : UPLOADS_BASE_URL || 'https://uye.onder.org.tr';
        
        // Eğer profil_fotografi zaten "uploads/" ile başlıyorsa, tekrar ekleme
        if (user.profil_fotografi.startsWith('uploads/')) {
          imageUrl = `${baseUrl}/${user.profil_fotografi}`;
        } else {
          imageUrl = `${baseUrl}/uploads/profile-images/${user.profil_fotografi}`;
        }
      }
      
      console.log('Generated avatar URL:', imageUrl);
      return imageUrl;
    }
    
    // Varsayılan avatar
    const defaultUrl = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
    console.log('Using default avatar:', defaultUrl);
    return defaultUrl;
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image load error for:', e.target.src);
            // Hata durumunda varsayılan avatar'a geç
            e.target.style.display = 'none';
            e.target.nextSibling?.remove(); // Eğer zaten bir span varsa kaldır
            const span = document.createElement('span');
            span.className = `${textSizeClasses[size]} font-bold text-white`;
            span.textContent = user?.isim?.charAt(0)?.toUpperCase() || 'U';
            e.target.parentNode.appendChild(span);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', getAvatarUrl());
          }}
        />
      ) : (
        <span className={`${textSizeClasses[size]} font-bold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

// Görsel Büyütme Modalı Bileşeni
const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full lg:max-w-6xl lg:max-h-full">
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
          alt="Büyük görsel"
          className="max-w-full max-h-full object-contain rounded-lg sm:rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Twitter Style Görsel Grid Bileşeni
const TwitterImageGrid = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  const imageArray = Array.isArray(images)
    ? images
    : (typeof images === 'string' ? JSON.parse(images || '[]') : []);

  if (imageArray.length === 0) return null;

  // Tek görsel - Twitter benzeri tam genişlik
  const renderSingleImage = () => (
    <div
      className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer group border border-gray-600"
      style={{ aspectRatio: '16/9' }}
      onClick={() => onImageClick(imageArray[0])}
    >
      <img
        src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
        alt="Faaliyet görseli"
        className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/800x450/374151/9ca3af?text=Görsel+Yüklenemedi';
        }}
      />
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
    </div>
  );

  // İki görsel - Twitter benzeri yan yana
  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      {imageArray.slice(0, 2).map((image, index) => (
        <div
          key={index}
          className="relative group cursor-pointer aspect-square overflow-hidden"
          onClick={() => onImageClick(image)}
        >
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </div>
      ))}
    </div>
  );

  // Üç görsel - Twitter benzeri layout
  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      <div
        className="relative group cursor-pointer row-span-2 aspect-square overflow-hidden"
        onClick={() => onImageClick(imageArray[0])}
      >
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
          alt="Ana görsel"
          className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Ana+Görsel';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
      </div>
      <div className="grid grid-rows-2 gap-0.5">
        {imageArray.slice(1, 3).map((image, index) => (
          <div
            key={index + 1}
            className="relative group cursor-pointer aspect-square overflow-hidden"
            onClick={() => onImageClick(image)}
          >
            <img
              src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
              alt={`Görsel ${index + 2}`}
              className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
              }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </div>
        ))}
      </div>
    </div>
  );

  // Dört görsel - Twitter benzeri grid (veya daha fazlası için son kutu)
  const renderFourImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      {imageArray.slice(0, 3).map((image, index) => (
        <div
          key={index}
          className={`relative group cursor-pointer overflow-hidden ${
            index === 0 ? 'row-span-2 aspect-square' : 'aspect-square'
          }`}
          onClick={() => onImageClick(image)}
        >
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </div>
      ))}
      {imageArray.length > 3 && (
        <div
          className="relative group cursor-pointer overflow-hidden aspect-square"
          onClick={() => onImageClick(imageArray[3])}
        >
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[3]}`}
            alt="Daha fazla"
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Daha+Fazla';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white font-bold text-lg sm:text-xl mb-1">+{imageArray.length - 3}</div>
              <div className="text-white/90 text-xs sm:text-sm font-medium">daha fazla</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Görsel sayısına göre layout seçimi
  if (imageArray.length === 1) return renderSingleImage();
  if (imageArray.length === 2) return renderTwoImages();
  if (imageArray.length === 3) return renderThreeImages();
  if (imageArray.length >= 4) return renderFourImages();
  return null;
};

// Twitter Style Faaliyet Kartı
const TwitterActivityCard = ({ faaliyet }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <article className="border-b border-gray-800 transition-colors duration-200 cursor-pointer">
        <div className="flex p-3 sm:p-4">
          {/* Sol taraf - Avatar (Profil Fotoğrafı ile) */}
          <div className="flex-shrink-0 mr-3">
            <ProfileAvatar 
              user={{
                isim: faaliyet.isim,
                soyisim: faaliyet.soyisim,
                profil_fotografi: faaliyet.profil_fotografi
              }} 
              size="md" 
            />
          </div>

          {/* Sağ taraf - İçerik */}
          <div className="flex-1 min-w-0">
            {/* Header - İsim, kullanıcı adı, zaman */}
            <div className="flex items-center mb-1">
              <h3 className="font-bold text-white text-base sm:text-lg mr-1 hover:underline">
                {faaliyet.isim} {faaliyet.soyisim}
              </h3>

              <span className="text-gray-500 text-sm sm:text-base mr-1">·</span>
              <span className="text-gray-500 text-sm sm:text-base hover:underline">{formatTimeAgo(faaliyet.created_at)}</span>

              {/* Sağ tarafta menü butonu */}
              <div className="ml-auto">
                <button className="p-1 sm:p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors">
                  <FiMoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Alt etiketler - Dernek ve konum */}
            <div className="flex flex-wrap items-center mb-2 sm:mb-3">
              {faaliyet.gonullu_dernek && (
  <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-red-900 text-red-200 rounded-full mr-2 mb-1">
    📸 {faaliyet.gonullu_dernek.length > 35 
         ? faaliyet.gonullu_dernek.substring(0, 35) + '...' 
         : faaliyet.gonullu_dernek}
  </span>
)}

              {faaliyet.il && (
                <span className="text-red-500 text-xs sm:text-sm font-medium mb-1">
                  🇹🇷 #{faaliyet.il?.replace(/\s+/g, '')}{faaliyet.ilce && faaliyet.ilce.replace(/\s+/g, '')}
                </span>
              )}
            </div>

            {/* Ana içerik - Açıklama */}
            {faaliyet.aciklama && (
              <div className="mb-2 sm:mb-3">
                <p className="text-white text-sm sm:text-[15px] leading-4 sm:leading-5 break-words">
                  {faaliyet.aciklama}
                </p>
              </div>
            )}

            {/* Görseller */}
            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
              <div className="mb-2 sm:mb-3">
                <TwitterImageGrid
                  images={faaliyet.gorseller}
                  onImageClick={openImageModal}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Görsel Modalı */}
      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={closeImageModal}
      />
    </>
  );
};

// Twitter Style Boş Durum
const TwitterEmptyState = () => (
  <div className="text-center py-8 sm:py-16 px-4 min-h-[calc(100vh-100px)] flex flex-col justify-center">
    <div className="relative mb-4 sm:mb-6">
      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-900 flex items-center justify-center mx-auto">
        <FiActivity className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" />
      </div>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Henüz faaliyet yok</h3>
    <p className="text-gray-500 mb-4 sm:mb-6 text-base sm:text-lg max-w-xs sm:max-w-sm mx-auto">
      İlk faaliyeti paylaş ve topluluğu canlandır!
    </p>
    <Link
      to="/faaliyetler/create"
      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors text-sm sm:text-base"
    >
      <FiPlus className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
      İlk Faaliyeti Paylaş
    </Link>
  </div>
);

// Twitter Style Yükleme Durumu
const TwitterLoadingState = () => (
  <div className="bg-[#121212]">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border-b border-gray-800 p-3 sm:p-4">
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-800 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2 sm:mb-3">
              <div className="h-3 w-20 sm:h-4 sm:w-24 bg-gray-800 rounded animate-pulse mr-2"></div>
              <div className="h-3 w-12 sm:h-4 sm:w-16 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
              <div className="h-3 w-full bg-gray-800 rounded animate-pulse"></div>
              <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="h-36 sm:h-48 w-full bg-gray-800 rounded-lg sm:rounded-2xl animate-pulse mb-2 sm:mb-3"></div>
            <div className="flex justify-between max-w-xs sm:max-w-md">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-800 rounded-full animate-pulse"></div> 
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Ana Twitter Style Bileşen
const TwitterStyleActivities = ({ faaliyetler, loading }) => {
  return (
    <div className="max-w-2xl mx-auto min-h-screen">
      {/* Twitter Header */}
      <div className="sticky top-0 bg-opacity-80 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <h1 className="text-lg sm:text-xl font-bold text-white">Anasayfa</h1>
          <Link
            to="/faaliyetler"
            className="text-red-600 hover:text-red-300 font-medium text-sm sm:text-base"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>

      {/* Tweet Listesi */}
      <div>
        {loading ? (
          <TwitterLoadingState />
        ) : faaliyetler.length > 0 ? (
          faaliyetler.map((faaliyet) => (
            <TwitterActivityCard key={faaliyet.id} faaliyet={faaliyet} />
          ))
        ) : (
          <TwitterEmptyState />
        )}
      </div>
    </div>
  );
};

export default TwitterStyleActivities;
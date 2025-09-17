import React, { useState } from 'react';
import {
  FiCalendar, FiMapPin, FiMoreHorizontal, FiImage,
  FiMessageCircle, FiShare, FiHeart, FiBookmark,
  FiMaximize2
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

// Görsel URL'i oluşturma fonksiyonu
const getImageUrl = (imageName) => {
  if (!imageName) return null;
  
  // Eğer tam URL ise direkt kullan
  if (imageName.startsWith('http')) {
    return imageName;
  }
  
  // UPLOADS_BASE_URL'i kullan (production'da https://uye.onder.org.tr, development'ta localhost)
  const imageUrl = `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageName}`;
  
  console.log('Generated image URL:', imageUrl);
  return imageUrl;
};

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

  // Profil fotoğrafı URL'ini oluştur
  const getAvatarUrl = () => {
    if (user?.profil_fotografi) {
      let imageUrl;
      
      // Backend'den gelen tam URL mı kontrol et
      if (user.profil_fotografi.startsWith('http')) {
        imageUrl = user.profil_fotografi;
      } else {
        // Eğer profil_fotografi zaten "uploads/" ile başlıyorsa, tekrar ekleme
        if (user.profil_fotografi.startsWith('uploads/')) {
          imageUrl = `${UPLOADS_BASE_URL}/${user.profil_fotografi}`;
        } else {
          imageUrl = `${UPLOADS_BASE_URL}/uploads/profile-images/${user.profil_fotografi}`;
        }
      }
      
      return imageUrl;
    }
    
    // Varsayılan avatar
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hata durumunda varsayılan avatar'a geç
            e.target.style.display = 'none';
            e.target.nextSibling?.remove();
            const span = document.createElement('span');
            span.className = `${textSizeClasses[size]} font-bold text-white`;
            span.textContent = user?.isim?.charAt(0)?.toUpperCase() || 'U';
            e.target.parentNode.appendChild(span);
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

// Görsel Modal Bileşeni
const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full lg:max-w-6xl lg:max-h-full">
        <img
          src={image}
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

// Twitter Style Görsel Grid
const TwitterImageGrid = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  // Tek görsel - Twitter benzeri tam genişlik
  const renderSingleImage = () => (
    <div
      className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer group border border-gray-600"
      style={{ aspectRatio: '16/9' }}
      onClick={() => onImageClick(getImageUrl(images[0]))}
    >
      <img
        src={getImageUrl(images[0])}
        alt="Faaliyet görseli"
        className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
        onError={(e) => {
          console.error('Single image failed to load:', e.target.src);
          e.target.src = 'https://via.placeholder.com/800x450/374151/9ca3af?text=Görsel+Yüklenemedi';
        }}
      />
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <FiMaximize2 className="h-5 w-5 text-gray-800" />
        </div>
      </div>
    </div>
  );

  // İki görsel - Twitter benzeri yan yana
  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      {images.slice(0, 2).map((image, index) => (
        <div
          key={index}
          className="relative group cursor-pointer aspect-square overflow-hidden"
          onClick={() => onImageClick(getImageUrl(image))}
        >
          <img
            src={getImageUrl(image)}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              console.error(`Two images - Image ${index + 1} failed to load:`, e.target.src);
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <FiMaximize2 className="h-4 w-4 text-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Üç görsel - Twitter benzeri layout
  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      <div
        className="relative group cursor-pointer row-span-2 aspect-square overflow-hidden"
        onClick={() => onImageClick(getImageUrl(images[0]))}
      >
        <img
          src={getImageUrl(images[0])}
          alt="Ana görsel"
          className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
          onError={(e) => {
            console.error('Three images - Main image failed to load:', e.target.src);
            e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Ana+Görsel';
          }}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <FiMaximize2 className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-0.5">
        {images.slice(1, 3).map((image, index) => (
          <div
            key={index + 1}
            className="relative group cursor-pointer aspect-square overflow-hidden"
            onClick={() => onImageClick(getImageUrl(image))}
          >
            <img
              src={getImageUrl(image)}
              alt={`Görsel ${index + 2}`}
              className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
              onError={(e) => {
                console.error(`Three images - Image ${index + 2} failed to load:`, e.target.src);
                e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
              }}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <FiMaximize2 className="h-4 w-4 text-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Dört ve daha fazla görsel - Twitter benzeri grid
  const renderMultipleImages = () => (
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      {images.slice(0, 3).map((image, index) => (
        <div
          key={index}
          className={`relative group cursor-pointer overflow-hidden ${
            index === 0 ? 'row-span-2 aspect-square' : 'aspect-square'
          }`}
          onClick={() => onImageClick(getImageUrl(image))}
        >
          <img
            src={getImageUrl(image)}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              console.error(`Multiple images - Image ${index + 1} failed to load:`, e.target.src);
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <FiMaximize2 className="h-4 w-4 text-gray-800" />
            </div>
          </div>
        </div>
      ))}
      {images.length > 3 && (
        <div
          className="relative group cursor-pointer overflow-hidden aspect-square"
          onClick={() => onImageClick(getImageUrl(images[3]))}
        >
          <img
            src={getImageUrl(images[3])}
            alt="Daha fazla"
            className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
            onError={(e) => {
              console.error('Multiple images - Additional image failed to load:', e.target.src);
              e.target.src = 'https://via.placeholder.com/400x400/374151/9ca3af?text=Daha+Fazla';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white font-bold text-lg sm:text-xl mb-1">+{images.length - 3}</div>
              <div className="text-white/90 text-xs sm:text-sm font-medium">daha fazla</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Görsel sayısına göre layout seçimi
  if (images.length === 1) return renderSingleImage();
  if (images.length === 2) return renderTwoImages();
  if (images.length === 3) return renderThreeImages();
  return renderMultipleImages();
};

// Ana Twitter Style Faaliyet Kartı
const TwitterFaaliyetCard = ({ faaliyet }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Tarih formatla
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <article className="border-b border-gray-800 transition-colors duration-200">
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
              <h3 className="font-bold text-white text-base sm:text-lg mr-1 hover:underline cursor-pointer">
                {faaliyet.isim} {faaliyet.soyisim}
              </h3>

              <span className="text-gray-500 text-sm sm:text-base mr-1">·</span>
              <span className="text-gray-500 text-sm sm:text-base hover:underline cursor-pointer">
                {formatTimeAgo(faaliyet.created_at)}
              </span>

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
                <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-[#FA2C37] text-red-200 rounded-full mr-2 mb-1">
                  📸 {faaliyet.gonullu_dernek.length > 35 
                       ? faaliyet.gonullu_dernek.substring(0, 35) + '...' 
                       : faaliyet.gonullu_dernek}
                </span>
              )}

              {faaliyet.il && (
                <span className="text-[#FA2C37] text-xs sm:text-sm font-medium mb-1">
                  🇹🇷 #{faaliyet.il?.replace(/\s+/g, '')}{faaliyet.ilce && faaliyet.ilce.replace(/\s+/g, '')}
                </span>
              )}
            </div>

            {/* Ana içerik - Başlık ve Açıklama */}
            {faaliyet.baslik && (
              <div className="mb-2 sm:mb-3">
                <h2 className="text-white text-base sm:text-lg font-semibold leading-5 sm:leading-6">
                  {faaliyet.baslik}
                </h2>
              </div>
            )}

            {faaliyet.aciklama && (
              <div className="mb-2 sm:mb-3">
                <p className="text-white text-sm sm:text-[15px] leading-4 sm:leading-5 whitespace-pre-wrap">
                  {faaliyet.aciklama}
                </p>
              </div>
            )}

            {/* Görseller */}
            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
              <div className="mb-2 sm:mb-3">
                <TwitterImageGrid
                  images={faaliyet.gorseller}
                  onImageClick={handleImageClick}
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

export default TwitterFaaliyetCard;
import React, { useState } from 'react';
import {
  FiCalendar, FiMapPin, FiMoreHorizontal, FiImage,
  FiMessageCircle, FiShare, FiHeart, FiBookmark,
  FiChevronLeft, FiChevronRight
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

// Instagram Style Image Carousel (Modal olmadan)
const InstagramImageCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600">
      {/* Ana görsel container */}
      <div 
        className="relative w-full bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Görsel */}
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`Görsel ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onImageClick && onImageClick(getImageUrl(images[currentIndex]))}
          onError={(e) => {
            console.error(`Image ${currentIndex + 1} failed to load:`, e.target.src);
            e.target.src = 'https://via.placeholder.com/800x450/374151/9ca3af?text=Görsel+Yüklenemedi';
          }}
        />

        {/* Sol ok - sadece desktop'ta göster */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm z-10 hidden sm:block"
            aria-label="Önceki görsel"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Sağ ok - sadece desktop'ta göster */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm z-10 hidden sm:block"
            aria-label="Sonraki görsel"
          >
            <FiChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Görsel sayısı göstergesi - sağ üst köşe */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm backdrop-blur-sm z-10">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Nokta göstergeleri - sadece birden fazla görsel varsa göster */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                }`}
                aria-label={`${index + 1}. görsele git`}
              />
            ))}
          </div>
        )}

        {/* Touch/Swipe desteği için overlay */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex pointer-events-none">
            {/* Sol yarı - önceki görsel */}
            <div 
              className="w-1/2 h-full cursor-pointer pointer-events-auto"
              onClick={prevImage}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const handleTouchEnd = (endEvent) => {
                  const endX = endEvent.changedTouches[0].clientX;
                  const diff = startX - endX;
                  
                  if (Math.abs(diff) > 50) { // Minimum swipe mesafesi
                    if (diff > 0) {
                      nextImage(); // Sola kaydır -> sonraki
                    } else {
                      prevImage(); // Sağa kaydır -> önceki
                    }
                  }
                  
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                
                document.addEventListener('touchend', handleTouchEnd);
              }}
            />
            
            {/* Sağ yarı - sonraki görsel */}
            <div 
              className="w-1/2 h-full cursor-pointer pointer-events-auto"
              onClick={nextImage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Ana Twitter Style Faaliyet Kartı
const TwitterFaaliyetCard = ({ faaliyet }) => {
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
    // İsteğe bağlı: görsel tıklandığında yapılacak işlem
    console.log('Görsel tıklandı:', imageUrl);
    // Burada modal açabilir veya başka bir işlem yapabilirsiniz
  };

  return (
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
                📸 {faaliyet.gonullu_dernek.length > 30 
                     ? faaliyet.gonullu_dernek.substring(0, 30) + '...' 
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

          {/* Görseller - Instagram Style Carousel */}
          {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <InstagramImageCarousel
                images={faaliyet.gorseller}
                onImageClick={handleImageClick}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default TwitterFaaliyetCard;
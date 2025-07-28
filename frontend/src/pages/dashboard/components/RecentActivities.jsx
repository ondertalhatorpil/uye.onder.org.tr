import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiMapPin, FiPlus,
  FiMaximize2, FiClock, FiMoreHorizontal, FiHeart,
  FiMessageCircle, FiShare, FiBookmark
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

// Görsel Büyütme Modalı Bileşeni
const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full lg:max-w-6xl lg:max-h-full"> {/* Mobil için tam genişlik, büyük ekranlar için max-w-6xl */}
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
      className="relative w-full rounded-lg sm:rounded-2xl overflow-hidden cursor-pointer group border border-gray-600" // Mobil için rounded-lg, büyük için sm:rounded-2xl
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
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600"> {/* Mobil için rounded-lg, büyük için sm:rounded-2xl */}
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
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600"> {/* Mobil için rounded-lg, büyük için sm:rounded-2xl */}
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
    <div className="grid grid-cols-2 gap-0.5 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-600"> {/* Mobil için rounded-lg, büyük için sm:rounded-2xl */}
      {imageArray.slice(0, 3).map((image, index) => ( // İlk 3 görseli göster
        <div
          key={index}
          className={`relative group cursor-pointer overflow-hidden ${
            index === 0 ? 'row-span-2 aspect-square' : 'aspect-square' // İlk görseli daha büyük yap
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
      {imageArray.length > 3 && ( // 4 veya daha fazla görsel varsa son kutuyu göster
        <div
          className="relative group cursor-pointer overflow-hidden aspect-square"
          onClick={() => onImageClick(imageArray[3])} // Dördüncü görsele tıkla veya tüm galeri açılabilir
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
              <div className="text-white font-bold text-lg sm:text-xl mb-1">+{imageArray.length - 3}</div> {/* Daha küçük font boyutu mobil için */}
              <div className="text-white/90 text-xs sm:text-sm font-medium">daha fazla</div> {/* Daha küçük font boyutu mobil için */}
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
  if (imageArray.length >= 4) return renderFourImages(); // 4 veya daha fazla görsel için bu fonksiyonu kullan
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
      <article className="border-b border-gray-800 transition-colors duration-200 cursor-pointer"> {/* Arka plan rengi değişti */}
        <div className="flex p-3 sm:p-4"> {/* Padding mobil ve masaüstü için */}
          {/* Sol taraf - Avatar */}
          <div className="flex-shrink-0 mr-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"> {/* Avatar boyutu mobil ve masaüstü için */}
              <span className="text-base sm:text-lg font-bold text-white"> {/* Font boyutu mobil ve masaüstü için */}
                {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Sağ taraf - İçerik */}
          <div className="flex-1 min-w-0">
            {/* Header - İsim, kullanıcı adı, zaman */}
            <div className="flex items-center mb-1">
              <h3 className="font-bold text-white text-base sm:text-lg mr-1 hover:underline"> {/* Font boyutu mobil ve masaüstü için */}
                {faaliyet.isim} {faaliyet.soyisim}
              </h3>

              <span className="text-gray-500 text-sm sm:text-base mr-1">·</span> {/* Font boyutu mobil ve masaüstü için */}
              <span className="text-gray-500 text-sm sm:text-base hover:underline">{formatTimeAgo(faaliyet.created_at)}</span> {/* Font boyutu mobil ve masaüstü için */}

              {/* Sağ tarafta menü butonu */}
              <div className="ml-auto">
                <button className="p-1 sm:p-2 rounded-full hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"> {/* Padding mobil ve masaüstü için */}
                  <FiMoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" /> {/* Icon boyutu mobil ve masaüstü için */}
                </button>
              </div>
            </div>

            {/* Alt etiketler - Dernek ve konum */}
            <div className="flex flex-wrap items-center mb-2 sm:mb-3"> {/* Mobil ekranlarda sarılma (flex-wrap) */}
              {faaliyet.gonullu_dernek && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-red-900 text-red-200 rounded-full mr-2 mb-1"> {/* Küçük padding, küçük font, margin-bottom sarılma için */}
                  📸 {faaliyet.gonullu_dernek}
                </span>
              )}

              {faaliyet.il && (
                <span className="text-red-500 text-xs sm:text-sm font-medium mb-1"> {/* Küçük font, margin-bottom sarılma için */}
                  🇹🇷 #{faaliyet.il?.replace(/\s+/g, '')}{faaliyet.ilce && faaliyet.ilce.replace(/\s+/g, '')}
                </span>
              )}
            </div>

            {/* Ana içerik - Açıklama */}
            {faaliyet.aciklama && (
              <div className="mb-2 sm:mb-3"> {/* Margin-bottom mobil ve masaüstü için */}
                <p className="text-white text-sm sm:text-[15px] leading-4 sm:leading-5 break-words"> {/* break-words eklendi */}
                  {faaliyet.aciklama}
                </p>
              </div>
            )}

            {/* Görseller */}
            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
              <div className="mb-2 sm:mb-3"> {/* Margin-bottom mobil ve masaüstü için */}
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
  <div className="text-center py-8 sm:py-16 px-4 bg-[#121212] min-h-[calc(100vh-100px)] flex flex-col justify-center"> {/* Arka plan rengi, dikey ortalama */}
    <div className="relative mb-4 sm:mb-6"> {/* Margin-bottom mobil ve masaüstü için */}
      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-900 flex items-center justify-center mx-auto"> {/* Boyutlar mobil ve masaüstü için */}
        <FiActivity className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" /> {/* Icon boyutları mobil ve masaüstü için */}
      </div>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Henüz faaliyet yok</h3> {/* Font boyutu mobil ve masaüstü için */}
    <p className="text-gray-500 mb-4 sm:mb-6 text-base sm:text-lg max-w-xs sm:max-w-sm mx-auto"> {/* Font boyutu mobil ve masaüstü için, max-width */}
      İlk faaliyeti paylaş ve topluluğu canlandır!
    </p>
    <Link
      to="/faaliyetler/create"
      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors text-sm sm:text-base"
    > {/* Padding ve font boyutu mobil ve masaüstü için */}
      <FiPlus className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> {/* Icon boyutu mobil ve masaüstü için */}
      İlk Faaliyeti Paylaş
    </Link>
  </div>
);

// Twitter Style Yükleme Durumu
const TwitterLoadingState = () => (
  <div className="bg-[#121212]"> {/* Arka plan rengi */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border-b border-gray-800 p-3 sm:p-4"> {/* Padding mobil ve masaüstü için */}
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-800 animate-pulse"></div> {/* Boyutlar mobil ve masaüstü için */}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2 sm:mb-3"> {/* Margin-bottom mobil ve masaüstü için */}
              <div className="h-3 w-20 sm:h-4 sm:w-24 bg-gray-800 rounded animate-pulse mr-2"></div> {/* Boyutlar mobil ve masaüstü için */}
              <div className="h-3 w-12 sm:h-4 sm:w-16 bg-gray-800 rounded animate-pulse"></div> {/* Boyutlar mobil ve masaüstü için */}
            </div>
            <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3"> {/* Boşluklar mobil ve masaüstü için */}
              <div className="h-3 w-full bg-gray-800 rounded animate-pulse"></div> {/* Boyutlar mobil ve masaüstü için */}
              <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse"></div> {/* Boyutlar mobil ve masaüstü için */}
            </div>
            <div className="h-36 sm:h-48 w-full bg-gray-800 rounded-lg sm:rounded-2xl animate-pulse mb-2 sm:mb-3"></div> {/* Boyutlar mobil ve masaüstü için */}
            <div className="flex justify-between max-w-xs sm:max-w-md"> {/* Max-width mobil ve masaüstü için */}
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
    <div className="max-w-2xl mx-auto  min-h-screen"> {/* Ana arka plan rengi */}
      {/* Twitter Header */}
      <div className="sticky top-0  bg-opacity-80 backdrop-blur-md border-b border-gray-800 z-10"> {/* Arka plan rengi */}
        <div className="flex items-center justify-between p-3 sm:p-4"> {/* Padding mobil ve masaüstü için */}
          <h1 className="text-lg sm:text-xl font-bold text-white">Anasayfa</h1> {/* Font boyutu mobil ve masaüstü için */}
          <Link
            to="/faaliyetler"
            className="text-red-600 hover:text-red-300 font-medium text-sm sm:text-base"
          > {/* Font boyutu mobil ve masaüstü için */}
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
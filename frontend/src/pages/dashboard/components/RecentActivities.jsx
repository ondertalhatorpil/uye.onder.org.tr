// RecentActivities.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiMapPin, FiPlus,
  FiMaximize2, FiClock, FiMoreHorizontal
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

const APP_RED = 'red-500'; // Uygulama ana rengi: Kırmızı
const APP_RED_HOVER = 'red-600'; // Hover durumu için kırmızı tonu

// Görsel Büyütme Modalı Bileşeni
const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Modal dışına tıklayınca kapanır
    >
      <div className="relative max-w-6xl max-h-full">
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
          alt="Büyük görsel"
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Görsele tıklayınca modal kapanmaz
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black bg-opacity-60 rounded-full p-2 sm:p-3 hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm"
        >
          {/* Mobil için ikon boyutu büyütüldü */}
          <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Görsel Izgarası Bileşeni (Faaliyet kartı içindeki görselleri düzenler)
const ImageGrid = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  const imageArray = Array.isArray(images)
    ? images
    : (typeof images === 'string' ? JSON.parse(images || '[]') : []); // String ise JSON'a çevir

  if (imageArray.length === 0) return null;

  // Tek görsel renderlama
  const renderSingleImage = () => (
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden group cursor-pointer shadow-lg border border-gray-700"
         onClick={() => onImageClick(imageArray[0])}>
      <img
        src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
        alt="Faaliyet görseli"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/800x500/374151/9ca3af?text=Görsel+Yüklenemedi'; // Hata durumunda placeholder
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
          {/* Mobil için ikon boyutu büyütüldü */}
          <FiMaximize2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
        </div>
      </div>
    </div>
  );

  // İki görsel renderlama
  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 aspect-[16/10] rounded-lg overflow-hidden shadow-lg border border-gray-700">
      {imageArray.slice(0, 2).map((image, index) => (
        <div key={index} className="relative group cursor-pointer overflow-hidden"
             onClick={() => onImageClick(image)}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg">
              {/* Mobil için ikon boyutu büyütüldü */}
              <FiMaximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Üç görsel renderlama
  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 aspect-[16/10] rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="relative group cursor-pointer overflow-hidden"
           onClick={() => onImageClick(imageArray[0])}>
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
          alt="Ana görsel"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600/374151/9ca3af?text=Ana+Görsel';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg">
            {/* Mobil için ikon boyutu büyütüldü */}
            <FiMaximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-2 sm:gap-3">
        {imageArray.slice(1, 3).map((image, index) => (
          <div key={index + 1} className="relative group cursor-pointer overflow-hidden"
               onClick={() => onImageClick(image)}>
            <img
              src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
              alt={`Görsel ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/374151/9ca3af?text=Görsel';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-2 shadow-lg">
                {/* Mobil için ikon boyutu büyütüldü */}
                <FiMaximize2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Üçten fazla görsel renderlama (ilk 3'ü gösterir, dördüncü karede +sayı gösterir)
  const renderMultipleImages = () => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 aspect-[16/10] rounded-lg overflow-hidden shadow-lg border border-gray-700">
      {imageArray.slice(0, 3).map((image, index) => (
        <div key={index}
             className={`relative group cursor-pointer overflow-hidden ${index === 0 ? 'row-span-2' : ''}`}
             onClick={() => onImageClick(image)}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/374151/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg">
              {/* Mobil için ikon boyutu büyütüldü */}
              <FiMaximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
            </div>
          </div>
        </div>
      ))}
      {imageArray.length > 3 && ( // 3'ten fazla görsel varsa
        <div className="relative group cursor-pointer overflow-hidden"
             onClick={() => onImageClick(imageArray[3])}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[3]}`}
            alt="Daha fazla"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/374151/9ca3af?text=Daha+Fazla';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {/* Mobil için metin boyutları büyütüldü */}
              <div className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-1">+{imageArray.length - 3}</div>
              <div className="text-white/90 text-sm sm:text-sm font-medium">daha fazla</div>
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
  return renderMultipleImages();
};

// Faaliyet Kartı Bileşeni
const ActivityCard = ({ faaliyet }) => {
  const [selectedImage, setSelectedImage] = useState(null); // Seçilen görselin state'i

  // Zamanı "şu kadar önce" formatında gösteren fonksiyon
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Görsel modalını açma
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Görsel modalını kapatma
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <article className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
        {/* Kart Başlığı (Header) */}
        <header className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Kullanıcı baş harfi avatarı */}
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  {/* Mobil için font boyutu ayarlandı */}
                  <p className="text-base sm:text-sm font-medium text-white">
                    {faaliyet.isim} {faaliyet.soyisim}
                  </p>
                  {faaliyet.gonullu_dernek && (
                    <span className="ml-2 text-xs text-red-200 bg-red-800 px-2 py-1 rounded-full hidden sm:inline">
                      {faaliyet.gonullu_dernek}
                    </span>
                  )}
                </div>
                {/* Tarih ve Konum bilgileri - Mobil için ikon ve metin boyutları ayarlandı */}
                <div className="flex items-center text-xs sm:text-sm text-gray-400 mt-1">
                  <FiCalendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  {formatTimeAgo(faaliyet.created_at)}
                  {faaliyet.il && (
                    <>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <FiMapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden sm:inline" />
                      <span className="hidden sm:inline">
                        {faaliyet.il}{faaliyet.ilce && `, ${faaliyet.ilce}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <FiMoreHorizontal className="h-4 w-4 text-gray-400" /> {/* Daha fazla ikonu */}
            </button>
          </div>
        </header>

        {/* Kart İçeriği (Main) */}
        <main className="p-4">
          {faaliyet.baslik && (
            <h2 className="font-semibold text-white mb-2 text-base sm:text-lg">
              {faaliyet.baslik}
            </h2>
          )}
          
          {faaliyet.aciklama && (
            <p className="text-gray-300 mb-4 leading-relaxed text-base sm:text-base">
              {/* Açıklama uzunsa kısaltma - Mobil için font boyutu ayarlandı */}
              {faaliyet.aciklama.length > 150 
                ? `${faaliyet.aciklama.substring(0, 150)}...`
                : faaliyet.aciklama}
            </p>
          )}

          {/* Görsel Alanı */}
          {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
            <div className="mb-4">
              <ImageGrid
                images={faaliyet.gorseller}
                onImageClick={openImageModal}
              />
            </div>
          )}
        </main>
      </article>

      {/* Görsel Büyütme Modalı */}
      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={closeImageModal}
      />
    </>
  );
};

// Boş Durum Bileşeni (Faaliyet yoksa gösterilir)
const EmptyState = () => (
  <div className="text-center py-12 sm:py-20 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg px-4"> {/* px-4 eklendi */}
    <div className="relative mb-6 sm:mb-8">
      <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center mx-auto shadow-lg"> {/* h-28 w-28 yapıldı */}
        <FiActivity className="h-14 w-14 sm:h-16 sm:w-16 text-red-500" /> {/* h-14 w-14 yapıldı */}
      </div>
      <div className="absolute -top-2 -right-2 h-10 w-10 sm:h-12 sm:w-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce"> {/* h-10 w-10 yapıldı */}
        <span className="text-base sm:text-xl">✨</span> {/* text-base yapıldı */}
      </div>
    </div>
    <h3 className="text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Henüz faaliyet paylaşılmamış</h3>
    <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4"> {/* text-base yapıldı */}
      Topluluk henüz herhangi bir faaliyet paylaşmamış.
      İlk faaliyeti sen paylaş ve topluluğu canlandır!
    </p>
    <Link
      to="/faaliyetler/create"
      className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-red-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
    >
      <FiPlus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
      İlk Faaliyeti Paylaş
    </Link>
  </div>
);

// Yükleme Durumu Bileşeni
const LoadingState = () => (
  <div className="flex items-center justify-center py-12 sm:py-20 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg px-4"> {/* px-4 eklendi */}
    <div className="text-center">
      <div className="relative mb-4 sm:mb-6">
        <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-4 border-gray-600 border-t-red-500 mx-auto"></div> {/* h-14 w-14 yapıldı */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FiActivity className="h-6 w-6 sm:h-6 sm:w-6 text-red-500 animate-pulse" /> {/* h-6 w-6 yapıldı */}
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Faaliyetler yükleniyor</h3>
      <p className="text-gray-400 text-base sm:text-base">En güncel paylaşımlar getiriliyor...</p> {/* text-base yapıldı */}
    </div>
  </div>
);

// Son Faaliyetler Bileşeni
const RecentActivities = ({ faaliyetler, loading }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl">
      {/* Header - Başlık ve "Tümünü Gör" butonu */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-red-500">Son Faaliyetler</h1> {/* Mobil için text-xl yapıldı */}
          <p className="text-sm sm:text-base text-gray-400">Topluluktan en güncel paylaşımlar</p> {/* Mobil için text-sm yapıldı */}
        </div>
        
        <Link
          to="/faaliyetler"
          className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-red-500 bg-gray-800 hover:bg-gray-700 transition-colors shadow-md"
        > {/* px-3 py-1.5 ve text-xs yapıldı */}
          Tümünü Gör
          <svg className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* ml-1 h-3 w-3 yapıldı */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Faaliyet Listesi */}
      <div className="space-y-6">
        {loading ? (
          <LoadingState />
        ) : faaliyetler.length > 0 ? (
          faaliyetler.map((faaliyet) => (
            <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
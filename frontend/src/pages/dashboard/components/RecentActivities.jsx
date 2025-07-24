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
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-3 sm:p-4" // Mobil için daha küçük padding
      onClick={onClose} // Modal dışına tıklayınca kapanır
    >
      <div className="relative max-w-6xl max-h-full">
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
          alt="Büyük görsel"
          className="max-w-full max-h-full object-contain rounded-lg sm:rounded-2xl shadow-2xl" // Mobil için daha küçük köşe yuvarlatma
          onClick={(e) => e.stopPropagation()} // Görsele tıklayınca modal kapanmaz
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm" // Mobil için p-2
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Mobil için w-5 h-5 */}
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
    <div className="relative w-full aspect-[16/10] rounded-md sm:rounded-lg overflow-hidden group cursor-pointer shadow-lg border border-gray-700" // Mobil için daha küçük köşe yuvarlatma
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
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg"> {/* Mobil için p-1.5 */}
          <FiMaximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" /> {/* Mobil için h-4 w-4 */}
        </div>
      </div>
    </div>
  );

  // İki görsel renderlama
  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-2 rounded-md sm:rounded-lg overflow-hidden shadow-lg border border-gray-700"> {/* Mobil için daha küçük köşe yuvarlatma, gap-2 */}
      {imageArray.slice(0, 2).map((image, index) => (
        <div key={index} className="relative group cursor-pointer overflow-hidden aspect-square" // Mobil için aspect-square
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
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg"> {/* Mobil için p-1 */}
              <FiMaximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-800" /> {/* Mobil için h-3.5 w-3.5 */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Üç görsel renderlama
  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-2 rounded-md sm:rounded-lg overflow-hidden shadow-lg border border-gray-700"> {/* Mobil için daha küçük köşe yuvarlatma, gap-2 */}
      <div className="relative group cursor-pointer overflow-hidden aspect-[3/4]" // Mobil için 3/4 en boy oranı
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
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg"> {/* Mobil için p-1 */}
            <FiMaximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-800" /> {/* Mobil için h-3.5 w-3.5 */}
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-2"> {/* gap-2 */}
        {imageArray.slice(1, 3).map((image, index) => (
          <div key={index + 1} className="relative group cursor-pointer overflow-hidden aspect-[4/3]" // Mobil için 4/3 en boy oranı
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
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg"> {/* Mobil için p-1 */}
                <FiMaximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-800" /> {/* Mobil için h-3.5 w-3.5 */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Üçten fazla görsel renderlama (ilk 3'ü gösterir, dördüncü karede +sayı gösterir)
  const renderMultipleImages = () => (
    <div className="grid grid-cols-2 gap-2 rounded-md sm:rounded-lg overflow-hidden shadow-lg border border-gray-700"> {/* Mobil için daha küçük köşe yuvarlatma, gap-2 */}
      {imageArray.slice(0, 3).map((image, index) => (
        <div key={index}
             className={`relative group cursor-pointer overflow-hidden ${index === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'}`} // Mobil için farklı en boy oranları
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
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg"> {/* Mobil için p-1 */}
              <FiMaximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-800" /> {/* Mobil için h-3.5 w-3.5 */}
            </div>
          </div>
        </div>
      ))}
      {imageArray.length > 3 && ( // 3'ten fazla görsel varsa
        <div className="relative group cursor-pointer overflow-hidden aspect-[4/3]" // Mobil için 4/3 en boy oranı
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
              <div className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-0.5">+{imageArray.length - 3}</div> {/* Mobil için text-lg, mb-0.5 */}
              <div className="text-white/90 text-xs sm:text-sm font-medium">daha fazla</div> {/* Mobil için text-xs */}
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
      <article className="bg-gray-800 rounded-lg sm:rounded-xl border border-gray-700 overflow-hidden shadow-lg"> {/* Mobil için daha küçük köşe yuvarlatma */}
        {/* Kart Başlığı (Header) */}
        <header className="p-3 border-b border-gray-700"> {/* Mobil için p-3 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Kullanıcı baş harfi avatarı */}
              <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0"> {/* Mobil için h-9 w-9 */}
                <span className="text-sm font-medium text-white"> {/* Mobil için text-sm */}
                  {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-2 sm:ml-3 min-w-0"> {/* Mobil için ml-2 */}
                <div className="flex items-center">
                  <p className="text-sm font-medium text-white truncate"> {/* Mobil için text-sm */}
                    {faaliyet.isim} {faaliyet.soyisim}
                  </p>
                  {faaliyet.gonullu_dernek && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs text-red-200 bg-red-800 rounded-full hidden sm:inline-block flex-shrink-0"> {/* Mobil için px-1.5 py-0.5 */}
                      {faaliyet.gonullu_dernek}
                    </span>
                  )}
                </div>
                {/* Tarih ve Konum bilgileri - Mobil için ikon ve metin boyutları ayarlandı */}
                <div className="flex items-center text-xs text-gray-400 mt-0.5"> {/* Mobil için text-xs, mt-0.5 */}
                  <FiClock className="mr-1 h-3 w-3 text-gray-400" /> {/* Mobil için h-3 w-3 */}
                  {formatTimeAgo(faaliyet.created_at)}
                  {faaliyet.il && (
                    <>
                      <span className="mx-1">•</span> {/* Mobil için mx-1 */}
                      <FiMapPin className="mr-1 h-3 w-3 text-gray-400" /> {/* Mobil için h-3 w-3 */}
                      <span className="truncate">
                        {faaliyet.il}{faaliyet.ilce && `, ${faaliyet.ilce}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button className="p-1.5 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"> {/* Mobil için p-1.5 */}
              <FiMoreHorizontal className="h-4 w-4 text-gray-400" /> {/* Daha fazla ikonu */}
            </button>
          </div>
        </header>

        {/* Kart İçeriği (Main) */}
        <main className="p-3"> {/* Mobil için p-3 */}
          {faaliyet.baslik && (
            <h2 className="font-semibold text-white mb-2 text-base sm:text-lg line-clamp-2"> {/* Mobil için text-base */}
              {faaliyet.baslik}
            </h2>
          )}
          
          {faaliyet.aciklama && (
            <p className="text-gray-300 mb-3 leading-relaxed text-sm sm:text-base line-clamp-3"> {/* Mobil için text-sm, mb-3 */}
              {faaliyet.aciklama.length > 150 
                ? `${faaliyet.aciklama.substring(0, 150)}...`
                : faaliyet.aciklama}
            </p>
          )}

          {/* Görsel Alanı */}
          {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
            <div className="mb-3"> {/* Mobil için mb-3 */}
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
  <div className="text-center py-10 px-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"> {/* Mobil için py-10, px-4, rounded-lg */}
    <div className="relative mb-5"> {/* Mobil için mb-5 */}
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center mx-auto shadow-lg"> {/* Mobil için h-24 w-24 */}
        <FiActivity className="h-12 w-12 text-red-500" /> {/* Mobil için h-12 w-12 */}
      </div>
      <div className="absolute -top-2 -right-2 h-8 w-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce"> {/* Mobil için h-8 w-8 */}
        <span className="text-sm">✨</span> {/* Mobil için text-sm */}
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Henüz faaliyet paylaşılmamış</h3> {/* Mobil için text-xl, mb-2 */}
    <p className="text-gray-400 mb-5 text-sm leading-relaxed max-w-xs mx-auto"> {/* Mobil için text-sm, mb-5, max-w-xs */}
      Topluluk henüz herhangi bir faaliyet paylaşmamış.
      İlk faaliyeti sen paylaş ve topluluğu canlandır!
    </p>
    <Link
      to="/faaliyetler/create"
      className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm" // Mobil için px-5 py-2.5, rounded-lg, text-sm
    >
      <FiPlus className="mr-2 h-4 w-4" /> {/* Mobil için h-4 w-4 */}
      İlk Faaliyeti Paylaş
    </Link>
  </div>
);

// Yükleme Durumu Bileşeni
const LoadingState = () => (
  <div className="flex items-center justify-center py-10 px-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"> {/* Mobil için py-10, px-4, rounded-lg */}
    <div className="text-center">
      <div className="relative mb-3"> {/* Mobil için mb-3 */}
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-red-500 mx-auto"></div> {/* Mobil için h-12 w-12 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FiActivity className="h-5 w-5 text-red-500 animate-pulse" /> {/* Mobil için h-5 w-5 */}
        </div>
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">Faaliyetler yükleniyor</h3> {/* Mobil için text-base, mb-1.5 */}
      <p className="text-gray-400 text-sm">En güncel paylaşımlar getiriliyor...</p> {/* Mobil için text-sm */}
    </div>
  </div>
);

// Son Faaliyetler Bileşeni
const RecentActivities = ({ faaliyetler, loading }) => {
  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl"> {/* Mobil için p-3, rounded-xl */}
      {/* Header - Başlık ve "Tümünü Gör" butonu */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-700"> {/* Mobil için mb-6, pb-3 */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-red-500">Güncel Faaliyetler</h1> {/* Mobil için text-lg */}
        </div>
        
        <Link
          to="/faaliyetler"
          className="inline-flex items-center px-2.5 py-1 border border-gray-700 rounded-md text-xs font-medium text-red-500 bg-gray-800 hover:bg-gray-700 transition-colors shadow-md" // Mobil için px-2.5 py-1, rounded-md, text-xs
        >
          Tümünü Gör
          <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Mobil için ml-1 h-3 w-3 */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Faaliyet Listesi */}
      <div className="space-y-4 sm:space-y-6"> {/* Mobil için space-y-4 */}
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
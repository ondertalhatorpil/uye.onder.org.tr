import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiActivity, FiCalendar, FiMapPin, FiPlus, 
  FiHeart, FiMessageCircle, FiShare2, FiEye,
  FiMaximize2, FiUser, FiClock
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services/api';

const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-6xl max-h-full">
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
          alt="Büyük görsel"
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ImageGrid = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  const imageArray = Array.isArray(images) 
    ? images 
    : (typeof images === 'string' ? JSON.parse(images || '[]') : []);

  if (imageArray.length === 0) return null;

  const renderSingleImage = () => (
    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
         onClick={() => onImageClick(imageArray[0])}>
      <img
        src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
        alt="Faaliyet görseli"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/800x500/f3f4f6/9ca3af?text=Görsel+Yüklenemedi';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <FiMaximize2 className="text-gray-800 h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const renderTwoImages = () => (
    <div className="grid grid-cols-2 gap-3 aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
      {imageArray.slice(0, 2).map((image, index) => (
        <div key={index} className="relative group cursor-pointer overflow-hidden"
             onClick={() => onImageClick(image)}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Görsel+Yok';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <FiMaximize2 className="text-gray-800 h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderThreeImages = () => (
    <div className="grid grid-cols-2 gap-3 aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
      <div className="relative group cursor-pointer overflow-hidden"
           onClick={() => onImageClick(imageArray[0])}>
        <img
          src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[0]}`}
          alt="Ana görsel"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600/f3f4f6/9ca3af?text=Ana+Görsel';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <FiMaximize2 className="text-gray-800 h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-3">
        {imageArray.slice(1, 3).map((image, index) => (
          <div key={index + 1} className="relative group cursor-pointer overflow-hidden"
               onClick={() => onImageClick(image)}>
            <img
              src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
              alt={`Görsel ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Görsel';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <FiMaximize2 className="text-gray-800 h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMultipleImages = () => (
    <div className="grid grid-cols-2 gap-3 aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
      {imageArray.slice(0, 3).map((image, index) => (
        <div key={index} 
             className={`relative group cursor-pointer overflow-hidden ${index === 0 ? 'row-span-2' : ''}`}
             onClick={() => onImageClick(image)}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${image}`}
            alt={`Görsel ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Görsel';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <FiMaximize2 className="text-gray-800 h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
      {imageArray.length > 3 && (
        <div className="relative group cursor-pointer overflow-hidden"
             onClick={() => onImageClick(imageArray[3])}>
          <img
            src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageArray[3]}`}
            alt="Daha fazla"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Daha+Fazla';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white font-bold text-3xl mb-2">+{imageArray.length - 3}</div>
              <div className="text-white/90 text-sm font-medium">daha fazla görsel</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Layout seçimi
  if (imageArray.length === 1) return renderSingleImage();
  if (imageArray.length === 2) return renderTwoImages();
  if (imageArray.length === 3) return renderThreeImages();
  return renderMultipleImages();
};

const ActivityCard = ({ faaliyet }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(faaliyet.likes || Math.floor(Math.random() * 50) + 5);

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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
        {/* Header */}
        <header className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center shadow-lg ring-2 ring-red-100">
                <span className="text-xl font-bold text-white">
                  {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">
                {faaliyet.isim} {faaliyet.soyisim}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiClock className="mr-1 h-4 w-4" />
                  <time>{formatTimeAgo(faaliyet.created_at)}</time>
                </div>
                {faaliyet.gonullu_dernek && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <FiMapPin className="mr-1 h-4 w-4" />
                      <span className="truncate max-w-32">{faaliyet.gonullu_dernek}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 pb-4">
          {faaliyet.baslik && (
            <h2 className="font-bold text-gray-900 mb-3 text-xl leading-snug">
              {faaliyet.baslik}
            </h2>
          )}
          
          {faaliyet.aciklama && (
            <p className="text-gray-700 leading-relaxed mb-4 text-base">
              {faaliyet.aciklama.length > 200 
                ? `${faaliyet.aciklama.substring(0, 200)}...` 
                : faaliyet.aciklama}
            </p>
          )}
        </main>

        {/* Images */}
        {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
          <div className="px-6 pb-4">
            <ImageGrid 
              images={faaliyet.gorseller} 
              onImageClick={openImageModal}
            />
          </div>
        )}

      
      </article>

      {/* Image Modal */}
      <ImageModal 
        image={selectedImage} 
        isOpen={!!selectedImage} 
        onClose={closeImageModal} 
      />
    </>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="relative mb-8">
      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto shadow-lg">
        <FiActivity className="h-16 w-16 text-red-500" />
      </div>
      <div className="absolute -top-2 -right-2 h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <span className="text-xl">✨</span>
      </div>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-4">Henüz faaliyet paylaşılmamış</h3>
    <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
      Topluluk henüz herhangi bir faaliyet paylaşmamış. 
      İlk faaliyeti sen paylaş ve topluluğu canlandır!
    </p>
    <Link
      to="/faaliyetler/create"
      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-2xl font-bold hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
    >
      <FiPlus className="mr-3 h-6 w-6" />
      İlk Faaliyeti Paylaş
    </Link>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiActivity className="h-6 w-6 text-red-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Faaliyetler yükleniyor</h3>
      <p className="text-gray-500">En güncel paylaşımlar getiriliyor...</p>
    </div>
  </div>
);

const RecentActivities = ({ faaliyetler, loading }) => {
  return (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg">
              <FiActivity className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Son Faaliyetler</h1>
              <p className="text-gray-600">Topluluktan en güncel paylaşımlar</p>
            </div>
          </div>
          
          <Link
            to="/faaliyetler"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-2xl hover:from-red-200 hover:to-red-300 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Tümünü Gör
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        {loading ? (
          <LoadingState />
        ) : faaliyetler.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {faaliyetler.map((faaliyet) => (
              <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </section>
  );
};

export default RecentActivities;
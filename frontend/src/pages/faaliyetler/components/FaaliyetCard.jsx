import React from 'react';
import { FiCalendar, FiMapPin, FiMoreHorizontal, FiImage } from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

const FaaliyetCard = ({ faaliyet }) => {
  // Tarih formatla
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  // Resim tıklandığında modal açılabilir
  const handleImageClick = (imageUrl) => {
    console.log('Image clicked:', imageUrl);
    // TODO: Image modal implementation
    // Burada bir resim modalı açmak için bir state yönetimi veya bağlam kullanılabilir.
    // Örneğin: openImageModal(imageUrl);
  };

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
      {/* User Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <div className="flex items-start justify-between"> {/* items-start olarak değiştirildi */}
          <div className="flex items-start flex-1 min-w-0"> {/* flex-1 ve min-w-0 eklendi */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-white">
                {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0"> {/* flex-1 ve min-w-0 eklendi */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center"> {/* items-start olarak değiştirildi */}
                <p className="text-sm font-medium text-white truncate max-w-full sm:max-w-none mr-2"> {/* mr-2 eklendi */}
                  {faaliyet.isim} {faaliyet.soyisim}
                </p>
                {faaliyet.gonullu_dernek && (
                  <span className="mt-1 sm:mt-0 text-xs text-red-200 bg-red-800 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full sm:max-w-[150px] flex-shrink-0">
                    {faaliyet.gonullu_dernek}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center text-xs text-gray-400 mt-1 break-words"> {/* flex-wrap ve break-words eklendi */}
                <FiCalendar className="mr-1 h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatTimeAgo(faaliyet.created_at)}</span>
                {faaliyet.il && (
                  <>
                    <span className="mx-1">•</span>
                    <FiMapPin className="mr-1 h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate max-w-[calc(100%-40px)] sm:max-w-none">{faaliyet.il}{faaliyet.ilce && `, ${faaliyet.ilce}`}</span> {/* max-w eklendi */}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button className="p-1 sm:p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0">
            <FiMoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {faaliyet.baslik && (
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">
            {faaliyet.baslik}
          </h3>
        )}
        
        {faaliyet.aciklama && (
          <p className="text-gray-300 mb-3 sm:mb-4 leading-normal text-sm sm:text-base">
            {faaliyet.aciklama}
          </p>
        )}

        {/* Images */}
        {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className={`grid gap-2 ${
              faaliyet.gorseller.length === 1 ? 'grid-cols-1' :
              faaliyet.gorseller.length === 2 ? 'grid-cols-2' :
              faaliyet.gorseller.length >= 3 ? 'grid-cols-2' :
              ''
            }`}>
              {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => {
                const imageUrl = `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`;
                
                const isFirstImageInThree = faaliyet.gorseller.length === 3 && index === 0;

                return (
                  <div 
                    key={index} 
                    className={`relative overflow-hidden rounded-lg ${
                      faaliyet.gorseller.length === 1 ? 'col-span-2' :
                      isFirstImageInThree ? 'col-span-2' :
                      'col-span-1'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Faaliyet ${index + 1}`}
                      className={`w-full object-cover transition-opacity duration-200 cursor-pointer hover:opacity-80 
                        ${faaliyet.gorseller.length === 1 ? 'h-56 sm:h-96' : 'h-32 sm:h-48'}`}
                      onClick={() => handleImageClick(imageUrl)}
                    />
                    {/* Daha fazla resim göstergesi */}
                    {index === 3 && faaliyet.gorseller.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <FiImage className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 text-gray-200" />
                          <span className="font-medium text-base sm:text-lg">
                            +{faaliyet.gorseller.length - 4}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaaliyetCard;
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
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* User Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900">
                  {faaliyet.isim} {faaliyet.soyisim}
                </p>
                {faaliyet.gonullu_dernek && (
                  <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {faaliyet.gonullu_dernek}
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <FiCalendar className="mr-1 h-3 w-3" />
                {formatTimeAgo(faaliyet.created_at)}
                {faaliyet.il && (
                  <>
                    <span className="mx-2">•</span>
                    <FiMapPin className="mr-1 h-3 w-3" />
                    {faaliyet.il}{faaliyet.ilce && `, ${faaliyet.ilce}`}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiMoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {faaliyet.baslik && (
          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
            {faaliyet.baslik}
          </h3>
        )}
        
        {faaliyet.aciklama && (
          <p className="text-gray-700 mb-4 leading-relaxed">
            {faaliyet.aciklama}
          </p>
        )}

        {/* Images */}
        {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              faaliyet.gorseller.length === 1 ? 'grid-cols-1' :
              faaliyet.gorseller.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => {
                const imageUrl = `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`;
                return (
                  <div 
                    key={index} 
                    className={`relative ${
                      faaliyet.gorseller.length === 1 ? 'col-span-1' :
                      faaliyet.gorseller.length === 3 && index === 0 ? 'col-span-2' :
                      ''
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Faaliyet ${index + 1}`}
                      className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity ${
                        faaliyet.gorseller.length === 1 ? 'h-96' : 'h-48'
                      }`}
                      onClick={() => handleImageClick(imageUrl)}
                    />
                    {index === 3 && faaliyet.gorseller.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <FiImage className="h-8 w-8 mx-auto mb-1" />
                          <span className="font-medium">
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
import React from 'react';
import { Link } from 'react-router-dom';
import { UPLOADS_BASE_URL } from '../../../../services';
import { 
  FiMapPin, FiUsers, FiPhone, FiUser, FiExternalLink, FiGrid
} from 'react-icons/fi';

const DernekGrid = ({ dernekler, viewMode, filters, onClearFilters }) => {
  
  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-logos/${logoPath}`;
  };

  // Default logo component
  const DefaultLogo = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
      <img 
        src="https://onder.org.tr/assets/images/statics/onder-logo.svg" 
        alt="ÖNDER Logo"
        className="w-28 h-28 object-contain opacity-40"
      />
    </div>
  );

  // Dernek kartı komponenti
  const DernekCard = ({ dernek }) => (
    <div className={`bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-[1.01] border border-gray-700 ${
      viewMode === 'list' ? 'flex flex-col sm:flex-row' : '' // Liste görünümünde hem mobil hem de masaüstü için esneklik
    }`}>
      
      {/* Logo Bölümü */}
      <div className={`${viewMode === 'list' ? 'flex-shrink-0 w-full sm:w-36 h-48 sm:h-36' : ''} relative`}> {/* Mobil için tam genişlik, sm'den sonra sabit genişlik ve yükseklik */}
        <div className={`${viewMode === 'list' ? 'h-full' : 'h-56'} bg-gray-700 overflow-hidden`}>
          {dernek.dernek_logosu ? (
            <>
              <img
                src={getDernekLogoUrl(dernek.dernek_logosu)}
                alt={dernek.dernek_adi}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full">
                <DefaultLogo />
              </div>
            </>
          ) : (
            <DefaultLogo />
          )}
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* İçerik Bölümü */}
      <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
        <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
          <div className={viewMode === 'list' ? 'flex-1 pr-4' : ''}>
            
            {/* Dernek Adı */}
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-red-500 transition-colors">
              {dernek.dernek_adi}
            </h3>
            
            {/* Dernek Bilgileri */}
            <div className="space-y-2 mb-4">
              {dernek.dernek_baskani && (
                <div className="flex items-center text-gray-300">
                  <FiUser className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{dernek.dernek_baskani}</span>
                </div>
              )}
              
              {(dernek.il || dernek.ilce) && (
                <div className="flex items-center text-gray-300">
                  <FiMapPin className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                  </span>
                </div>
              )}
              
              {dernek.dernek_telefon && (
                <div className="flex items-center text-gray-300">
                  <FiPhone className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{dernek.dernek_telefon}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-300">
                <FiUsers className="mr-3 h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">
                  <span className="text-red-400 font-semibold">{dernek.uye_sayisi || 0}</span> üye
                </span>
              </div>
            </div>
          </div>
          
          {/* Liste Görünümü İçin Butonlar */}
          {viewMode === 'list' && (
            <div className="flex flex-col space-y-3 mt-4 sm:mt-0"> {/* Mobil için üst boşluk, sm'den sonra sıfır */}
              <Link
                to={`/dernekler/${encodeURIComponent(dernek.dernek_adi)}`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all hover:scale-105 shadow-md"
              >
                <FiExternalLink className="mr-2 h-4 w-4" />
                Görüntüle
              </Link>
              <Link
                to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-105 shadow-md" 
              >
                <FiUsers className="mr-2 h-4 w-4" />
                Üyeler
              </Link>
            </div>
          )}
        </div>
        
        {/* Grid Görünümü İçin Butonlar */}
        {viewMode === 'grid' && (
          <div className="flex space-x-3 mt-4">
            <Link
              to={`/dernekler/${encodeURIComponent(dernek.dernek_adi)}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all hover:scale-105 shadow-md"
            >
              <FiExternalLink className="mr-2 h-4 w-4" />
              Görüntüle
            </Link>
            <Link
              to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all hover:scale-105 shadow-md" 
            >
              <FiUsers className="mr-2 h-4 w-4" />
              Üyeler
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
      <div className="mx-auto h-24 w-24 text-gray-600 mb-6"> 
        <FiGrid className="w-full h-full" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-4">
        {filters.search || filters.il || filters.ilce 
          ? 'Arama kriterlerine uygun dernek bulunamadı' 
          : 'Henüz dernek yok'
        }
      </h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {filters.search || filters.il || filters.ilce 
          ? 'Farklı kriterlerle arama yapabilir veya filtreleri temizleyebilirsiniz.'
          : 'Sistem henüz kurulum aşamasında.'
        }
      </p>
      {(filters.search || filters.il || filters.ilce) && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-md" 
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  // Render
  if (dernekler.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' // Izgara görünümünde boşluklar
        : 'space-y-6' // Liste görünümünde dikey boşluklar
    }>
      {dernekler.map((dernek) => (
        <DernekCard key={dernek.id} dernek={dernek} />
      ))}
    </div>
  );
};

export default DernekGrid;
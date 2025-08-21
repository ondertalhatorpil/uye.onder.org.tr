import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiBriefcase,
  FiUsers, FiSearch, FiFilter
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

// Profil Avatar Bileşeni
const ProfileAvatar = ({ user, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
    xl: 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg sm:text-xl',
    xl: 'text-2xl'
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-xl sm:rounded-2xl',
    xl: 'rounded-2xl'
  };

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
          ? 'http://localhost:3001' // Backend port
          : UPLOADS_BASE_URL || 'https://uye.onder.org.tr';
        
        // Eğer profil_fotografi zaten "uploads/" ile başlıyorsa, tekrar ekleme
        if (user.profil_fotografi.startsWith('uploads/')) {
          imageUrl = `${baseUrl}/${user.profil_fotografi}`;
        } else {
          imageUrl = `${baseUrl}/uploads/profile-images/${user.profil_fotografi}`;
        }
      }
      
      return imageUrl;
    }
    
    // Varsayılan avatar
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
  };

  return (
    <div className={`${sizeClasses[size]} ${roundedClasses[size]} bg-[#FA2C37] flex items-center justify-center shadow-md sm:shadow-lg overflow-hidden flex-shrink-0`}>
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

// MemberCard Bileşeni
const MemberCard = ({ uye }) => {
  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="p-4 sm:p-6">
        {/* User Avatar & Name */}
        <div className="flex items-center mb-4 sm:mb-6">
          <ProfileAvatar 
            user={{
              isim: uye.isim,
              soyisim: uye.soyisim,
              profil_fotografi: uye.profil_fotografi
            }} 
            size="lg" 
          />
          <div className="ml-3 sm:ml-4 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">
              {uye.isim} {uye.soyisim}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              {uye.meslek || uye.gonullu_dernek || 'Bilgi belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {uye.sektor && (
            <div className="flex items-center p-2.5 sm:p-3 bg-blue-700 rounded-lg sm:rounded-xl">
              <div className="h-7 w-7 sm:h-8 w-8 rounded-md sm:rounded-lg bg-blue-600 flex items-center justify-center mr-2.5 sm:mr-3">
                <FiBriefcase className="h-3.5 w-3.5 sm:h-4 w-4 text-blue-100" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-100">Sektör</div>
                <div className="text-sm font-semibold text-white">{uye.sektor}</div>
              </div>
            </div>
          )}
          
          {(uye.il || uye.ilce) && (
            <div className="flex items-center p-2.5 sm:p-3 bg-green-700 rounded-lg sm:rounded-xl">
              <div className="h-7 w-7 sm:h-8 w-8 rounded-md sm:rounded-lg bg-green-600 flex items-center justify-center mr-2.5 sm:mr-3">
                <FiMapPin className="h-3.5 w-3.5 sm:h-4 w-4 text-green-100" />
              </div>
              <div>
                <div className="text-xs font-medium text-green-100">Lokasyon</div>
                <div className="text-sm font-semibold text-white">
                  {uye.il}{uye.ilce && `, ${uye.ilce}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Link
            to={`/uyeler/${uye.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 sm:py-3 text-sm font-semibold text-white bg-[#FA2C37] rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg" 
          >
            <FiUser className="mr-2 h-4 w-4" />
            Profil
          </Link>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ hasFilters, onClearFilters, onShowFilters }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <FiSearch className="h-10 w-10 sm:h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
            Arama kriterlerine uygun üye bulunamadı
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
            Farklı kriterlerle arama yapabilir veya filtreleri temizleyerek 
            tüm üyeleri görüntüleyebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2 sm:px-0">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-600 transition-colors shadow-md sm:shadow-lg text-sm" 
            >
              <FiSearch className="mr-2 h-4 w-4 sm:h-5 w-5" />
              Filtreleri Temizle
            </button>
            <button
              onClick={onShowFilters}
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md sm:shadow-lg text-sm" 
            >
              <FiFilter className="mr-2 h-4 w-4 sm:h-5 w-5" />
              Filtreleri Düzenle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-[#FA2C37] flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <FiSearch className="h-10 w-10 sm:h-12 w-12 text-red-200" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
          Üye aramaya başlayın
        </h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
          İsim, sektör, meslek veya lokasyon bilgileri ile üyeleri bulabilirsiniz.
          Hızlı arama veya gelişmiş filtreler kullanarak istediğiniz üyeleri keşfedin.
        </p>
        <button
          onClick={onShowFilters}
          className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-[#FA2C37] text-white rounded-xl sm:rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base" 
        >
          <FiFilter className="mr-2 h-4 w-4 sm:h-5 w-5" />
          Gelişmiş Arama Yap
        </button>
      </div>
    </div>
  );
};

// LoadingState Bileşeni
const LoadingState = () => (
  <div className="flex items-center justify-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-14 w-14 sm:h-16 w-16 border-4 border-red-500 border-t-red-700 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiSearch className="h-5 w-5 sm:h-6 w-6 text-red-300" />
        </div>
      </div>
      <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300 font-medium">Üyeler aranıyor...</p>
      <p className="text-sm text-gray-400 mt-1 sm:mt-2">Bu işlem birkaç saniye sürebilir</p>
    </div>
  </div>
);

// SearchResults Bileşeni
const SearchResults = ({ uyeler, loading, filters, onClearFilters, onShowFilters }) => {
  const hasFilters = filters && Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className="bg-gray-900 rounded-xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-800">
      {/* Results Header */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-9 w-9 sm:h-10 w-10 rounded-lg sm:rounded-xl bg-[#FA2C37] flex items-center justify-center">
              <FiUsers className="h-4 w-4 sm:h-5 w-5 text-red-100" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Arama Sonuçları
              </h2>
              {uyeler.length > 0 && (
                <p className="text-gray-400 text-sm">
                  {uyeler.length} üye bulundu
                </p>
              )}
            </div>
          </div>
          
          {uyeler.length > 0 && (
            <div className="text-right mt-2 sm:mt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-500">{uyeler.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Toplam Sonuç</div>
            </div>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="p-4 sm:p-8">
        {loading ? (
          <LoadingState />
        ) : uyeler.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {uyeler.map((uye) => (
              <MemberCard key={uye.id} uye={uye} />
            ))}
          </div>
        ) : (
          <EmptyState 
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
            onShowFilters={onShowFilters}
          />
        )}
      </div>
    </div>
  );
};

export default SearchResults;
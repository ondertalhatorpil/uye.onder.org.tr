import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiBriefcase,
  FiUsers, FiSearch, FiFilter
} from 'react-icons/fi';

// MemberCard Bileşeni
const MemberCard = ({ uye }) => {
  return (
    <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="p-6">
        {/* User Avatar & Name */}
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">
              {uye.isim?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {uye.isim} {uye.soyisim}
            </h3>
            <p className="text-gray-400 text-sm">
              {uye.meslek || uye.gonullu_dernek || 'Bilgi belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3 mb-6">
          {uye.sektor && (
            <div className="flex items-center p-3 bg-blue-700 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
                <FiBriefcase className="h-4 w-4 text-blue-100" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-100">Sektör</div>
                <div className="text-sm font-semibold text-white">{uye.sektor}</div>
              </div>
            </div>
          )}
          
          {(uye.il || uye.ilce) && (
            <div className="flex items-center p-3 bg-green-700 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center mr-3">
                <FiMapPin className="h-4 w-4 text-green-100" />
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
        <div className="flex gap-3">
          <Link
            to={`/uyeler/${uye.id}`}
            // Hatalı yorum satırı buradan kaldırıldı.
            className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl" 
          >
            {/* Kırmızı gradient biraz daha koyu */}
            <FiUser className="mr-2 h-4 w-4" />
            Profil
          </Link>
        </div>
      </div>
    </div>
  );
};

// EmptyState Bileşeni
const EmptyState = ({ hasFilters, onClearFilters, onShowFilters }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-16 bg-gray-900 rounded-3xl border border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-6">
            <FiSearch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Arama kriterlerine uygun üye bulunamadı
          </h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Farklı kriterlerle arama yapabilir veya filtreleri temizleyerek 
            tüm üyeleri görüntüleyebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors shadow-lg"
            >
              <FiSearch className="mr-2 h-5 w-5" />
              Filtreleri Temizle
            </button>
            <button
              onClick={onShowFilters}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg"
            >
              <FiFilter className="mr-2 h-5 w-5" />
              Filtreleri Düzenle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16 bg-gray-900 rounded-3xl border border-gray-800">
      <div className="max-w-md mx-auto">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center mx-auto mb-6">
          <FiSearch className="h-12 w-12 text-red-200" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Üye aramaya başlayın
        </h3>
        <p className="text-gray-400 mb-8 leading-relaxed">
          İsim, sektör, meslek veya lokasyon bilgileri ile üyeleri bulabilirsiniz.
          Hızlı arama veya gelişmiş filtreler kullanarak istediğiniz üyeleri keşfedin.
        </p>
        <button
          onClick={onShowFilters}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiFilter className="mr-2 h-5 w-5" />
          Gelişmiş Arama Yap
        </button>
      </div>
    </div>
  );
};

// LoadingState Bileşeni
const LoadingState = () => (
  <div className="flex items-center justify-center py-16 bg-gray-900 rounded-3xl border border-gray-800">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-red-700 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiSearch className="h-6 w-6 text-red-300" />
        </div>
      </div>
      <p className="mt-6 text-lg text-gray-300 font-medium">Üyeler aranıyor...</p>
      <p className="text-sm text-gray-400 mt-2">Bu işlem birkaç saniye sürebilir</p>
    </div>
  </div>
);

// SearchResults Bileşeni
const SearchResults = ({ uyeler, loading, filters, onClearFilters, onShowFilters }) => {
  const hasFilters = filters && Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className="rounded-3xl shadow-xl overflow-hidden">
      {/* Results Header */}
      <div className="px-8 py-6 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-700 flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-red-100" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Arama Sonuçları
              </h2>
              {uyeler.length > 0 && (
                <p className="text-gray-400">
                  {uyeler.length} üye bulundu
                </p>
              )}
            </div>
          </div>
          
          {uyeler.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-red-500">{uyeler.length}</div>
              <div className="text-sm text-gray-500">Toplam Sonuç</div>
            </div>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="p-8">
        {loading ? (
          <LoadingState />
        ) : uyeler.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiBriefcase, FiPhone, FiMail,
  FiUsers, FiHome, FiSearch, FiFilter
} from 'react-icons/fi';

const MemberCard = ({ uye }) => {
  return (
    <div className="bg-white rounded-xs shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="p-6">
        {/* User Avatar & Name */}
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">
              {uye.isim?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {uye.isim} {uye.soyisim}
            </h3>
            <p className="text-gray-600 text-xs">
              {uye.gonullu_dernek || 'Meslek belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3 mb-6">
          {uye.sektor && (
            <div className="flex items-center p-3 bg-blue-50 rounded-xs">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiBriefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-700">Sektör</div>
                <div className="text-sm font-semibold text-gray-900">{uye.sektor}</div>
              </div>
            </div>
          )}
          
          {(uye.il || uye.ilce) && (
            <div className="flex items-center p-3 bg-green-50 rounded-xs">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                <FiMapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-green-700">Lokasyon</div>
                <div className="text-sm font-semibold text-gray-900">
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
            className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xs hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <FiSearch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Arama kriterlerine uygun üye bulunamadı
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Farklı kriterlerle arama yapabilir veya filtreleri temizleyerek 
            tüm üyeleri görüntüleyebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xs font-semibold hover:bg-gray-700 transition-colors shadow-lg"
            >
              <FiSearch className="mr-2 h-5 w-5" />
              Filtreleri Temizle
            </button>
            <button
              onClick={onShowFilters}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xs font-semibold hover:bg-red-700 transition-colors shadow-lg"
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
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6">
          <FiSearch className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Üye aramaya başlayın
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          İsim, sektör, meslek veya lokasyon bilgileri ile üyeleri bulabilirsiniz.
          Hızlı arama veya gelişmiş filtreler kullanarak istediğiniz üyeleri keşfedin.
        </p>
        <button
          onClick={onShowFilters}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiFilter className="mr-2 h-5 w-5" />
          Gelişmiş Arama Yap
        </button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FiSearch className="h-6 w-6 text-red-600" />
        </div>
      </div>
      <p className="mt-6 text-lg text-gray-600 font-medium">Üyeler aranıyor...</p>
      <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
    </div>
  </div>
);

const SearchResults = ({ uyeler, loading, filters, onClearFilters, onShowFilters }) => {
  const hasFilters = Object.values(filters).some(value => value.trim() !== '');

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Results Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Arama Sonuçları
              </h2>
              {uyeler.length > 0 && (
                <p className="text-gray-600">
                  {uyeler.length} üye bulundu
                </p>
              )}
            </div>
          </div>
          
          {uyeler.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{uyeler.length}</div>
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
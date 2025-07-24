import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiBriefcase,
  FiUsers, FiSearch, FiFilter
} from 'react-icons/fi';

// MemberCard Bileşeni
const MemberCard = ({ uye }) => {
  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"> {/* Responsive yuvarlatma, gölge, kenarlık */}
      <div className="p-4 sm:p-6"> {/* Responsive padding */}
        {/* User Avatar & Name */}
        <div className="flex items-center mb-4 sm:mb-6"> {/* Responsive margin */}
          <div className="h-14 w-14 sm:h-16 w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md sm:shadow-lg"> {/* Responsive boyut, yuvarlatma, gölge */}
            <span className="text-lg sm:text-xl font-bold text-white"> {/* Responsive font boyutu */}
              {uye.isim?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3 sm:ml-4 flex-1"> {/* Responsive margin */}
            <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1"> {/* Responsive font boyutu, metin rengi */}
              {uye.isim} {uye.soyisim}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm"> {/* Responsive font boyutu, metin rengi */}
              {uye.meslek || uye.gonullu_dernek || 'Bilgi belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6"> {/* Responsive boşluk, margin */}
          {uye.sektor && (
            <div className="flex items-center p-2.5 sm:p-3 bg-blue-700 rounded-lg sm:rounded-xl"> {/* Responsive padding, yuvarlatma, arka plan */}
              <div className="h-7 w-7 sm:h-8 w-8 rounded-md sm:rounded-lg bg-blue-600 flex items-center justify-center mr-2.5 sm:mr-3"> {/* Responsive boyut, yuvarlatma, arka plan */}
                <FiBriefcase className="h-3.5 w-3.5 sm:h-4 w-4 text-blue-100" /> {/* Responsive ikon boyutu */}
              </div>
              <div>
                <div className="text-xs font-medium text-blue-100">Sektör</div> {/* Metin rengi */}
                <div className="text-sm font-semibold text-white">{uye.sektor}</div> {/* Metin rengi */}
              </div>
            </div>
          )}
          
          {(uye.il || uye.ilce) && (
            <div className="flex items-center p-2.5 sm:p-3 bg-green-700 rounded-lg sm:rounded-xl"> {/* Responsive padding, yuvarlatma, arka plan */}
              <div className="h-7 w-7 sm:h-8 w-8 rounded-md sm:rounded-lg bg-green-600 flex items-center justify-center mr-2.5 sm:mr-3"> {/* Responsive boyut, yuvarlatma, arka plan */}
                <FiMapPin className="h-3.5 w-3.5 sm:h-4 w-4 text-green-100" /> {/* Responsive ikon boyutu */}
              </div>
              <div>
                <div className="text-xs font-medium text-green-100">Lokasyon</div> {/* Metin rengi */}
                <div className="text-sm font-semibold text-white"> {/* Metin rengi */}
                  {uye.il}{uye.ilce && `, ${uye.ilce}`}
                </div>
              </div>
            </div>
          )}
          
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3"> {/* Responsive boşluk */}
          <Link
            to={`/uyeler/${uye.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 sm:py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg" 
          >
            <FiUser className="mr-2 h-4 w-4" /> {/* İkon boyutu */}
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
      <div className="text-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4"> {/* Responsive padding, yuvarlatma, kenarlık */}
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6"> {/* Responsive boyut, yuvarlatma, arka plan */}
            <FiSearch className="h-10 w-10 sm:h-12 w-12 text-gray-400" /> {/* Responsive ikon boyutu */}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3"> {/* Responsive font boyutu, metin rengi */}
            Arama kriterlerine uygun üye bulunamadı
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"> {/* Responsive font boyutu, metin rengi */}
            Farklı kriterlerle arama yapabilir veya filtreleri temizleyerek 
            tüm üyeleri görüntüleyebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2 sm:px-0"> {/* Responsive flex, boşluk, padding */}
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-600 transition-colors shadow-md sm:shadow-lg text-sm" 
            >
              <FiSearch className="mr-2 h-4 w-4 sm:h-5 w-5" /> {/* Responsive ikon boyutu */}
              Filtreleri Temizle
            </button>
            <button
              onClick={onShowFilters}
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md sm:shadow-lg text-sm" 
            >
              <FiFilter className="mr-2 h-4 w-4 sm:h-5 w-5" /> {/* Responsive ikon boyutu */}
              Filtreleri Düzenle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4"> {/* Responsive padding, yuvarlatma, kenarlık */}
      <div className="max-w-md mx-auto">
        <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center mx-auto mb-5 sm:mb-6"> {/* Responsive boyut, yuvarlatma, arka plan */}
          <FiSearch className="h-10 w-10 sm:h-12 w-12 text-red-200" /> {/* Responsive ikon boyutu */}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3"> {/* Responsive font boyutu, metin rengi */}
          Üye aramaya başlayın
        </h3>
        <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"> {/* Responsive font boyutu, metin rengi */}
          İsim, sektör, meslek veya lokasyon bilgileri ile üyeleri bulabilirsiniz.
          Hızlı arama veya gelişmiş filtreler kullanarak istediğiniz üyeleri keşfedin.
        </p>
        <button
          onClick={onShowFilters}
          className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl sm:rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base" 
        >
          <FiFilter className="mr-2 h-4 w-4 sm:h-5 w-5" /> {/* Responsive ikon boyutu */}
          Gelişmiş Arama Yap
        </button>
      </div>
    </div>
  );
};

// LoadingState Bileşeni
const LoadingState = () => (
  <div className="flex items-center justify-center py-12 sm:py-16 bg-gray-900 rounded-xl sm:rounded-3xl border border-gray-800 p-4"> {/* Responsive padding, yuvarlatma, kenarlık */}
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-14 w-14 sm:h-16 w-16 border-4 border-red-500 border-t-red-700 mx-auto"></div> {/* Responsive boyut, kenarlık */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FiSearch className="h-5 w-5 sm:h-6 w-6 text-red-300" /> {/* Responsive ikon boyutu */}
        </div>
      </div>
      <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300 font-medium">Üyeler aranıyor...</p> {/* Responsive font boyutu, metin rengi */}
      <p className="text-sm text-gray-400 mt-1 sm:mt-2">Bu işlem birkaç saniye sürebilir</p> {/* Responsive font boyutu, metin rengi */}
    </div>
  </div>
);

// SearchResults Bileşeni
const SearchResults = ({ uyeler, loading, filters, onClearFilters, onShowFilters }) => {
  const hasFilters = filters && Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className="bg-gray-900 rounded-xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-800"> {/* Arka plan, yuvarlatma, gölge, kenarlık */}
      {/* Results Header */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-gray-800"> {/* Responsive padding, kenarlık */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"> {/* Responsive flex düzeni, boşluk */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-9 w-9 sm:h-10 w-10 rounded-lg sm:rounded-xl bg-red-700 flex items-center justify-center"> {/* Responsive boyut, yuvarlatma, arka plan */}
              <FiUsers className="h-4 w-4 sm:h-5 w-5 text-red-100" /> {/* Responsive ikon boyutu */}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white"> {/* Responsive font boyutu, metin rengi */}
                Arama Sonuçları
              </h2>
              {uyeler.length > 0 && (
                <p className="text-gray-400 text-sm"> {/* Metin rengi */}
                  {uyeler.length} üye bulundu
                </p>
              )}
            </div>
          </div>
          
          {uyeler.length > 0 && (
            <div className="text-right mt-2 sm:mt-0"> {/* Responsive margin */}
              <div className="text-xl sm:text-2xl font-bold text-red-500">{uyeler.length}</div> {/* Responsive font boyutu, metin rengi */}
              <div className="text-xs sm:text-sm text-gray-500">Toplam Sonuç</div> {/* Responsive font boyutu, metin rengi */}
            </div>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="p-4 sm:p-8"> {/* Responsive padding */}
        {loading ? (
          <LoadingState />
        ) : uyeler.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"> {/* Responsive grid kolonları ve boşlukları */}
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
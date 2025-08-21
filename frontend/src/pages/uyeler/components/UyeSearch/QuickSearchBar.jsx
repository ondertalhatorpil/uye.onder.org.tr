import React from 'react';
import { FiSearch, FiUser, FiFilter, FiRefreshCw, FiUsers, FiTrendingUp } from 'react-icons/fi';

const QuickSearchBar = ({ searchValue, onSearchChange, onQuickSearch, loading, showFilters, setShowFilters, refreshing, onRefresh, hasActiveFilters }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onQuickSearch();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu arka plan */}
      <div className="p-4 sm:p-6 lg:p-8"> {/* Responsive padding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6"> {/* Responsive hizalama ve boşluk */}
          <div className="flex items-center gap-3 flex-grow"> {/* flex-grow eklendi */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-[#FA2C37] flex items-center justify-center flex-shrink-0"> {/* Daha koyu kırmızı simge arka planı */}
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-red-200" /> {/* Daha açık kırmızı simge */}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">Hızlı Arama</h2> {/* Metin beyaz, font boyutu */}
              <p className="text-gray-400 text-sm">İsim veya soyisim ile hızlıca üye bulun</p> {/* Metin gri tonu, font boyutu */}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 ml-auto"> {/* Responsive wrap ve boşluk */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                showFilters 
                  ? 'bg-red-600 text-white border-red-700 shadow-md hover:bg-red-700' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600' 
              }`}
            >
              <FiFilter className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
              Gelişmiş Arama
            </button>
            
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-200 hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 shadow-md" 
            >
              <FiRefreshCw className={`mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} /> {/* İkon boyutu */}
              Yenile
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4"> {/* Responsive boşluk */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"> {/* Padding */}
                <FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" /> {/* İkon boyutu */}
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Örn: Ahmet Yılmaz, Ayşe Kaya..."
                className="block w-full pl-10 pr-4 py-3 sm:py-4 text-sm sm:text-lg border border-gray-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 placeholder-gray-500 bg-gray-700 text-white" 
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-300" 
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* İkon boyutu */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={onQuickSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-[#FA2C37] text-white rounded-xl sm:rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] min-w-[100px] text-sm sm:text-base justify-center flex items-center" 
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div> {/* Boyut */}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FiSearch className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> {/* İkon boyutu */}
                Ara
              </div>
            )}
          </button>
        </div>

        {/* Search Tips */}
        <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-700 rounded-xl sm:rounded-2xl border border-gray-600"> {/* Responsive padding, arka plan, yuvarlatma, kenarlık */}
          <div className="flex items-start gap-2 sm:gap-3"> {/* Responsive boşluk */}
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-[#FA2C37] flex items-center justify-center flex-shrink-0 mt-0.5"> {/* Boyut, yuvarlatma, arka plan */}
              <svg className="h-3 w-3  sm:h-3.5 sm:w-3.5 text-red-200" fill="currentColor" viewBox="0 0 20 20"> {/* İkon boyutu ve rengi */}
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-0.5">Arama İpuçları</h4> {/* Font boyutu ve rengi */}
              <p className="text-xs sm:text-sm text-gray-400"> {/* Font boyutu ve rengi */}
                İsim ve soyisim birlikte yazabilir, kısmi kelimelerle arama yapabilirsiniz. 
                Daha detaylı arama için "Gelişmiş Arama" özelliğini kullanın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchBar;
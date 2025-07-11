import React from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';

const QuickSearchBar = ({ searchValue, onSearchChange, onQuickSearch, loading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onQuickSearch();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FiSearch className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hızlı Arama</h2>
            <p className="text-gray-600">İsim veya soyisim ile hızlıca üye bulun</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Örn: Ahmet Yılmaz, Ayşe Kaya..."
                className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder-gray-400"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={onQuickSearch}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FiSearch className="mr-2 h-5 w-5" />
                Ara
              </div>
            )}
          </button>
        </div>

        {/* Search Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Arama İpuçları</h4>
              <p className="text-sm text-gray-600">
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
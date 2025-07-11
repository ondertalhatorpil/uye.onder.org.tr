import React from 'react';
import { FiFilter, FiRefreshCw, FiUsers, FiSearch, FiTrendingUp } from 'react-icons/fi';

const SearchHeader = ({ stats, showFilters, setShowFilters, refreshing, onRefresh }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-8 py-6">
        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title & Description */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Üye Arama</h1>
                <p className="text-gray-600 text-lg">
                  Topluluktan üyeleri keşfedin ve iletişime geçin
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <FiSearch className="mr-2 h-4 w-4" />
                <span>{stats.hasActiveFilters ? 'Aktif filtreler var' : 'Arama yapmaya başlayın'}</span>
              </div>
              {stats.totalMembers > 0 && (
                <div className="flex items-center text-sm text-green-600">
                  <FiTrendingUp className="mr-2 h-4 w-4" />
                  <span>{stats.totalMembers} üye bulundu</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Gelişmiş Arama
            </button>
            
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Search Stats Bar */}
      {(stats.hasActiveFilters || stats.totalMembers > 0) && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {stats.hasActiveFilters && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Filtreli Arama
                </span>
              )}
              {stats.isSearching && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-2"></div>
                  Aranıyor...
                </span>
              )}
            </div>
            
            {stats.totalMembers > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{stats.totalMembers}</span> üye bulundu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;
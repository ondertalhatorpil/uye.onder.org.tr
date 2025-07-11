// src/pages/components/DernekHeader.jsx
import React from 'react';
import { FiFilter, FiRefreshCw, FiGrid, FiList } from 'react-icons/fi';

const DernekHeader = ({
  filters,
  filteredDernekler,
  showFilters,
  setShowFilters,
  refreshing,
  onRefresh,
  viewMode,
  setViewMode
}) => {
  const getLocationText = () => {
    if (filters.il && filters.ilce) {
      return `${filters.il} - ${filters.ilce}`;
    } else if (filters.il) {
      return filters.il;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.il ? `${filters.il} Dernekleri` : 'Dernekler'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span>
                {getLocationText() && (
                  <>
                    <span className="font-medium">{getLocationText()}</span> bölgesinde{' '}
                  </>
                )}
                toplamda <span className="font-semibold text-red-600">{filteredDernekler.length}</span> dernek bulundu
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              showFilters
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filtrele
          </button>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DernekHeader;
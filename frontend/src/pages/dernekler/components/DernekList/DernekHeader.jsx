import React from 'react';
import { FiFilter, FiRefreshCw, FiGrid, FiList } from 'react-icons/fi';

const DernekHeader = ({
  filters,
  filteredDernekler,
  showFilters,
  setShowFilters,
  refreshing,
  onRefresh,
  viewMode, // Not used in this component currently, but kept for future use
  setViewMode // Not used in this component currently, but kept for future use
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
    <div className=" rounded-2xl shadow-xl p-6 mb-8"> {/* Dark background, border, shadow, padding */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-3xl font-bold text-red-500 mb-2"> {/* Red header text */}
            {filters.il ? `${filters.il} Dernekleri` : 'Dernekler'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400"> {/* Lighter gray text */}
            <div className="flex items-center">
              <span>
                {getLocationText() && (
                  <>
                    <span className="font-medium text-white">{getLocationText()}</span> bölgesinde{' '} {/* White for location name */}
                  </>
                )}
                toplamda <span className="font-semibold text-red-400">{filteredDernekler.length}</span> dernek bulundu {/* Lighter red for count */}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all shadow-md ${ /* Rounded-xl, shadow-md */
              showFilters
                ? 'bg-red-800 text-red-200 border border-red-700' // Darker red active state
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' // Dark gray inactive state
            }`}
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filtrele
          </button>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md disabled:opacity-50" // Rounded-xl, shadow-md
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
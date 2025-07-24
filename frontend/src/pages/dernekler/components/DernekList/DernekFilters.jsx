import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const DernekFilters = ({
  showFilters,
  filters,
  options,
  onFilterChange,
  onClearFilters
}) => {
  if (!showFilters) return null;

  return (
    <div className="rounded-2xl shadow-xl p-6 mb-8 animate-in slide-in-from-top duration-300"> {/* Dark background, border, shadow, padding */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Arama Kutusu */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2"> {/* Light gray text */}
            Dernek Ara
          </label>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" /> {/* Light gray icon */}
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Dernek adı veya başkan adı ara..."
              className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all bg-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        
        {/* İl Seçimi */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2"> {/* Light gray text */}
            İl
          </label>
          <select
            value={filters.il}
            onChange={(e) => onFilterChange('il', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all bg-gray-700 text-white"
          >
            <option value="">Tüm İller</option>
            {options.iller.map(il => (
              <option key={il} value={il}>{il}</option>
            ))}
          </select>
        </div>
        
        {/* İlçe Seçimi */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2"> {/* Light gray text */}
            İlçe
          </label>
          <select
            value={filters.ilce}
            onChange={(e) => onFilterChange('ilce', e.target.value)}
            disabled={!filters.il}
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all bg-gray-700 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed" 
          >
            <option value="">Tüm İlçeler</option>
            {options.ilceler.map(ilce => (
              <option key={ilce} value={ilce}>{ilce}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Filter Actions */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onClearFilters}
          className="flex items-center px-4 py-2 text-red-300 hover:text-red-200 font-medium transition-colors" 
        >
          <FiX className="mr-2 h-4 w-4 text-red-400" /> {/* Red icon */}
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
};

export default DernekFilters;
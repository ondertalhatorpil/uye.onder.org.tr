import React from 'react';
import { FiFilter, FiMapPin, FiBriefcase, FiHome, FiTrash2 } from 'react-icons/fi';

const AdvancedFilters = ({ filters, options, onFilterChange, onClearFilters }) => {
  const filterSections = [
    {
      title: 'Mesleki Bilgiler',
      icon: FiBriefcase,
      color: 'blue',
      fields: [
        {
          key: 'sektor',
          label: 'Sektör',
          type: 'select',
          options: options.sektorler,
          placeholder: 'Tüm Sektörler'
        },
        {
          key: 'meslek',
          label: 'Meslek',
          type: 'input',
          placeholder: 'Örn: Yazılım Mühendisi'
        },
        {
          key: 'komisyon',
          label: 'Komisyon',
          type: 'select',
          options: options.komisyonlar,
          placeholder: 'Tüm Komisyonlar'
        }
      ]
    },
    {
      title: 'Lokasyon',
      icon: FiMapPin,
      color: 'green',
      fields: [
        {
          key: 'il',
          label: 'İl',
          type: 'select',
          options: options.iller,
          placeholder: 'Tüm İller'
        },
        {
          key: 'ilce',
          label: 'İlçe',
          type: 'select',
          options: options.ilceler,
          placeholder: 'Tüm İlçeler',
          disabled: !filters.il
        }
      ]
    },
    {
      title: 'Dernek Bilgisi',
      icon: FiHome,
      color: 'purple',
      fields: [
        {
          key: 'dernek',
          label: 'Dernek',
          type: 'input',
          placeholder: 'Dernek adı'
        }
      ]
    }
  ];

  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'blue': return { bg: 'bg-blue-800', text: 'text-blue-200', border: 'border-blue-700' }; // Koyu temaya uygun renkler
      case 'green': return { bg: 'bg-green-800', text: 'text-green-200', border: 'border-green-700' };
      case 'purple': return { bg: 'bg-purple-800', text: 'text-purple-200', border: 'border-purple-700' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700' };
    }
  };

  const renderField = (field) => {
    const baseClassName = "block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 bg-gray-800 text-white placeholder-gray-500 text-sm sm:text-base";
    
    if (field.type === 'select') {
      return (
        <select
          value={filters[field.key]}
          onChange={(e) => onFilterChange(field.key, e.target.value)}
          disabled={field.disabled}
          className={`${baseClassName} ${field.disabled ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-gray-800'}`}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={filters[field.key]}
        onChange={(e) => onFilterChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={baseClassName}
      />
    );
  };

  const hasActiveFilters = Object.values(filters).some(value => value && (typeof value !== 'string' || value.trim() !== ''));

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Ana kapsayıcı stili */}
      <div className="px-4 py-5 sm:px-6 sm:py-6"> {/* Responsive padding */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8"> {/* Responsive hizalama ve boşluk */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-0"> {/* Mobil boşluk */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-purple-800 flex items-center justify-center flex-shrink-0"> {/* Boyut, yuvarlatma, renk */}
              <FiFilter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-200" /> {/* İkon boyutu ve rengi */}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">Gelişmiş Arama Filtreleri</h2> {/* Font boyutu ve rengi */}
              <p className="text-gray-400 text-sm">Daha spesifik sonuçlar için filtreleri kullanın</p> {/* Font boyutu ve rengi */}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-red-300 bg-[#FA2C37] rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors border border-red-700 w-full sm:w-auto justify-center"
            >
              <FiTrash2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {/* İkon boyutu */}
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Responsive grid ve boşluk */}
          {filterSections.map((section) => {
            const colors = getColorClasses(section.color);
            return (
              <div key={section.title} className="space-y-4 sm:space-y-6"> {/* Mobil boşluk */}
                {/* Section Header */}
                <div className="flex items-center gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-gray-700"> {/* Mobil boşluk */}
                  <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md sm:rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}> {/* Boyut, yuvarlatma */}
                    <section.icon className={`h-4 w-4 sm:h-4 w-4 ${colors.text}`} /> {/* İkon boyutu */}
                  </div>
                  <h3 className="font-semibold text-white text-base sm:text-lg">{section.title}</h3> {/* Font boyutu ve rengi */}
                </div>

                {/* Fields */}
                <div className="space-y-3 sm:space-y-4"> {/* Mobil boşluk */}
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label htmlFor={field.key} className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2"> {/* Font boyutu ve rengi */}
                        {field.label}
                      </label>
                      {renderField(field)}
                      {field.key === 'ilce' && !filters.il && (
                        <p className="text-xs text-gray-500 mt-1">
                          Önce il seçimi yapın
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-700 rounded-lg sm:rounded-xl border border-gray-600"> {/* Responsive padding, arka plan, yuvarlatma, kenarlık */}
            <h4 className="text-sm font-medium text-white mb-2 sm:mb-3">Aktif Filtreler:</h4> {/* Font boyutu ve rengi */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (typeof value === 'string' && value.trim() === '')) return null;
                
                const labelMap = {
                  name: 'İsim',
                  sektor: 'Sektör',
                  meslek: 'Meslek',
                  il: 'İl',
                  ilce: 'İlçe',
                  dernek: 'Dernek',
                  komisyon: 'Komisyon'
                };

                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-700 text-red-100 border border-red-600" 
                  >
                    {labelMap[key]}: {value}
                    <button
                      onClick={() => onFilterChange(key, '')}
                      className="ml-1.5 text-red-200 hover:text-red-100 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
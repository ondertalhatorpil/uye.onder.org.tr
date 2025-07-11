import React from 'react';
import { FiFilter, FiMapPin, FiBriefcase, FiUsers, FiHome, FiTrash2 } from 'react-icons/fi';

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

  const renderField = (field) => {
    const baseClassName = "block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200";
    
    if (field.type === 'select') {
      return (
        <select
          value={filters[field.key]}
          onChange={(e) => onFilterChange(field.key, e.target.value)}
          disabled={field.disabled}
          className={`${baseClassName} ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
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

  const hasActiveFilters = Object.values(filters).some(value => value.trim() !== '');

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiFilter className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gelişmiş Arama Filtreleri</h2>
              <p className="text-gray-600">Daha spesifik sonuçlar için filtreleri kullanın</p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filterSections.map((section) => (
            <div key={section.title} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className={`h-8 w-8 rounded-lg bg-${section.color}-100 flex items-center justify-center`}>
                  <section.icon className={`h-4 w-4 text-${section.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
          ))}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xs">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Aktif Filtreler:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value.trim()) return null;
                
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
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-red-200 text-red-800"
                  >
                    {labelMap[key]}: {value}
                    <button
                      onClick={() => onFilterChange(key, '')}
                      className="ml-2 hover:text-blue-600"
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
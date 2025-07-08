import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { userService, constantsService } from '../../services/api';
import { 
  FiSearch, FiFilter, FiUser, FiMapPin, 
  FiGrid, FiBriefcase, FiPhone, FiMail,
  FiRefreshCw, FiUsers, FiHome
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UyeSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [uyeler, setUyeler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    sektor: searchParams.get('sektor') || '',
    meslek: searchParams.get('meslek') || '',
    il: searchParams.get('il') || '',
    ilce: searchParams.get('ilce') || '',
    dernek: searchParams.get('dernek') || '',
    komisyon: searchParams.get('komisyon') || ''
  });

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Options for dropdowns
  const [options, setOptions] = useState({
    iller: [],
    ilceler: [],
    sektorler: [],
    komisyonlar: []
  });

  // Üyeleri ara
  const searchUsers = async (searchFilters = filters) => {
    if (!searchFilters.name && !searchFilters.sektor && !searchFilters.meslek && 
        !searchFilters.il && !searchFilters.dernek && !searchFilters.komisyon) {
      setUyeler([]);
      return;
    }

    try {
      setLoading(true);
      
      // Boş değerleri filtrele
      const cleanFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(([_, value]) => value.trim() !== '')
      );

      const response = await userService.searchUsers(cleanFilters);
      
      if (response.success) {
        setUyeler(response.data || []);
      }
    } catch (error) {
      console.error('User search error:', error);
      toast.error('Üye arama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Options'ları yükle
  const loadOptions = async () => {
    try {
      const [iller, sektorler, komisyonlar] = await Promise.all([
        constantsService.getIller(),
        constantsService.getSektorler(),
        constantsService.getKomisyonlar()
      ]);

      setOptions({
        iller: iller.data || [],
        ilceler: [],
        sektorler: sektorler.data || [],
        komisyonlar: komisyonlar.data || []
      });
    } catch (error) {
      console.error('Options loading error:', error);
    }
  };

  // İlçeleri yükle
  const loadIlceler = async (il) => {
    if (!il) {
      setOptions(prev => ({ ...prev, ilceler: [] }));
      return;
    }

    try {
      const response = await constantsService.getIlceler(il);
      setOptions(prev => ({
        ...prev,
        ilceler: response.data || []
      }));
    } catch (error) {
      console.error('İlçeler loading error:', error);
    }
  };

  // Sayfa yüklendiğinde
  useEffect(() => {
    loadOptions();
    
    // URL'den gelen parametrelerle arama yap
    if (Object.values(filters).some(value => value.trim() !== '')) {
      searchUsers(filters);
      setShowFilters(true);
    }
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    loadIlceler(filters.il);
    if (filters.il && filters.ilce) {
      setFilters(prev => ({ ...prev, ilce: '' }));
    }
  }, [filters.il]);

  // Filter değişikliği - debounced search
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // URL'i güncelle
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val.trim() !== '') {
        newSearchParams.set(key, val);
      }
    });
    setSearchParams(newSearchParams);

    // Debounced search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchUsers(newFilters);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Hızlı arama
  const handleQuickSearch = () => {
    searchUsers();
  };

  // Filtreleri temizle
  const clearFilters = () => {
    const emptyFilters = {
      name: '',
      sektor: '',
      meslek: '',
      il: '',
      ilce: '',
      dernek: '',
      komisyon: ''
    };
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
    setUyeler([]);
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    searchUsers().finally(() => setRefreshing(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Üye Arama</h1>
          <p className="text-gray-600">
            Topluluktan üyeleri keşfedin ve iletişime geçin
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters 
                ? 'border-blue-300 bg-blue-50 text-blue-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Gelişmiş Arama
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="İsim veya soyisim ile ara..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>
          <button
            onClick={handleQuickSearch}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Ara'
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sektör
              </label>
              <select
                value={filters.sektor}
                onChange={(e) => handleFilterChange('sektor', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Sektörler</option>
                {options.sektorler.map(sektor => (
                  <option key={sektor} value={sektor}>{sektor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meslek
              </label>
              <input
                type="text"
                value={filters.meslek}
                onChange={(e) => handleFilterChange('meslek', e.target.value)}
                placeholder="Örn: Yazılım Mühendisi"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İl
              </label>
              <select
                value={filters.il}
                onChange={(e) => handleFilterChange('il', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm İller</option>
                {options.iller.map(il => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlçe
              </label>
              <select
                value={filters.ilce}
                onChange={(e) => handleFilterChange('ilce', e.target.value)}
                disabled={!filters.il}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Tüm İlçeler</option>
                {options.ilceler.map(ilce => (
                  <option key={ilce} value={ilce}>{ilce}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dernek
              </label>
              <input
                type="text"
                value={filters.dernek}
                onChange={(e) => handleFilterChange('dernek', e.target.value)}
                placeholder="Dernek adı"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komisyon
              </label>
              <select
                value={filters.komisyon}
                onChange={(e) => handleFilterChange('komisyon', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Komisyonlar</option>
                {options.komisyonlar.map(komisyon => (
                  <option key={komisyon} value={komisyon}>{komisyon}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Results Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Arama Sonuçları
              {uyeler.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({uyeler.length} üye bulundu)
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Aranıyor...</p>
              </div>
            </div>
          ) : uyeler.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uyeler.map((uye) => (
                <div key={uye.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* User Avatar & Name */}
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {uye.isim?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">
                        {uye.isim} {uye.soyisim}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {uye.meslek || 'Meslek belirtilmemiş'}
                      </p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-2 mb-4">
                    {uye.sektor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiBriefcase className="mr-2 h-4 w-4" />
                        {uye.sektor}
                      </div>
                    )}
                    
                    {(uye.il || uye.ilce) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        {uye.il}{uye.ilce && `, ${uye.ilce}`}
                      </div>
                    )}
                    
                    {uye.gonullu_dernek && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiHome className="mr-2 h-4 w-4" />
                        <span className="truncate">{uye.gonullu_dernek}</span>
                      </div>
                    )}

                    {uye.calisma_komisyon && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUsers className="mr-2 h-4 w-4" />
                        {uye.calisma_komisyon}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/uyeler/${uye.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                    
                    {uye.telefon && (
                      <a
                        href={`tel:${uye.telefon}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <FiPhone className="mr-2 h-4 w-4" />
                        Ara
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.values(filters).some(value => value.trim() !== '') ? (
            <div className="text-center py-12">
              <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arama kriterlerine uygun üye bulunamadı
              </h3>
              <p className="text-gray-500 mb-6">
                Farklı kriterlerle arama yapabilir veya filtreleri temizleyebilirsiniz.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Üye aramaya başlayın
              </h3>
              <p className="text-gray-500 mb-6">
                İsim, sektör, meslek veya lokasyon bilgileri ile üyeleri bulabilirsiniz.
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Gelişmiş Arama Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UyeSearch;
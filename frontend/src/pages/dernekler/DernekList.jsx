import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dernekService, constantsService } from '../../services/api';
import { 
  FiMapPin, FiUsers, FiPhone, FiCalendar, 
  FiSearch, FiFilter, FiGrid, FiList,
  FiRefreshCw, FiExternalLink, FiUser
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const DernekList = () => {
  const [dernekler, setDernekler] = useState([]);
  const [filteredDernekler, setFilteredDernekler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    il: 'İstanbul', // Varsayılan olarak İstanbul seçili
    ilce: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Options for filters
  const [options, setOptions] = useState({
    iller: [],
    ilceler: []
  });

  // Dernekleri getir
  const loadDernekler = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await dernekService.getDernekler();
      
      if (response.success) {
        setDernekler(response.data || []);
        setFilteredDernekler(response.data || []);
      }
    } catch (error) {
      console.error('Dernekler loading error:', error);
      toast.error('Dernekler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlleri yükle
  const loadIller = async () => {
    try {
      const response = await constantsService.getIller();
      setOptions(prev => ({
        ...prev,
        iller: response.data || []
      }));
    } catch (error) {
      console.error('İller loading error:', error);
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
    loadDernekler();
    loadIller();
    // İstanbul seçili olduğu için ilçeleri de yükle
    loadIlceler('İstanbul');
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    loadIlceler(filters.il);
    if (filters.il && filters.ilce) {
      setFilters(prev => ({ ...prev, ilce: '' }));
    }
  }, [filters.il]);

  // Filtreleme
  useEffect(() => {
    let filtered = [...dernekler];

    // Arama filtresi
    if (filters.search) {
      filtered = filtered.filter(dernek =>
        dernek.dernek_adi.toLowerCase().includes(filters.search.toLowerCase()) ||
        dernek.dernek_baskani?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // İl filtresi
    if (filters.il) {
      filtered = filtered.filter(dernek => dernek.il === filters.il);
    }

    // İlçe filtresi
    if (filters.ilce) {
      filtered = filtered.filter(dernek => dernek.ilce === filters.ilce);
    }

    setFilteredDernekler(filtered);
  }, [filters, dernekler]);

  // Filter değişikliği
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      search: '',
      il: 'İstanbul', // Temizlendiğinde de İstanbul'a dön
      ilce: ''
    });
  };

  // Refresh
  const handleRefresh = () => {
    loadDernekler(true);
  };

  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `http://localhost:3001/uploads/dernek-logos/${logoPath}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dernekler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.il ? `${filters.il} Dernekleri` : 'Dernekler'}
          </h1>
          <p className="text-gray-600">
            {filters.il && (
              <>
                {filters.ilce ? `${filters.il} - ${filters.ilce}` : filters.il} bölgesinde{' '}
              </>
            )}
            toplamda <span className="font-medium">{filteredDernekler.length}</span> dernek bulundu
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filtrele
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FiList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dernek Ara
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Dernek adı veya başkan adı ara..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
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
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Dernekler Grid/List */}
      {filteredDernekler.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredDernekler.map((dernek) => (
            <div
              key={dernek.id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Dernek Logo */}
              <div className={viewMode === 'list' ? 'flex-shrink-0' : ''}>
                <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'h-48'} bg-gray-100 flex items-center justify-center`}>
                  {dernek.dernek_logosu ? (
                    <img
                      src={getDernekLogoUrl(dernek.dernek_logosu)}
                      alt={dernek.dernek_adi}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${dernek.dernek_logosu ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    <FiGrid className={`${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'} text-gray-400`} />
                  </div>
                </div>
              </div>

              {/* Dernek Bilgileri */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {dernek.dernek_adi}
                    </h3>
                    
                    {dernek.dernek_baskani && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FiUser className="mr-2 h-4 w-4" />
                        {dernek.dernek_baskani}
                      </div>
                    )}
                    
                    {(dernek.il || dernek.ilce) && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                      </div>
                    )}
                    
                    {dernek.dernek_telefon && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FiPhone className="mr-2 h-4 w-4" />
                        {dernek.dernek_telefon}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <FiUsers className="mr-2 h-4 w-4" />
                      {dernek.uye_sayisi || 0} üye
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/dernekler/${encodeURIComponent(dernek.dernek_adi)}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FiExternalLink className="mr-1 h-3 w-3" />
                        Görüntüle
                      </Link>
                      <Link
                        to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiUsers className="mr-1 h-3 w-3" />
                        Üyeler
                      </Link>
                    </div>
                  )}
                </div>
                
                {viewMode === 'grid' && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/dernekler/${encodeURIComponent(dernek.dernek_adi)}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiExternalLink className="mr-2 h-4 w-4" />
                      Görüntüle
                    </Link>
                    <Link
                      to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FiUsers className="mr-2 h-4 w-4" />
                      Üyeler
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <FiGrid className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.search || filters.il || filters.ilce ? 'Arama kriterlerine uygun dernek bulunamadı' : 'Henüz dernek yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filters.search || filters.il || filters.ilce 
              ? 'Farklı kriterlerle arama yapabilir veya filtreleri temizleyebilirsiniz.'
              : 'Sistem henüz kurulum aşamasında.'
            }
          </p>
          {(filters.search || filters.il || filters.ilce) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DernekList;
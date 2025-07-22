import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService, constantsService } from '../../services';
import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import SearchHeader from './components/UyeSearch/SearchHeader';
import QuickSearchBar from './components/UyeSearch/QuickSearchBar';
import AdvancedFilters from './components/UyeSearch/AdvancedFilters';
import SearchResults from './components/UyeSearch/SearchResults';

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

  // Stats for header
  const searchStats = {
    totalMembers: uyeler.length,
    hasActiveFilters: Object.values(filters).some(value => value.trim() !== ''),
    isSearching: loading
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Header */}
        <SearchHeader 
          stats={searchStats}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {/* Quick Search Bar */}
        <QuickSearchBar
          searchValue={filters.name}
          onSearchChange={(value) => handleFilterChange('name', value)}
          onQuickSearch={handleQuickSearch}
          loading={loading}
        />

        {/* Advanced Filters */}
        {showFilters && (
          <AdvancedFilters
            filters={filters}
            options={options}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        )}

        {/* Search Results */}
        <SearchResults
          uyeler={uyeler}
          loading={loading}
          filters={filters}
          onClearFilters={clearFilters}
          onShowFilters={() => setShowFilters(true)}
        />
      </div>
    </div>
  );
};

export default UyeSearch;
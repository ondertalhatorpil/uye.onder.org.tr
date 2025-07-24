import React, { useState, useEffect, useRef } from 'react'; 
import { useSearchParams } from 'react-router-dom';
import { userService, constantsService } from '../../services'; 
import { toast } from 'react-hot-toast'; 

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
  const searchTimeoutRef = useRef(null); // useRef ile timeout'u yöneteceğiz

  // Options for dropdowns
  const [options, setOptions] = useState({
    iller: [],
    ilceler: [],
    sektorler: [],
    komisyonlar: []
  });

  // Üyeleri ara fonksiyonu
  const searchUsers = async (currentFilters) => {
    // Tüm filtre değerlerinin boş olup olmadığını kontrol et
    const allFiltersEmpty = Object.values(currentFilters).every(value => !value || (typeof value === 'string' && value.trim() === ''));
    
    // Eğer tüm filtreler boşsa ve daha önce hiç arama yapılmadıysa (veya sonuçlar boşsa), API'ye istek gönderme.
    // Ancak QuickSearchBar'dan tetikleniyorsa veya filtrelerden biri aktifse aramayı yap.
    // Bu mantığı, varsayılan boş aramayı engellemek için biraz daha esnek tutabiliriz.
    // Örneğin, sadece "name" filtresi varsa ama o da boşsa arama yapmayalım.
    if (allFiltersEmpty) {
      setUyeler([]); // Tüm filtreler boşsa sonuçları temizle
      setLoading(false); // Yükleme durumunu kapat
      return;
    }

    try {
      setLoading(true);
      
      // Boş değerleri filtrele ve API'ye gönderme
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value && (typeof value !== 'string' || value.trim() !== ''))
      );

      const response = await userService.searchUsers(cleanFilters);
      
      if (response.success) {
        setUyeler(response.data || []);
      } else {
        toast.error(response.message || 'Üye arama sırasında bir sorun oluştu.');
      }
    } catch (error) {
      console.error('User search error:', error);
      toast.error('Üye arama sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Options'ları yükle
  const loadOptions = async () => {
    try {
      const [illerRes, sektorlerRes, komisyonlarRes] = await Promise.all([
        constantsService.getIller(),
        constantsService.getSektorler(),
        constantsService.getKomisyonlar()
      ]);

      setOptions({
        iller: illerRes.data || [],
        ilceler: [], // Başlangıçta ilçeler boş
        sektorler: sektorlerRes.data || [],
        komisyonlar: komisyonlarRes.data || []
      });
      
    } catch (error) {
      console.error('Options loading error:', error);
      toast.error('Seçenekler yüklenirken hata oluştu.');
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
      toast.error('İlçeler yüklenirken hata oluştu.');
    }
  };

  // Sayfa yüklendiğinde ve URL'den gelen parametrelerle arama yap
  useEffect(() => {
    loadOptions();
    
    // filters state'i ilk render'da searchParams'tan doğru şekilde alıyor
    // Bu kontrol ile sadece URL'de bir arama parametresi varsa ilk aramayı tetikliyoruz.
    const initialFilterValues = Object.values(filters);
    const hasInitialSearchParams = initialFilterValues.some(value => value && (typeof value !== 'string' || value.trim() !== ''));

    if (hasInitialSearchParams) {
      searchUsers(filters);
      setShowFilters(true); // Gelişmiş filtreleri aç
    }
  }, []); // Sadece ilk render'da çalışır

  // İl değiştiğinde ilçeleri yükle ve ilçe filtresini temizle
  useEffect(() => {
    loadIlceler(filters.il);
  }, [filters.il, searchParams]); // searchParams bağımlılığı ilçe filtresinin URL'den gelip gelmediğini kontrol etmek için eklendi


  // Filter değişikliği ve debounced arama
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // URL'i güncelle
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && (typeof val !== 'string' || val.trim() !== '')) { // null/undefined ve boş stringleri atla
        newSearchParams.set(key, val);
      }
    });
    setSearchParams(newSearchParams);

    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(newFilters);
    }, 500); // 500ms gecikme
  };

  // Hızlı arama için direkt arama fonksiyonunu çağır
  const handleQuickSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchUsers(filters); // Mevcut filtrelerle arama yap
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
    setSearchParams(new URLSearchParams()); // URL'deki tüm parametreleri temizle
    setUyeler([]); // Sonuçları temizle
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Mevcut aktif filtrelerle tekrar arama yap
    searchUsers(filters).finally(() => setRefreshing(false));
  };

  // Header için istatistikler
  // Artık QuickSearchBar'a doğrudan filter prop'unu göndermeyeceğiz.
  // Gerekli bilgileri props olarak ileteceğiz.
  const hasActiveFiltersInState = Object.values(filters).some(value => value && (typeof value !== 'string' || value.trim() !== ''));

  return (
    <div className="min-h-screen text-white"> {/* Genel arka plan ve metin rengi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8"> {/* Responsive padding ve boşluk */}

        {/* Quick Search Bar */}
        <QuickSearchBar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          searchValue={filters.name}
          onSearchChange={(value) => handleFilterChange('name', value)}
          onQuickSearch={handleQuickSearch}
          loading={loading}
          hasActiveFilters={hasActiveFiltersInState} 
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
          filters={filters} // filters objesini doğrudan geçirmeye devam edebiliriz
          onClearFilters={clearFilters}
          onShowFilters={() => setShowFilters(true)}
        />
      </div>
    </div>
  );
};

export default UyeSearch;
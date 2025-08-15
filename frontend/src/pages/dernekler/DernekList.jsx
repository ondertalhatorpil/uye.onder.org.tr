import { useState, useEffect } from 'react';
import { dernekService, constantsService } from '../../services';
import { toast } from 'react-hot-toast';
import DernekHeader from './components/DernekList/DernekHeader'; // Bu bileşenler de güncellenecek
import DernekFilters from './components/DernekList/DernekFilters'; // Bu bileşenler de güncellenecek
import DernekGrid from './components/DernekList/DernekGrid'; // Bu bileşenler de güncellenecek

const DernekList = () => {
  const [dernekler, setDernekler] = useState([]);
  const [filteredDernekler, setFilteredDernekler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    il: 'İSTANBUL', // Varsayılan olarak İstanbul seçili
    ilce: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Options for filters
  const [options, setOptions] = useState({
    iller: [],
    ilceler: []
  });

  // Load data on component mount
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
        dernek.dernek_adi?.toLowerCase().includes(filters.search.toLowerCase()) ||
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

  // Data loading functions
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

  // Event handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      il: 'İstanbul', // Temizlendiğinde de İstanbul'a dön
      ilce: ''
    });
  };

  const handleRefresh = () => {
    loadDernekler(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div> 
          <p className="mt-4 text-lg text-gray-400">Dernekler yükleniyor...</p> 
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        
        
        <DernekHeader
          filters={filters}
          filteredDernekler={filteredDernekler}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
       
        <DernekFilters
          showFilters={showFilters}
          filters={filters}
          options={options}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        <DernekGrid
          dernekler={filteredDernekler}
          viewMode={viewMode}
          filters={filters}
          onClearFilters={clearFilters}
        />

      </div>
    </div>
  );
};

export default DernekList;
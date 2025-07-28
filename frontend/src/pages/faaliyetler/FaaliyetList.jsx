import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService } from '../../services';
import { FiPlus, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import FaaliyetFilters from './components/FaaliyetFilters';
import FaaliyetStats from './components/FaaliyetStats';
import FaaliyetCard from './components/FaaliyetCard';
import FaaliyetEmptyState from './components/FaaliyetEmptyState';
import LoadingSpinner from './components/LoadingSpinner';

const FaaliyetList = () => {
  const { user } = useAuth();
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    il: '',
    ilce: '',
    dernek: '',
    baslangic_tarihi: '',
    bitis_tarihi: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadFaaliyetler = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await faaliyetService.getFaaliyetler(filters);
      
      if (response.success) {
        if (filters.page === 1 || isRefresh) {
          setFaaliyetler(response.data || []);
        } else {
          setFaaliyetler(prev => [...prev, ...(response.data || [])]);
        }
        
        setPagination(response.pagination || {
          total: response.data?.length || 0,
          page: filters.page,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Faaliyetler loading error:', error);
      toast.error('Faaliyetler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFaaliyetler();
  }, [filters]);

  const handleRefresh = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadFaaliyetler(true);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      il: '',
      ilce: '',
      dernek: '',
      baslangic_tarihi: '',
      bitis_tarihi: ''
    });
    setShowFilters(false);
  };

  if (loading && faaliyetler.length === 0) {
    return <LoadingSpinner message="Faaliyetler yükleniyor..." />;
  }

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 lg:max-w-4xl lg:p-8 "> {/* max-w-full ve rounded-none mobile için */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-700"> {/* Mobil dikey, sm sonrası yatay */}
        <div className="mb-4 sm:mb-0"> {/* Mobil alta boşluk */}
          <h1 className="text-xl sm:text-2xl font-bold text-red-500">Faaliyetler</h1> {/* Mobil font küçültme */}
          <p className="text-sm text-gray-400">Topluluktan son faaliyetler</p> {/* Mobil font küçültme */}
        </div>
        
        <div className="flex flex-wrap justify-end gap-2 sm:space-x-3"> {/* Mobil wrap ve gap, sm sonrası space-x */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors shadow-md"
          >
            <FiFilter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {/* İkon boyutu mobile özel */}
            Filtrele
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-700 rounded-xl text-xs sm:text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-md"
          >
            <FiRefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          
          <Link
            to="/faaliyetler/create"
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md"
          >
            <FiPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Paylaş
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <FaaliyetFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Stats */}
      <FaaliyetStats pagination={pagination} />

      {/* Faaliyet Listesi */}
      <div className="space-y-4 mt-6 sm:space-y-6 sm:mt-8"> 
        {faaliyetler.length > 0 ? (
          faaliyetler.map((faaliyet) => (
            <FaaliyetCard key={faaliyet.id} faaliyet={faaliyet} />
          ))
        ) : (
          <FaaliyetEmptyState />
        )}
      </div>

      {/* Load More Button */}
      {pagination.page < pagination.totalPages && (
        <div className="text-center mt-8 sm:mt-10"> 
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gray-800 text-gray-300 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-lg transform hover:scale-[1.02] text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                Daha Fazla Göster
                <span className="ml-2 text-xs sm:text-sm text-gray-500">
                  ({pagination.total - faaliyetler.length} kaldı)
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FaaliyetList;
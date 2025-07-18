import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService } from '../../services/api';
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

  // Faaliyetleri getir
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
          // Sayfalama - mevcut listeye ekle
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

  // Sayfa yüklendiğinde faaliyetleri getir
  useEffect(() => {
    loadFaaliyetler();
  }, [filters]);

  // Refresh
  const handleRefresh = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadFaaliyetler(true);
  };

  // Load More (Infinite Scroll)
  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Filter değişikliği
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Filtreleri temizle
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

  // Loading state
  if (loading && faaliyetler.length === 0) {
    return <LoadingSpinner message="Faaliyetler yükleniyor..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-red-600">Faaliyetler</h1>
          <p className="text-gray-600">Topluluktan son faaliyetler</p>
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
          
          <Link
            to="/faaliyetler/create"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Paylaş
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <FaaliyetFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Stats */}
      <FaaliyetStats pagination={pagination} />

      {/* Faaliyet Listesi */}
      <div className="space-y-6">
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
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                Daha Fazla Göster
                <span className="ml-2 text-sm text-gray-500">
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
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, UPLOADS_BASE_URL } from '../../services/api';
import { 
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal,
  FiCalendar, FiMapPin, FiPlus, FiFilter,
  FiRefreshCw, FiImage
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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
    dernek: ''
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

  // Tarih formatla
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  // Loading state
  if (loading && faaliyetler.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Faaliyetler yükleniyor...</p>
        </div>
      </div>
    );
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
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Paylaş
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
              <select
                value={filters.il}
                onChange={(e) => handleFilterChange({ il: e.target.value, ilce: '' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm İller</option>
                <option value="İstanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="İzmir">İzmir</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <select
                value={filters.ilce}
                onChange={(e) => handleFilterChange({ ilce: e.target.value })}
                disabled={!filters.il}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Tüm İlçeler</option>
                {filters.il === 'İstanbul' && (
                  <>
                    <option value="Kadıköy">Kadıköy</option>
                    <option value="Üsküdar">Üsküdar</option>
                    <option value="Beyoğlu">Beyoğlu</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dernek</label>
              <input
                type="text"
                value={filters.dernek}
                onChange={(e) => handleFilterChange({ dernek: e.target.value })}
                placeholder="Dernek adı ara..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setFilters({
                  page: 1,
                  limit: 10,
                  il: '',
                  ilce: '',
                  dernek: ''
                });
                setShowFilters(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{pagination.total}</span> faaliyet bulundu
          </div>
          <div className="text-sm text-gray-500">
            Sayfa {pagination.page} / {pagination.totalPages}
          </div>
        </div>
      </div>

      {/* Faaliyet Listesi */}
      <div className="space-y-6">
        {faaliyetler.length > 0 ? (
          faaliyetler.map((faaliyet) => (
            <div key={faaliyet.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* User Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {faaliyet.isim} {faaliyet.soyisim}
                        </p>
                        {faaliyet.gonullu_dernek && (
                          <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            {faaliyet.gonullu_dernek}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FiCalendar className="mr-1 h-3 w-3" />
                        {formatTimeAgo(faaliyet.created_at)}
                        {faaliyet.il && (
                          <>
                            <span className="mx-2">•</span>
                            <FiMapPin className="mr-1 h-3 w-3" />
                            {faaliyet.il}{faaliyet.ilce && `, ${faaliyet.ilce}`}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <FiMoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {faaliyet.baslik && (
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {faaliyet.baslik}
                  </h3>
                )}
                
                {faaliyet.aciklama && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {faaliyet.aciklama}
                  </p>
                )}

                {/* Images */}
                {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${
                      faaliyet.gorseller.length === 1 ? 'grid-cols-1' :
                      faaliyet.gorseller.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => {
                        const imageUrl = `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`;
                        return (
                          <div 
                            key={index} 
                            className={`relative ${
                              faaliyet.gorseller.length === 1 ? 'col-span-1' :
                              faaliyet.gorseller.length === 3 && index === 0 ? 'col-span-2' :
                              ''
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`Faaliyet ${index + 1}`}
                              className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity ${
                                faaliyet.gorseller.length === 1 ? 'h-96' : 'h-48'
                              }`}
                              onClick={() => {
                                // Resim modal'ı açılabilir
                                console.log('Image clicked:', imageUrl);
                              }}
                            />
                            {index === 3 && faaliyet.gorseller.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                  <FiImage className="h-8 w-8 mx-auto mb-1" />
                                  <span className="font-medium">
                                    +{faaliyet.gorseller.length - 4}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz faaliyet yok</h3>
            <p className="text-gray-500 mb-6">Topluluğa ilk faaliyeti sen paylaş!</p>
            <Link
              to="/faaliyetler/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Faaliyet Paylaş
            </Link>
          </div>
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
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../../services/adminApi';
import { Link } from "react-router-dom";

import { 
  FiFilter, FiSearch, FiCalendar, FiUser, FiCheck, FiX, 
  FiLoader, FiAlertCircle, FiEye, FiDownload, FiRefreshCw,
  FiFileText, FiClock, FiGrid, FiShield,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const FaaliyetOnayGecmisi = () => {
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    durum: '',
    admin_id: '',
    baslik: '',
    tarih_baslangic: '',
    tarih_bitis: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [selectedFaaliyet, setSelectedFaaliyet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchFaaliyetGecmisi();
        await fetchAdmins();
      } catch (error) {
        console.error('Init error:', error);
      }
    };
    init();
  }, [filters.page, filters.limit, filters.durum, filters.admin_id, filters.baslik, filters.tarih_baslangic, filters.tarih_bitis]); 

  const fetchFaaliyetGecmisi = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getFaaliyetOnayGecmisi(filters);
      
      console.log('API Response:', response);

      if (!response || !response.success) {
        console.error('Invalid API response:', response);
        toast.error('Geçersiz API yanıtı');
        setFaaliyetler([]);
        setPagination({});
        return;
      }

      const { data, pagination } = response;
      
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        setFaaliyetler([]);
        setPagination({});
        return;
      }

      console.log('Setting faaliyetler:', data);
      console.log('Setting pagination:', pagination);

      setFaaliyetler(data);
      setPagination(pagination || {});
      
    } catch (error) {
      toast.error('Faaliyet geçmişi yüklenirken hata oluştu');
      console.error('Fetch error:', error);
      setFaaliyetler([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await adminApi.getAllUsers({ role: 'super_admin' });
      setAdmins(response?.data?.data || []);
    } catch (error) {
      console.error('Admins fetch error:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      durum: '',
      admin_id: '',
      baslik: '',
      tarih_baslangic: '',
      tarih_bitis: '',
      page: 1,
      limit: 20
    });
  };

  const exportData = () => {
    try {
      const exportData = {
        faaliyetler,
        filters,
        pagination,
        exportDate: new Date().toISOString(),
        title: 'Faaliyet Onay Geçmişi'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faaliyet_onay_gecmisi_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Veriler dışa aktarıldı');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export işlemi başarısız');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  const getDurumBadge = (durum) => {
    const configs = {
      'onaylandi': {
        bg: 'bg-green-600/20',
        text: 'text-green-300',
        border: 'border-green-600/30',
        icon: FiCheck
      },
      'reddedildi': {
        bg: 'bg-red-600/20',
        text: 'text-red-300',
        border: 'border-red-600/30',
        icon: FiX
      },
      'beklemede': {
        bg: 'bg-orange-600/20',
        text: 'text-orange-300',
        border: 'border-orange-600/30',
        icon: FiClock
      }
    };

    const config = configs[durum] || configs['beklemede'];
    const Icon = config.icon;
    const texts = {
      'onaylandi': 'Onaylandı',
      'reddedildi': 'Reddedildi',
      'beklemede': 'Beklemede'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3" />
        {texts[durum]}
      </span>
    );
  };

  const FaaliyetRow = ({ faaliyet }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">
              {faaliyet.user_isim?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-100">
              {faaliyet.baslik || 'Başlıksız Faaliyet'}
            </div>
            <div className="text-sm text-gray-400">
              {faaliyet.user_isim} {faaliyet.user_soyisim}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-300">
          {faaliyet.gonullu_dernek ? (
            <div className="flex items-center gap-1">
              <FiGrid className="h-3 w-3 text-gray-400" />
              <span className="truncate max-w-32">{faaliyet.gonullu_dernek}</span>
            </div>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {getDurumBadge(faaliyet.durum)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-300">
        {faaliyet.admin_isim ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <FiShield className="w-3 h-3 text-blue-400" />
            </div>
            <span>{faaliyet.admin_isim} {faaliyet.admin_soyisim}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <FiCalendar className="h-3 w-3" />
          <div>
            <div>{formatDate(faaliyet.created_at).split(',')[0]}</div>
            <div className="text-xs text-gray-500">{getTimeAgo(faaliyet.created_at)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">
        {faaliyet.onay_tarihi ? (
          <div className="flex items-center gap-1">
            <FiClock className="h-3 w-3" />
            <div>
              <div>{formatDate(faaliyet.onay_tarihi).split(',')[0]}</div>
              <div className="text-xs text-gray-500">{getTimeAgo(faaliyet.onay_tarihi)}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => {
            setSelectedFaaliyet(faaliyet);
            setShowModal(true);
          }}
          className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-600/20 transition-colors"
          title="Detay Görüntüle"
        >
          <FiEye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FiFileText className="h-8 w-8" />
                Faaliyet Onay Geçmişi
              </h1>
              <p className="text-red-100">
                Onaylanmış ve reddedilmiş faaliyetlerin detaylı geçmişi
              </p>
              <div className="flex items-center gap-4 text-sm text-red-100 mt-2">
                <span>Toplam {pagination.total || 0} kayıt</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters
                    ? 'bg-white text-[#FA2C37] border-2 border-white'
                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
                }`}
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Filtrele
              </button>

              <Link
                to="/admin/faaliyetler/stats"
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                İstatistikler
              </Link>

              <Link
                to="/admin/faaliyetler/bekleyenler"
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
              >
                <FiClock className="mr-2 h-4 w-4" />
                Bekleyenler
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Filtreler</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
                <select
                  value={filters.durum}
                  onChange={(e) => handleFilterChange('durum', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                >
                  <option value="">Tümü</option>
                  <option value="onaylandi">Onaylandı</option>
                  <option value="reddedildi">Reddedildi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin</label>
                <select
                  value={filters.admin_id}
                  onChange={(e) => handleFilterChange('admin_id', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                >
                  <option value="">Tümü</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.isim} {admin.soyisim}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={filters.baslik}
                  onChange={(e) => handleFilterChange('baslik', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                  placeholder="Faaliyet ara..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç</label>
                <input
                  type="date"
                  value={filters.tarih_baslangic}
                  onChange={(e) => handleFilterChange('tarih_baslangic', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bitiş</label>
                <input
                  type="date"
                  value={filters.tarih_bitis}
                  onChange={(e) => handleFilterChange('tarih_bitis', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-gray-100">{pagination.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <FiFileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Onaylandı</p>
                <p className="text-2xl font-bold text-green-400">
                  {faaliyetler.filter(f => f.durum === 'onaylandi').length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <FiCheck className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reddedildi</p>
                <p className="text-2xl font-bold text-red-400">
                  {faaliyetler.filter(f => f.durum === 'reddedildi').length}
                </p>
              </div>
              <div className="p-3 bg-red-600/20 rounded-lg">
                <FiX className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Bu Sayfa</p>
                <p className="text-2xl font-bold text-purple-400">{faaliyetler.length}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <FiEye className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Faaliyet / Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dernek
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlem Yapan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlem Tarihi
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Detay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <FiLoader className="h-8 w-8 animate-spin text-[#FA2C37] mr-3" />
                        <span className="text-gray-400">Yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : !faaliyetler || faaliyetler.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <FiAlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Faaliyet geçmişi bulunamadı</p>
                        <p className="text-sm mt-2">Filtrelerinizi değiştirmeyi deneyin</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  faaliyetler.map((faaliyet) => (
                    <FaaliyetRow 
                      key={`faaliyet-${faaliyet.id}`}
                      faaliyet={faaliyet} 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Sayfa {filters.page} / {pagination.totalPages}
                  <span className="ml-2">(Toplam {pagination.total} kayıt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm">
                    {filters.page}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === pagination.totalPages}
                    className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedFaaliyet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-100">Faaliyet Detayı</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Başlık</h4>
                  <p className="text-gray-300">{selectedFaaliyet.baslik || 'Başlıksız'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Açıklama</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedFaaliyet.aciklama || 'Açıklama yok'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-200 mb-2">Durum</h4>
                  {getDurumBadge(selectedFaaliyet.durum)}
                </div>

                <hr className="border-gray-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Oluşturulma Tarihi</h4>
                    <p className="text-gray-300">{formatDate(selectedFaaliyet.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-200 mb-2">İşlem Tarihi</h4>
                    <p className="text-gray-300">
                      {selectedFaaliyet.onay_tarihi ? formatDate(selectedFaaliyet.onay_tarihi) : 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>

                {selectedFaaliyet.durum === 'reddedildi' && selectedFaaliyet.red_nedeni && (
                  <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                    <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                      <FiAlertCircle className="h-4 w-4" />
                      Red Nedeni
                    </h4>
                    <p className="text-red-200 leading-relaxed">
                      {selectedFaaliyet.red_nedeni}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FaaliyetOnayGecmisi;
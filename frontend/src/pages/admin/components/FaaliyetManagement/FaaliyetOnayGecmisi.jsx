import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../../services/adminApi';
import { Link } from "react-router-dom";

import { 
  FiFilter, FiSearch, FiCalendar, FiUser, FiCheck, FiX, 
  FiLoader, FiAlertCircle, FiEye, FiDownload, FiRefreshCw
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

    // Response kontrolünü düzelt
    if (!response || !response.success) {
      console.error('Invalid API response:', response);
      toast.error('Geçersiz API yanıtı');
      setFaaliyetler([]);
      setPagination({});
      return;
    }

    // data ve pagination doğrudan response içinde
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDurumBadge = (durum) => {
    const colors = {
      'onaylandi': 'bg-green-100 text-green-800',
      'reddedildi': 'bg-red-100 text-red-800',
      'beklemede': 'bg-yellow-100 text-yellow-800'
    };
    const texts = {
      'onaylandi': 'Onaylandı',
      'reddedildi': 'Reddedildi',
      'beklemede': 'Beklemede'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[durum]}`}>
        {durum === 'onaylandi' && <FiCheck className="w-3 h-3 mr-1" />}
        {durum === 'reddedildi' && <FiX className="w-3 h-3 mr-1" />}
        {texts[durum]}
      </span>
    );
  };

  const FaaliyetRow = ({ faaliyet }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {faaliyet.baslik || 'Başlıksız Faaliyet'}
            </div>
            <div className="text-sm text-gray-500">
              {faaliyet.user_isim} {faaliyet.user_soyisim}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{faaliyet.gonullu_dernek || 'Belirtilmemiş'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getDurumBadge(faaliyet.durum)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {faaliyet.admin_isim ? `${faaliyet.admin_isim} ${faaliyet.admin_soyisim}` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(faaliyet.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {faaliyet.onay_tarihi ? formatDate(faaliyet.onay_tarihi) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => {
            setSelectedFaaliyet(faaliyet);
            setShowModal(true);
          }}
          className="text-blue-600 hover:text-blue-900"
        >
          <FiEye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Faaliyet Onay Geçmişi
            </h1>
            <p className="text-white">
              Onaylanmış ve reddedilmiş faaliyetlerin detaylı geçmişi
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/faaliyetler/stats"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              İstatistikler
            </Link>
            <Link
              to="/admin/faaliyetler/bekleyenler"
              className="px-4 py-2 bg-gray-200 text-red-700 rounded hover:bg-gray-300 transition"
            >
              Onay Bekleyenler
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-red-700 rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Durum
              </label>
              <select
                value={filters.durum}
                onChange={(e) => handleFilterChange('durum', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                <option value="onaylandi">Onaylandı</option>
                <option value="reddedildi">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Admin
              </label>
              <select
                value={filters.admin_id}
                onChange={(e) => handleFilterChange('admin_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-white mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={filters.baslik}
                onChange={(e) => handleFilterChange('baslik', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Faaliyet ara..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.tarih_baslangic}
                onChange={(e) => handleFilterChange('tarih_baslangic', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.tarih_bitis}
                onChange={(e) => handleFilterChange('tarih_bitis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-red-900 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-red-100">
            <thead className="bg-red-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Faaliyet / Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Dernek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  İşlem Yapan Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Oluşturulma Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  İşlem Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-200 divide-y divide-gray-400">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <FiLoader className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500">Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : !faaliyetler || faaliyetler.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Faaliyet geçmişi bulunamadı</p>
                  </td>
                </tr>
              ) : (
                faaliyetler.map((faaliyet) => (
                  <FaaliyetRow 
    key={`faaliyet-${faaliyet.id}`} // Key'i daha benzersiz hale getirin
    faaliyet={faaliyet} 
  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{pagination.total}</span> sonuç
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {filters.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedFaaliyet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Faaliyet Detayı</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Başlık</h4>
                <p className="text-gray-700">{selectedFaaliyet.baslik || 'Başlıksız'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
                <p className="text-gray-700">{selectedFaaliyet.aciklama || 'Açıklama yok'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Durum</h4>
                {getDurumBadge(selectedFaaliyet.durum)}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Paylaşan</h4>
                <p className="text-gray-700">
                  {selectedFaaliyet.user_isim} {selectedFaaliyet.user_soyisim}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dernek</h4>
                <p className="text-gray-700">{selectedFaaliyet.gonullu_dernek || 'Belirtilmemiş'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">İşlem Yapan Admin</h4>
                <p className="text-gray-700">
                  {selectedFaaliyet.admin_isim 
                    ? `${selectedFaaliyet.admin_isim} ${selectedFaaliyet.admin_soyisim}`
                    : 'Belirtilmemiş'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Oluşturulma Tarihi</h4>
                <p className="text-gray-700">{formatDate(selectedFaaliyet.created_at)}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">İşlem Tarihi</h4>
                <p className="text-gray-700">
                  {selectedFaaliyet.onay_tarihi ? formatDate(selectedFaaliyet.onay_tarihi) : 'Belirtilmemiş'}
                </p>
              </div>

              {selectedFaaliyet.durum === 'reddedildi' && selectedFaaliyet.red_nedeni && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Red Nedeni</h4>
                  <p className="text-red-700 bg-red-50 p-3 rounded-md">
                    {selectedFaaliyet.red_nedeni}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaaliyetOnayGecmisi;
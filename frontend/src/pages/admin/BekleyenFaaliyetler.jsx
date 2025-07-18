import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';
import { Link } from "react-router-dom";

import { 
  FiEye, FiCheck, FiX, FiFilter, FiSearch, 
  FiCalendar, FiUser, FiMapPin, FiImage,
  FiCheckSquare, FiLoader, FiAlertCircle
} from 'react-icons/fi';

const BekleyenFaaliyetler = () => {
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaaliyetler, setSelectedFaaliyetler] = useState([]);
  const [filters, setFilters] = useState({
    il: '',
    ilce: '',
    dernek: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [processing, setProcessing] = useState(false);
  const [selectedFaaliyet, setSelectedFaaliyet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [redNedeni, setRedNedeni] = useState('');
  const [showRedModal, setShowRedModal] = useState(false);

  useEffect(() => {
    fetchBekleyenFaaliyetler();
  }, [filters]);

  const fetchBekleyenFaaliyetler = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBekleyenFaaliyetler(filters);
      
      // Response yapısını kontrol et
      console.log('API Response:', response);
      
      // Güvenli data alma
      const data = response?.data?.data || response?.data || [];
      const paginationData = response?.data?.pagination || {};
      
      setFaaliyetler(Array.isArray(data) ? data : []);
      setPagination(paginationData);
      
    } catch (error) {
      toast.error('Bekleyen faaliyetler yüklenirken hata oluştu');
      console.error('Fetch error:', error);
      setFaaliyetler([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  const handleFaaliyetOnayla = async (faaliyetId) => {
    try {
      setProcessing(true);
      await adminApi.onaylaFaaliyet(faaliyetId);
      toast.success('Faaliyet başarıyla onaylandı');
      fetchBekleyenFaaliyetler();
    } catch (error) {
      toast.error('Faaliyet onaylanırken hata oluştu');
      console.error('Onay error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleFaaliyetReddet = async (faaliyetId) => {
    if (!redNedeni.trim()) {
      toast.error('Red nedeni gerekli');
      return;
    }

    try {
      setProcessing(true);
      await adminApi.reddetFaaliyet(faaliyetId, redNedeni);
      toast.success('Faaliyet reddedildi');
      setShowRedModal(false);
      setRedNedeni('');
      fetchBekleyenFaaliyetler();
    } catch (error) {
      toast.error('Faaliyet reddedilirken hata oluştu');
      console.error('Red error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleTopluOnayla = async () => {
    if (selectedFaaliyetler.length === 0) {
      toast.error('Lütfen onaylanacak faaliyetleri seçin');
      return;
    }

    try {
      setProcessing(true);
      const response = await adminApi.topluFaaliyetOnayla(selectedFaaliyetler);
      toast.success(`${response.data.data.basarili} faaliyet onaylandı`);
      setSelectedFaaliyetler([]);
      fetchBekleyenFaaliyetler();
    } catch (error) {
      toast.error('Toplu onay sırasında hata oluştu');
      console.error('Toplu onay error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectFaaliyet = (faaliyetId) => {
    setSelectedFaaliyetler(prev => 
      prev.includes(faaliyetId) 
        ? prev.filter(id => id !== faaliyetId)
        : [...prev, faaliyetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFaaliyetler.length === (faaliyetler?.length || 0)) {
      setSelectedFaaliyetler([]);
    } else {
      setSelectedFaaliyetler((faaliyetler || []).map(f => f.id));
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

  const FaaliyetCard = ({ faaliyet }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedFaaliyetler.includes(faaliyet.id)}
              onChange={() => handleSelectFaaliyet(faaliyet.id)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {faaliyet.baslik || 'Başlıksız Faaliyet'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <FiUser className="h-4 w-4 mr-1" />
                  {faaliyet.isim} {faaliyet.soyisim}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-1" />
                  {formatDate(faaliyet.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedFaaliyet(faaliyet);
                setShowModal(true);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Detay"
            >
              <FiEye className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFaaliyetOnayla(faaliyet.id)}
              disabled={processing}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
              title="Onayla"
            >
              <FiCheck className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setSelectedFaaliyet(faaliyet);
                setShowRedModal(true);
              }}
              disabled={processing}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              title="Reddet"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {faaliyet.aciklama && (
          <p className="text-gray-700 mb-4 line-clamp-3">{faaliyet.aciklama}</p>
        )}

        {/* Images */}
        {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <FiImage className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {faaliyet.gorseller.length} görsel
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <FiMapPin className="h-4 w-4 mr-1" />
              {faaliyet.il}/{faaliyet.ilce}
            </span>
            {faaliyet.gonullu_dernek && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {faaliyet.gonullu_dernek}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFaaliyetOnayla(faaliyet.id)}
              disabled={processing}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Onayla
            </button>
            <button
              onClick={() => {
                setSelectedFaaliyet(faaliyet);
                setShowRedModal(true);
              }}
              disabled={processing}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Bekleyen Faaliyetler
    </h1>
    <p className="text-gray-600">
      Onay bekleyen faaliyetleri inceleyin ve onaylayın
    </p>
  </div>

  <div className="flex gap-2">
    <Link
      to="/admin/faaliyetler/stats"
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      İstatistikler
    </Link>
    <Link
      to="/admin/faaliyetler/onay-gecmisi"
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
    >
      Onay Geçmişi
    </Link>
  </div>
</div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İl
            </label>
            <select
              value={filters.il}
              onChange={(e) => setFilters({...filters, il: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              {/* Diğer iller */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İlçe
            </label>
            <input
              type="text"
              value={filters.ilce}
              onChange={(e) => setFilters({...filters, ilce: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="İlçe ara..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dernek
            </label>
            <input
              type="text"
              value={filters.dernek}
              onChange={(e) => setFilters({...filters, dernek: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dernek ara..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({il: '', ilce: '', dernek: '', page: 1, limit: 20})}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFaaliyetler.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedFaaliyetler.length} faaliyet seçildi
            </span>
            <button
              onClick={handleTopluOnayla}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {processing ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiCheckSquare className="h-4 w-4" />
              )}
              <span>Toplu Onayla</span>
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      {faaliyetler && faaliyetler.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <input
              type="checkbox"
              checked={selectedFaaliyetler.length === faaliyetler.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span>Tümünü Seç</span>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Yükleniyor...</span>
        </div>
      ) : !faaliyetler || faaliyetler.length === 0 ? (
        <div className="text-center py-12">
          <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Bekleyen faaliyet bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faaliyetler.map((faaliyet) => (
            <FaaliyetCard key={faaliyet.id} faaliyet={faaliyet} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-500">
            Toplam {pagination.total} sonuç
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters({...filters, page: filters.page - 1})}
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Önceki
            </button>
            <span className="text-sm text-gray-700">
              {filters.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              disabled={filters.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {/* Red Modal */}
      {showRedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Faaliyet Reddet</h3>
            <p className="text-gray-600 mb-4">
              Bu faaliyeti reddetmek istediğinizden emin misiniz?
            </p>
            <textarea
              value={redNedeni}
              onChange={(e) => setRedNedeni(e.target.value)}
              placeholder="Red nedeni yazın..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4 h-24 resize-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRedModal(false);
                  setRedNedeni('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={() => handleFaaliyetReddet(selectedFaaliyet.id)}
                disabled={processing || !redNedeni.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h4 className="font-medium text-gray-900 mb-2">Paylaşan</h4>
                <p className="text-gray-700">
                  {selectedFaaliyet.isim} {selectedFaaliyet.soyisim}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dernek</h4>
                <p className="text-gray-700">{selectedFaaliyet.gonullu_dernek || 'Belirtilmemiş'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Konum</h4>
                <p className="text-gray-700">{selectedFaaliyet.il}/{selectedFaaliyet.ilce}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tarih</h4>
                <p className="text-gray-700">{formatDate(selectedFaaliyet.created_at)}</p>
              </div>

              {selectedFaaliyet.gorseller && selectedFaaliyet.gorseller.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Görseller</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFaaliyet.gorseller.map((gorsel, index) => (
                      <img
                        key={index}
                        src={`/uploads/faaliyet-images/${gorsel}`}
                        alt={`Faaliyet görseli ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedFaaliyet(selectedFaaliyet);
                  setShowRedModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reddet
              </button>
              <button
                onClick={() => {
                  handleFaaliyetOnayla(selectedFaaliyet.id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BekleyenFaaliyetler;
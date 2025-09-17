import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';
import { Link } from "react-router-dom";

import {
  FiEye, FiCheck, FiX, FiFilter, FiSearch,
  FiCalendar, FiUser, FiMapPin, FiImage,
  FiCheckSquare, FiLoader, FiAlertCircle,
  FiClock, FiRefreshCw,
  FiFileText, FiGrid, FiChevronLeft, FiChevronRight
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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBekleyenFaaliyetler();
  }, [filters]);

  const fetchBekleyenFaaliyetler = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBekleyenFaaliyetler(filters);

      console.log('API Response:', response);

      const data = response?.data?.data || response?.data || [];
      const paginationData = response?.data?.pagination || {};

      setFaaliyetler(Array.isArray(data) ? data : []);
      setPagination(paginationData);

    } catch (error) {
      toast.error('Bekleyen faaliyetler yüklenirken hata oluştu');
      console.error('Fetch error:', error);
      setFaaliyetler([]);
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

  const FaaliyetCard = ({ faaliyet }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selectedFaaliyetler.includes(faaliyet.id)}
            onChange={() => handleSelectFaaliyet(faaliyet.id)}
            className="w-4 h-4 text-[#FA2C37] bg-gray-600 border-gray-500 rounded focus:ring-[#FA2C37] focus:ring-2"
          />
        </div>

        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-white">
            {faaliyet.isim?.charAt(0)?.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-1">
                {faaliyet.baslik || 'Başlıksız Faaliyet'}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FiUser className="h-3 w-3" />
                  {faaliyet.isim} {faaliyet.soyisim}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" />
                  {getTimeAgo(faaliyet.created_at)}
                </span>
              </div>
            </div>
            
            {/* Priority Badge */}
            <div className="px-3 py-1 bg-orange-600/20 text-orange-300 text-xs font-medium rounded-full border border-orange-600/30">
              Bekliyor
            </div>
          </div>

          {/* Description */}
          {faaliyet.aciklama && (
            <p className="text-gray-300 mb-3 line-clamp-2 leading-relaxed">
              {faaliyet.aciklama}
            </p>
          )}

          {/* Info Row */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <FiMapPin className="h-3 w-3" />
              {faaliyet.il}/{faaliyet.ilce}
            </span>
            {faaliyet.gonullu_dernek && (
              <span className="flex items-center gap-1">
                <FiGrid className="h-3 w-3" />
                <span className="truncate max-w-32">{faaliyet.gonullu_dernek}</span>
              </span>
            )}
            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
              <span className="flex items-center gap-1">
                <FiImage className="h-3 w-3" />
                {faaliyet.gorseller.length} görsel
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedFaaliyet(faaliyet);
                setShowModal(true);
              }}
              className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FiEye className="h-4 w-4" />
              Detay
            </button>
            <button
              onClick={() => handleFaaliyetOnayla(faaliyet.id)}
              disabled={processing}
              className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheck className="h-4 w-4" />
              Onayla
            </button>
            <button
              onClick={() => {
                setSelectedFaaliyet(faaliyet);
                setShowRedModal(true);
              }}
              disabled={processing}
              className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiX className="h-4 w-4" />
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FiClock className="h-8 w-8" />
                Bekleyen Faaliyetler
              </h1>
              <p className="text-red-100">
                Onay bekleyen faaliyetleri inceleyin ve değerlendirin
              </p>
              <div className="flex items-center gap-4 text-sm text-red-100 mt-2">
                <span>Toplam {faaliyetler?.length || 0} faaliyet</span>
                {selectedFaaliyetler.length > 0 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                    {selectedFaaliyetler.length} seçili
                  </span>
                )}
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
                <FiCheckSquare className="mr-2 h-4 w-4" />
                İstatistikler
              </Link>

              <Link
                to="/admin/faaliyetler/onay-gecmisi"
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
              >
                <FiFileText className="mr-2 h-4 w-4" />
                Onay Geçmişi
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">İl</label>
                <select
                  value={filters.il}
                  onChange={(e) => setFilters({ ...filters, il: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                >
                  <option value="">Tüm İller</option>
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">İlçe</label>
                <input
                  type="text"
                  value={filters.ilce}
                  onChange={(e) => setFilters({ ...filters, ilce: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                  placeholder="İlçe ara..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dernek</label>
                <input
                  type="text"
                  value={filters.dernek}
                  onChange={(e) => setFilters({ ...filters, dernek: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                  placeholder="Dernek ara..."
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ il: '', ilce: '', dernek: '', page: 1, limit: 20 })}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedFaaliyetler.length > 0 && (
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 font-medium">
                {selectedFaaliyetler.length} faaliyet seçildi
              </span>
              <button
                onClick={handleTopluOnayla}
                disabled={processing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {processing ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiCheckSquare className="h-4 w-4" />
                )}
                Toplu Onayla
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        {faaliyetler && faaliyetler.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFaaliyetler.length === faaliyetler.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#FA2C37] bg-gray-600 border-gray-500 rounded focus:ring-[#FA2C37] focus:ring-2"
              />
              <span>Tümünü Seç ({faaliyetler.length} faaliyet)</span>
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiLoader className="h-12 w-12 animate-spin text-[#FA2C37] mx-auto mb-4" />
              <p className="text-gray-400">Bekleyen faaliyetler yükleniyor...</p>
            </div>
          </div>
        ) : !faaliyetler || faaliyetler.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Harika İş!</h3>
            <p className="text-gray-400 mb-4">
              Şu anda onay bekleyen faaliyet bulunmamaktadır.
            </p>
            <Link
              to="/admin/faaliyetler/stats"
              className="inline-flex items-center px-6 py-3 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg font-medium transition-all hover:scale-105"
            >
              <FiCheckSquare className="mr-2 h-5 w-5" />
              İstatistikleri Görüntüle
            </Link>
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Sayfa {filters.page} / {pagination.totalPages}
                <span className="ml-2">(Toplam {pagination.total} sonuç)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm">
                  {filters.page}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedFaaliyet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-100">Faaliyet Detayı</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg text-gray-200 mb-2">Başlık</h4>
                  <p className="text-gray-300">{selectedFaaliyet.baslik || 'Başlıksız'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-gray-200 mb-2">Açıklama</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedFaaliyet.aciklama || 'Açıklama yok'}</p>
                </div>

                <hr className="border-gray-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Paylaşan</h4>
                    <p className="text-gray-300">{selectedFaaliyet.isim} {selectedFaaliyet.soyisim}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Dernek</h4>
                    <p className="text-gray-300">{selectedFaaliyet.gonullu_dernek || 'Belirtilmemiş'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Konum</h4>
                    <p className="text-gray-300">{selectedFaaliyet.il}/{selectedFaaliyet.ilce}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Tarih</h4>
                    <p className="text-gray-300">{formatDate(selectedFaaliyet.created_at)}</p>
                  </div>
                </div>

                {selectedFaaliyet.gorseller && selectedFaaliyet.gorseller.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-200 mb-3">Görseller</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedFaaliyet.gorseller.map((gorsel, index) => (
                        <img
                          key={index}
                          src={`/uploads/faaliyet-images/${gorsel}`}
                          alt={`Faaliyet görseli ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 font-medium transition-colors"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFaaliyet(selectedFaaliyet);
                    setShowRedModal(true);
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing && <FiLoader className="h-4 w-4 animate-spin" />}
                  Reddet
                </button>
              </div>
            </div>
          </div>
        )}

{/* Red Modal - Bu kod parçası eksikti */}
        {showRedModal && selectedFaaliyet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-red-300">Faaliyet Reddet</h3>
                <button
                  onClick={() => {
                    setShowRedModal(false);
                    setRedNedeni('');
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  <strong>{selectedFaaliyet.baslik}</strong> başlıklı faaliyeti reddetmek istediğinizden emin misiniz?
                </p>
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Red Nedeni <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={redNedeni}
                  onChange={(e) => setRedNedeni(e.target.value)}
                  placeholder="Red nedenini açıklayın..."
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3">
                <button
                  onClick={() => {
                    setShowRedModal(false);
                    setRedNedeni('');
                  }}
                  disabled={processing}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 font-medium transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleFaaliyetReddet(selectedFaaliyet.id)}
                  disabled={processing || !redNedeni.trim()}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiX className="h-4 w-4" />
                  )}
                  Reddet
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default BekleyenFaaliyetler; 
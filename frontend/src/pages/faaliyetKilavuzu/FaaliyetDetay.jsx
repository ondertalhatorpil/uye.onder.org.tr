// src/pages/faaliyetKilavuzu/FaaliyetDetay.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiArrowLeft, FiCalendar, FiBook, FiActivity, FiUsers, FiEdit2, FiTrash2, FiClock, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FaaliyetDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [faaliyet, setFaaliyet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadFaaliyet();
  }, [id]);

  const loadFaaliyet = async () => {
    try {
      setLoading(true);
      const response = await faaliyetKilavuzuService.getById(id);
      
      if (response.success) {
        setFaaliyet(response.data);
      } else {
        toast.error('Faaliyet bulunamadı');
        navigate('/faaliyet-kilavuzu');
      }
    } catch (error) {
      console.error('Faaliyet yükleme hatası:', error);
      toast.error('Faaliyet yüklenirken hata oluştu');
      navigate('/faaliyet-kilavuzu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await faaliyetKilavuzuService.delete(id);
      
      if (response.success) {
        toast.success('Faaliyet başarıyla silindi');
        navigate('/faaliyet-kilavuzu');
      } else {
        toast.error('Faaliyet silinemedi');
      }
    } catch (error) {
      console.error('Faaliyet silme hatası:', error);
      toast.error('Faaliyet silinirken hata oluştu');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-sm sm:text-lg text-gray-400">Faaliyet yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!faaliyet) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm sm:text-base mb-4">Faaliyet bulunamadı</p>
          <Link
            to="/faaliyet-kilavuzu"
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-[#FA2C37] text-white rounded-lg hover:bg-[#FA2C37]/80 transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span>Geri Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <Link
              to="/faaliyet-kilavuzu"
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm sm:text-base w-fit"
            >
              <FiArrowLeft className="mr-4 sm:mr-2 h-3 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Faaliyet Kılavuzuna Dön</span>
              <span className="sm:hidden">Geri</span>
            </Link>

            {hasRole(['super_admin', 'dernek_admin']) && (
              <div className="flex gap-2 sm:gap-3">
                <Link
                  to={`/admin/faaliyet-kilavuzu/edit/${id}`}
                  className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FiEdit2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Düzenle</span>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FiTrash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>

          {/* Ana Kart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
            
            {/* Başlık */}
            <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 p-4 sm:p-6 text-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">{faaliyet.etkinlik_adi}</h1>
                  <p className="text-red-100 text-sm sm:text-base lg:text-lg leading-tight">{faaliyet.konu}</p>
                </div>
                <div className="lg:text-right lg:ml-4">
                  <div className="flex items-center gap-1 sm:gap-2 text-red-100 text-xs sm:text-sm mb-1">
                    <FiCalendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Tarih</span>
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {formatTime(faaliyet.tarih)}
                  </div>
                  <div className="text-xs sm:text-sm text-red-100 mt-1">
                    {formatDate(faaliyet.tarih)}
                  </div>
                </div>
              </div>
            </div>

            {/* İçerik */}
            <div className="p-4 sm:p-6">
              
              {/* Ana İçerik */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                  <FiBook className="h-4 w-4 sm:h-5 sm:w-5 text-[#FA2C37]" />
                  <span>Faaliyet İçeriği</span>
                </h2>
                <div className="bg-gray-700/30 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {faaliyet.icerik}
                  </p>
                </div>
              </div>

              {/* Meta Bilgiler */}
              {faaliyet.created_at && (
                <div className="border-t border-gray-700 pt-4 sm:pt-6">
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-2">
                      <FiClock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Oluşturulma Tarihi</span>
                    </div>
                    <p className="text-gray-200 text-sm sm:text-base">
                      {new Date(faaliyet.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Alt Butonlar */}
              <div className="border-t border-gray-700 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Link
                    to="/faaliyet-kilavuzu/takvim"
                    className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <FiCalendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Takvimi Görüntüle</span>
                  </Link>
                  <Link
                    to="/faaliyet-kilavuzu"
                    className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <FiActivity className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Tüm Faaliyetler</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Bu Hafta Diğer Faaliyetler */}
          <HaftaninDigerFaaliyetleri faaliyet={faaliyet} />

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md border border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">
                  Faaliyeti Sil
                </h3>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  <strong className="text-[#FA2C37]">{faaliyet.etkinlik_adi}</strong> faaliyetini silmek istediğinize emin misiniz?
                  Bu işlem geri alınamaz.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span>Siliniyor...</span>
                      </>
                    ) : (
                      'Sil'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Haftanın diğer faaliyetlerini gösteren bileşen
const HaftaninDigerFaaliyetleri = ({ faaliyet }) => {
  const [haftaninFaaliyetleri, setHaftaninFaaliyetleri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faaliyet && faaliyet.tarih) {
      loadHaftaninFaaliyetleri();
    }
  }, [faaliyet]);

  const loadHaftaninFaaliyetleri = async () => {
    try {
      setLoading(true);
      
      // Seçilen faaliyetin tarihini al
      const faaliyetTarihi = new Date(faaliyet.tarih);
      
      // Haftanın başlangıcını (Pazartesi) bul
      const haftaBaslangici = new Date(faaliyetTarihi);
      const gunNo = haftaBaslangici.getDay(); // 0: Pazar, 1: Pazartesi, ...
      const pazartesiyeKadarGun = gunNo === 0 ? 6 : gunNo - 1; // Pazar ise 6, diğer günler için gun-1
      haftaBaslangici.setDate(haftaBaslangici.getDate() - pazartesiyeKadarGun);
      
      // Haftanın bitişini (Pazar) bul
      const haftaBitisi = new Date(haftaBaslangici);
      haftaBitisi.setDate(haftaBitisi.getDate() + 6);
      
      const startDate = haftaBaslangici.toISOString().split('T')[0];
      const endDate = haftaBitisi.toISOString().split('T')[0];

      const response = await faaliyetKilavuzuService.getByDateRange(startDate, endDate);
      
      if (response.success) {
        // Mevcut faaliyeti hariç tutarak filtrele
        const digerFaaliyetler = (response.data || []).filter(f => f.id !== parseInt(faaliyet.id));
        setHaftaninFaaliyetleri(digerFaaliyetler);
      }
    } catch (error) {
      console.error('Haftanın faaliyetleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGunAdi = (tarih) => {
    const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return gunler[new Date(tarih).getDay()];
  };

  const getGunRengi = (tarih) => {
    const gunNo = new Date(tarih).getDay();
    const renkler = [
      'bg-red-500',      // Pazar - Kırmızı
      'bg-blue-500',     // Pazartesi - Mavi  
      'bg-green-500',    // Salı - Yeşil
      'bg-yellow-500',   // Çarşamba - Sarı
      'bg-purple-500',   // Perşembe - Mor
      'bg-pink-500',     // Cuma - Pembe
      'bg-orange-500'    // Cumartesi - Turuncu
    ];
    return renkler[gunNo];
  };

  const getGunTextRengi = (tarih) => {
    const gunNo = new Date(tarih).getDay();
    const renkler = [
      'text-red-400',      // Pazar 
      'text-blue-400',     // Pazartesi
      'text-green-400',    // Salı
      'text-yellow-400',   // Çarşamba
      'text-purple-400',   // Perşembe
      'text-pink-400',     // Cuma
      'text-orange-400'    // Cumartesi
    ];
    return renkler[gunNo];
  };

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#FA2C37]" />
          <span>Bu Hafta Diğer Faaliyetler</span>
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FA2C37]"></div>
          </div>
        ) : haftaninFaaliyetleri.length > 0 ? (
          <div className="space-y-3">
            {haftaninFaaliyetleri.map((haftalikFaaliyet) => (
              <Link
                key={haftalikFaaliyet.id}
                to={`/faaliyet-kilavuzu/detay/${haftalikFaaliyet.id}`}
                className="block bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 hover:border-[#FA2C37]/50 rounded-lg p-3 sm:p-4 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 ${getGunRengi(haftalikFaaliyet.tarih)} rounded-full`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-300">
                      {getGunAdi(haftalikFaaliyet.tarih)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTarih(haftalikFaaliyet.tarih)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${getGunTextRengi(haftalikFaaliyet.tarih)} text-sm sm:text-base mb-1 leading-tight`}>
                      {haftalikFaaliyet.etkinlik_adi}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 leading-tight">
                      {haftalikFaaliyet.konu}
                    </p>
                  </div>
                  <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCalendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm sm:text-base">Bu hafta başka faaliyet bulunmuyor</p>
          </div>
        )}

        {/* Tüm Faaliyetleri Gör Butonu */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Link
            to="/faaliyet-kilavuzu"
            className="w-full flex items-center justify-center px-4 py-2 sm:py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm sm:text-base"
          >
            <FiActivity className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span>Tüm Faaliyetleri Gör</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaaliyetDetay;
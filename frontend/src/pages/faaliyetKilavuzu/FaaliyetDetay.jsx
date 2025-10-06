// src/pages/faaliyetKilavuzu/FaaliyetDetay.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiArrowLeft, FiCalendar, FiBook, FiActivity, FiUsers, FiEdit2, FiTrash2, 
  FiClock, FiChevronRight, FiImage, FiZap
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Tema Renkleri ve Genel Stil Ayarları
const ACCENT_COLOR = '#FA2C37';
const ACCENT_COLOR_HOVER = '#E52834';
const BG_DARK = 'bg-gray-900';
const CARD_BG = 'bg-gray-800'; // Ana kart arka planı
const CONTENT_BG = 'bg-gray-850'; // İçerik kutularının arka planı

const FaaliyetDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [faaliyet, setFaaliyet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
        navigate('/faaliyet-kilavuzu', { replace: true });
      }
    } catch (error) {
      console.error('Faaliyet yükleme hatası:', error);
      toast.error('Faaliyet yüklenirken hata oluştu');
      navigate('/faaliyet-kilavuzu', { replace: true });
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

  if (loading) {
    return (
      <div className={`min-h-screen ${BG_DARK} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[${ACCENT_COLOR}] mx-auto`}></div>
          <p className="mt-4 text-sm sm:text-lg text-gray-400">Faaliyet yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!faaliyet) {
    return (
      <div className={`min-h-screen ${BG_DARK} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${ACCENT_COLOR}20` }}>
            <FiZap className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" style={{ color: ACCENT_COLOR }} />
          </div>
          <p className="text-gray-400 text-lg sm:text-xl font-semibold mb-6">Aradığınız faaliyet bulunamadı.</p>
          <Link
            to="/faaliyet-kilavuzu"
            style={{ backgroundColor: ACCENT_COLOR, '--tw-ring-color': ACCENT_COLOR }}
            className="inline-flex items-center px-6 py-3 ring-2 ring-transparent hover:ring-opacity-50 hover:bg-[${ACCENT_COLOR_HOVER}] text-white rounded-xl font-semibold transition-all duration-300 text-base"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            <span>Faaliyet Kılavuzuna Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BG_DARK} text-gray-100`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header ve Yönetim Butonları */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <Link
              to="/faaliyet-kilavuzu"
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-colors text-sm font-medium w-fit shadow-md"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              <span>Geri Dön</span>
            </Link>
          </div>

          {/* Ana Faaliyet Kartı */}
          <div className={`${CARD_BG} rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden`}>
            
            {/* Başlık ve Tarih Bloğu */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-2 lg:space-y-0">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 leading-tight text-white">
                    {faaliyet.etkinlik_adi}
                  </h1>
                </div>
                <div className="lg:text-right lg:ml-4 flex-shrink-0">
                  <div className="text-base sm:text-lg font-bold text-gray-300 flex items-center gap-2">
                    <FiCalendar className="h-5 w-5" style={{ color: ACCENT_COLOR }} />
                    {formatDate(faaliyet.tarih)}
                  </div>
                  {faaliyet.hafta_no && (
                    <div className="text-sm text-gray-400 mt-1 flex items-center justify-start lg:justify-end gap-1">
                      <FiClock className="h-4 w-4 mr-2" style={{ color: ACCENT_COLOR }} />
                      <span style={{ color: ACCENT_COLOR }} className="font-extrabold">{faaliyet.hafta_no}.</span> Hafta Faaliyeti
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              
              {faaliyet.gorsel_path && (
                <div className="space-y-4">
                  <div className={`${CONTENT_BG} rounded-xl p-3 sm:p-4`}>
                    <img 
                      src={`${API_URL}${faaliyet.gorsel_path}`}
                      alt={faaliyet.etkinlik_adi}
                      className="w-full rounded-lg object-cover max-h-[70vh] h-auto shadow-xl border-2 border-gray-700"
                    />
                  </div>
                </div>
              )}

              {faaliyet.icerik && (
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-3">
                    <FiBook className="h-5 w-5" style={{ color: ACCENT_COLOR }} />
                    Faaliyet İçeriği
                  </h2>
                  <div className={`${CONTENT_BG}  sm:p-6`}>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                      {faaliyet.icerik}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <HaftaninDigerFaaliyetleri faaliyet={faaliyet} ACCENT_COLOR={ACCENT_COLOR} />

          {showDeleteModal && (
            <DeleteConfirmationModal
              faaliyet={faaliyet}
              deleting={deleting}
              handleDelete={handleDelete}
              setShowDeleteModal={setShowDeleteModal}
              ACCENT_COLOR={ACCENT_COLOR}
            />
          )}

        </div>
      </div>
    </div>
  );
};



const HaftaninDigerFaaliyetleri = ({ faaliyet, ACCENT_COLOR }) => {
  const [haftaninFaaliyetleri, setHaftaninFaaliyetleri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faaliyet && faaliyet.tarih) {
      loadHaftaninFaaliyetleri();
    }
  }, [faaliyet]);

  const getGunAdi = (tarih) => {
    const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return gunler[new Date(tarih).getDay()];
  };

  const getGunTextRengi = (tarih) => {
    const gunNo = new Date(tarih).getDay();
    const renkler = [
      'text-red-400', 
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-purple-400',
      'text-pink-400',
      'text-orange-400'
    ];
    return renkler[gunNo];
  };

  const formatTarihKisa = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const loadHaftaninFaaliyetleri = async () => {
    try {
      setLoading(true);
      
      const faaliyetTarihi = new Date(faaliyet.tarih);
      const haftaBaslangici = new Date(faaliyetTarihi);
      const gunNo = haftaBaslangici.getDay(); 
      const pazartesiyeKadarGun = gunNo === 0 ? 6 : gunNo - 1; 
      haftaBaslangici.setDate(haftaBaslangici.getDate() - pazartesiyeKadarGun);
      
      const haftaBitisi = new Date(haftaBaslangici);
      haftaBitisi.setDate(haftaBitisi.getDate() + 6);
      
      const startDate = haftaBaslangici.toISOString().split('T')[0];
      const endDate = haftaBitisi.toISOString().split('T')[0];

      const response = await faaliyetKilavuzuService.getByDateRange(startDate, endDate);
      
      if (response.success) {
        const digerFaaliyetler = (response.data || [])
          .filter(f => f.id !== parseInt(faaliyet.id))
          // Tarihe göre sıralayalım
          .sort((a, b) => new Date(a.tarih) - new Date(b.tarih)); 
        setHaftaninFaaliyetleri(digerFaaliyetler);
      }
    } catch (error) {
      console.error('Haftanın faaliyetleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`${CARD_BG} rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700/50 pb-3">
          <FiCalendar className="h-6 w-6" style={{ color: ACCENT_COLOR }} />
          <span>Haftanın Diğer Faaliyetleri</span>
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-[${ACCENT_COLOR}]`}></div>
          </div>
        ) : haftaninFaaliyetleri.length > 0 ? (
          <div className="space-y-4">
            {haftaninFaaliyetleri.map((haftalikFaaliyet) => (
              <Link
                key={haftalikFaaliyet.id}
                to={`/faaliyet-kilavuzu/detay/${haftalikFaaliyet.id}`}
                className="block bg-gray-900/50 hover:bg-gray-900/80 border-l-4 border-gray-700 hover:border-l-4 hover:border-r-2 rounded-xl p-4 transition-all duration-300 group shadow-lg"
                style={{ borderLeftColor: ACCENT_COLOR, borderRightColor: ACCENT_COLOR }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2 pr-4">
                    {/* Gün Adı ve Tarih */}
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-white">
                        {getGunAdi(haftalikFaaliyet.tarih)} ({formatTarihKisa(haftalikFaaliyet.tarih)})
                      </span>
                    </div>

                    {/* Etkinlik Adı */}
                    <h4 className={`font-extrabold ${getGunTextRengi(haftalikFaaliyet.tarih)} text-base sm:text-lg leading-tight group-hover:underline`}>
                      {haftalikFaaliyet.etkinlik_adi}
                    </h4>
                  </div>
                  <FiChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0 mt-3 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <FiZap className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-base font-medium">Bu hafta bu faaliyet dışında başka bir plan yok.</p>
          </div>
        )}

        {/* Tüm Faaliyetleri Gör Butonu */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <Link
            to="/faaliyet-kilavuzu"
            className={`w-full flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-base font-semibold shadow-md`}
          >
            <FiActivity className="mr-2 h-5 w-5" />
            <span>Tüm Faaliyet Kılavuzuna Git</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaaliyetDetay;
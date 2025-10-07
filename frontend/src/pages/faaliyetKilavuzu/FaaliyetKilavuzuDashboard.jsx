// src/pages/faaliyetKilavuzu/FaaliyetKilavuzuDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiCalendar, FiBook, FiClock, FiChevronRight, FiPlus, FiRefreshCw,
  FiSun, FiMoon, FiArrowRight, FiActivity, FiUsers, FiEye, FiEdit2,
  FiChevronDown, FiChevronUp, FiImage, FiZap
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Tema Renkleri ve Genel Stil Ayarları
// Kırmızı rengi ana vurgu rengi olarak koruyalım: #FA2C37 -> accent (Vurgu)
// Koyu arka plan: gray-900 / gray-850 (eski gray-800'den biraz daha koyu)
const ACCENT_COLOR = '#FA2C37';
const ACCENT_COLOR_HOVER = '#E52834'; // Hafifçe koyulaştırılmış
const BG_DARK = 'bg-gray-900';
const CARD_BG = 'bg-gray-800'; // Kartların yeni arka planı (eski gray-800)

const FaaliyetKilavuzuDashboard = () => {
  const { user, hasRole } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dunBugunYarin, setDunBugunYarin] = useState({ dun: null, bugun: null, yarin: null });
  const [haftalikData, setHaftalikData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('bugun');
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  // Local state'te sabit değişken tanımlamaktan kaçınalım. 
  // API URL'yi bu şekilde kullanmak genelde sorun yaratmaz, 
  // ancak projenin yapısına göre farklı bir yerde tanımlı olması daha iyi olabilir.
  const API_URL = 'https://uye.onder.org.tr';

  // --- Veri Yükleme İşlemleri ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [dunBugunYarinResponse, haftalikResponse] = await Promise.all([
        faaliyetKilavuzuService.getDunBugunYarin(),
        faaliyetKilavuzuService.getHaftalik()
      ]);

      if (dunBugunYarinResponse.success) {
        setDunBugunYarin(dunBugunYarinResponse.data);
      }

      if (haftalikResponse.success) {
        setHaftalikData(haftalikResponse.data);
      }

    } catch (error) {
      console.error('Faaliyet kılavuzu yükleme hatası:', error);
      toast.error('Faaliyet kılavuzu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Faaliyet kılavuzu güncellendi');
  };

  // --- Yardımcı Fonksiyonlar ---

  const toggleWeek = (weekIndex) => {
    const newExpandedWeeks = new Set(expandedWeeks);
    if (newExpandedWeeks.has(weekIndex)) {
      newExpandedWeeks.delete(weekIndex);
    } else {
      newExpandedWeeks.add(weekIndex);
    }
    setExpandedWeeks(newExpandedWeeks);
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

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'dun': return <FiMoon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'bugun': return <FiSun className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'yarin': return <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getTabText = (tab) => {
    switch (tab) {
      case 'dun': return 'Dün';
      case 'bugun': return 'Bugün';
      case 'yarin': return 'Yarın';
      default: return 'Tarih';
    }
  };

  const getCurrentFaaliyet = () => {
    const faaliyet = dunBugunYarin[selectedTab] || null;
    return faaliyet;
  };

  const getWeekNumber = (hafta) => {
    if (!hafta || hafta.hafta_no === undefined || hafta.hafta_no === null) return '-';
    return hafta.hafta_no;
  };

  const getDayName = (dayNumber) => {
    if (dayNumber === undefined || dayNumber === null) return 'Bilinmeyen';
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    // API'dan gelen 1-7 (1=Pazar) formatı için düzeltme
    if (dayNumber >= 1 && dayNumber <= 7) {
      return days[dayNumber - 1];
    }
    return 'Bilinmeyen';
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className={`min-h-screen ${BG_DARK} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-[${ACCENT_COLOR}] mx-auto"></div>
          <p className="mt-4 text-sm sm:text-lg text-gray-400">Faaliyet kılavuzu yükleniyor...</p>
        </div>
      </div>
    );
  }

  // --- Ana Bileşen Render ---
  return (
    <div className={`min-h-screen ${BG_DARK} text-gray-100`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header ve Yönetim Butonu */}
          <div className={`${CARD_BG} rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-700/50`}>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FiBook style={{ color: ACCENT_COLOR }} className="h-7 w-7 sm:h-8 sm:w-8" />
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                    Faaliyet Kılavuzu
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base">Güncel faaliyetler ve haftalık program akışı</p>
                </div>
              </div>

            </div>
          </div>

          {/* Dün-Bugün-Yarın Sekmeleri ve İçerik */}
          <div className={`${CARD_BG} rounded-2xl shadow-xl p-0`}>

            {/* Sekme Başlıkları */}
            <div className="flex p-4 sm:p-6 pb-0 border-b border-gray-700/70">
              {['dun', 'bugun', 'yarin'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base border-b-2
                    ${selectedTab === tab
                      ? `text-white border-[${ACCENT_COLOR}]`
                      : 'text-gray-400 border-transparent hover:text-gray-200'
                    }
                  `}
                >
                  {getTabIcon(tab)}
                  <span>{getTabText(tab)}</span>
                </button>
              ))}
            </div>

            {/* Seçili Sekme İçeriği */}
            <div className="p-4 sm:p-6 lg:p-8">
              {getCurrentFaaliyet() ? (
                <FaaliyetCard
                  faaliyet={getCurrentFaaliyet()}
                  selectedTab={selectedTab}
                  ACCENT_COLOR={ACCENT_COLOR}
                  API_URL={API_URL}
                  formatDate={formatDate}
                  hasRole={hasRole}
                  getTabText={getTabText} // <<< BU SATIRI EKLEYİN
                />
              ) : (
                <EmptyFaaliyetState
                  selectedTab={selectedTab}
                  getTabText={getTabText}
                  ACCENT_COLOR={ACCENT_COLOR}
                  hasRole={hasRole}
                />
              )}
            </div>
          </div>

          {/* Haftalık Program */}
          <HaftalikProgramSection
            haftalikData={haftalikData}
            expandedWeeks={expandedWeeks}
            toggleWeek={toggleWeek}
            getWeekNumber={getWeekNumber}
            getDayName={getDayName}
            formatDateShort={formatDateShort}
            ACCENT_COLOR={ACCENT_COLOR}
            hasRole={hasRole}
          />

        </div>
      </div>
    </div>
  );
};

// --- Alt Bileşenler ---

// 1. Faaliyet Kartı (Dün/Bugün/Yarın)
const FaaliyetCard = ({ faaliyet, selectedTab, ACCENT_COLOR, API_URL, formatDate, hasRole, getTabText }) => (
  <div className="space-y-6">

    {/* Üst Bilgi: Tarih, Hafta, Detay Butonu */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div className="flex items-center gap-3">
        <FiCalendar className="h-6 w-6 text-gray-500" />
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {getTabText(selectedTab)} Faaliyeti
          </p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {faaliyet.hafta_no ? (
              <>
                <span className="font-extrabold" style={{ color: ACCENT_COLOR }}>{faaliyet.hafta_no}. Hafta</span> - {new Date(faaliyet.tarih).toLocaleDateString('tr-TR', { weekday: 'long' })}
              </>
            ) : (
              formatDate(faaliyet.tarih)
            )}
          </h3>
        </div>
      </div>

      <Link
        to={`/faaliyet-kilavuzu/detay/${faaliyet.id}`}
        style={{ color: ACCENT_COLOR }}
        className="text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80 self-start sm:self-auto"
      >
        <span>Detayları İncele</span>
        <FiChevronRight className="h-4 w-4" />
      </Link>
    </div>

    <div className="bg-gray-850 rounded-xl sm:p-6 ">

      <h4 className="text-xl sm:text-2xl font-extrabold mb-4 pb-2 border-b border-gray-700" style={{ color: ACCENT_COLOR }}>
        <FiActivity className="inline-block h-5 w-5 mr-2 -mt-1" />
        {faaliyet.etkinlik_adi}
      </h4>

      <div className={`grid ${faaliyet.gorsel_path && faaliyet.icerik ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>

        {faaliyet.gorsel_path && (
          <div className="lg:col-span-1">
            <img
              src={`${API_URL}${faaliyet.gorsel_path}`}
              alt={faaliyet.etkinlik_adi}
              className="w-full rounded-xl object-cover max-h-[400px] lg:max-h-full h-auto shadow-lg border-2 border-gray-700 transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        )}

        {faaliyet.icerik && (
          <div className={`lg:col-span-1 ${faaliyet.gorsel_path ? '' : 'col-span-1'}`}>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FiBook className="h-4 w-4" />
              <span>İçerik Açıklaması</span>
            </div>
            <div className=" p-4 sm:p-5 h-full ">
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {faaliyet.icerik}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// 2. Faaliyet Bulunamadı Durumu
const EmptyFaaliyetState = ({ selectedTab, getTabText, ACCENT_COLOR, hasRole }) => (
  <div className="text-center py-12 sm:py-20 bg-gray-850 rounded-xl border border-gray-700/50">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${ACCENT_COLOR}20` }}>
      <FiZap className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: ACCENT_COLOR }} />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
      {getTabText(selectedTab)} için faaliyet bulunamadı
    </h3>
    <p className="text-gray-500 text-xs sm:text-base mb-6 max-w-md mx-auto">
      Bu tarihe ait bir faaliyet henüz planlanmamış veya sisteme girilmemiştir.
    </p>
  </div>
);

// 3. Haftalık Program Bölümü
const HaftalikProgramSection = ({
  haftalikData,
  expandedWeeks,
  toggleWeek,
  getWeekNumber,
  getDayName,
  formatDateShort,
  ACCENT_COLOR,
  hasRole
}) => (
  <div className={`bg-gray-800 rounded-2xl shadow-xl overflow-hidden`}>
    <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
        <FiClock className="h-6 w-6" style={{ color: ACCENT_COLOR }} />
        <span>Haftalık Faaliyet Takvimi</span>
      </h2>
    </div>

    <div className="p-4 sm:p-6">
      {haftalikData.length > 0 ? (
        <div className="space-y-4">
          {haftalikData.slice(0, 4).map((hafta, index) => (
            <div key={index} className="bg-gray-850 rounded-xl border border-gray-700/70 shadow-lg">

              <button
                onClick={() => toggleWeek(index)}
                className="w-full px-4 sm:px-6 py-4 transition-all duration-300 hover:bg-gray-700/50 rounded-t-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-3">

                    <span>{getWeekNumber(hafta)}. Hafta Programı</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium hidden sm:inline-block">
                      {hafta.faaliyetler?.length || 0} faaliyet
                    </span>
                    {expandedWeeks.has(index) ? (
                      <FiChevronUp className="h-5 w-5 text-white" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Hafta Faaliyetleri - Accordion İçeriği */}
             <div
    // Dark mode için genel konteynere daha koyu bir arka plan verilebilir (örneğin ana sayfanın tamamına)
    className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedWeeks.has(index) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
>
    {/* İçerik alanının üst sınırını koyu bir tonda tutalım */}
    <div className="p-4 sm:p-6 pt-0 border-t border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hafta.faaliyetler?.map((faaliyet) => (
                <Link
                    key={faaliyet.id}
                    to={`/faaliyet-kilavuzu/detay/${faaliyet.id}`}
                    // Kart stili: Koyu gri arka plan, hafif sınır, kırmızı vurgulu hover
                    className="group bg-gray-800 border border-gray-700 p-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:border-red-600" // Hover'da kırmızı sınır
                >
                    <div className="space-y-3">
                        {/* Gün Adı ve Tarih */}
                        <div className="flex items-center justify-between pb-1">
                            {/* Metinleri açık renk (beyaz/açık gri) yapmalıyız */}
                            <span className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                <FiCalendar className="h-4 w-4 text-red-500" /> {/* Kırmızı ikon */}
                                {getDayName(faaliyet.gun_no)}
                            </span>
                        </div>

                        {/* Etkinlik Adı ve Detay Butonu */}
                        <div className="flex items-center justify-between">
                            {/* Ana başlık metni beyaz/açık sarımsı beyaz olmalı */}
                            <h4 className="font-bold text-base leading-tight w-4/5 pr-2 text-white group-hover:text-red-500 transition-colors"> {/* Hover'da kırmızı başlık */}
                                {faaliyet.etkinlik_adi}
                            </h4>

                            {/* Detay Ok İkonu ve Metin */}
                            <span className="text-xs font-medium flex items-center gap-1 text-red-500 transition-colors flex-shrink-0"> {/* Kırmızı detay metni */}
                                Detay
                                <FiChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
</div>
            </div>
          ))}

          {haftalikData.length > 4 && (
            <div className="text-center pt-6">
              <Link
                to="/faaliyet-kilavuzu/haftalik"
                style={{ backgroundColor: ACCENT_COLOR, '--tw-ring-color': ACCENT_COLOR }}
                className="inline-flex items-center px-6 py-3 ring-2 ring-transparent hover:ring-opacity-50 hover:bg-[${ACCENT_COLOR_HOVER}] text-white rounded-xl font-semibold transition-all duration-300 text-base shadow-lg"
              >
                <span>Tüm Haftalık Programı Gör</span>
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-300 mb-2">
            Haftalık program henüz planlanmamış.
          </h3>
          {hasRole(['super_admin', 'dernek_admin']) && (
            <Link
              to="/admin/faaliyet-kilavuzu"
              className="inline-flex items-center px-4 py-2 mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors text-sm"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              <span>Faaliyet Planla</span>
            </Link>
          )}
        </div>
      )}
    </div>
  </div>
);

export default FaaliyetKilavuzuDashboard;
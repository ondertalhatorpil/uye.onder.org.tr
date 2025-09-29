// src/pages/faaliyetKilavuzu/FaaliyetKilavuzuDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiCalendar, FiBook, FiClock, FiChevronRight, FiPlus, FiRefreshCw,
  FiSun, FiMoon, FiArrowRight, FiActivity, FiUsers, FiEye, FiEdit2,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FaaliyetKilavuzuDashboard = () => {
  const { user, hasRole } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dunBugunYarin, setDunBugunYarin] = useState({ dun: null, bugun: null, yarin: null });
  const [haftalikData, setHaftalikData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('bugun');
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Dün-bugün-yarın verilerini yükle
      const dunBugunYarinResponse = await faaliyetKilavuzuService.getDunBugunYarin();
      if (dunBugunYarinResponse.success) {
        setDunBugunYarin(dunBugunYarinResponse.data);
      }

      // Haftalık verileri yükle
      const haftalikResponse = await faaliyetKilavuzuService.getHaftalik();
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
      case 'dun': return <FiMoon className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'bugun': return <FiSun className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'yarin': return <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />;
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
    return dunBugunYarin[selectedTab] || null;
  };

  const getWeekNumber = (hafta) => {
    return hafta.hafta_no || 'Hafta';
  };

  const getDayName = (dayNumber) => {
    const days = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    return days[dayNumber] || 'Bilinmeyen';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-sm sm:text-lg text-gray-400">Faaliyet kılavuzu yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                  <FiBook className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  Faaliyet Kılavuzu
                </h1>
                <p className="text-red-100 text-sm sm:text-base">Günlük faaliyetler ve haftalık program</p>
              </div>
            </div>
          </div>

          {/* Dün-Bugün-Yarın Sekmeleri */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
            
            {/* Sekme Başlıkları */}
            <div className="flex border-b border-gray-700 bg-gray-800">
              {['dun', 'bugun', 'yarin'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 px-2 py-3 sm:px-4 sm:py-4 text-center font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    selectedTab === tab
                      ? 'bg-[#FA2C37] text-white border-b-2 border-[#FA2C37]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span>{getTabText(tab)}</span>
                </button>
              ))}
            </div>

            {/* Seçili Sekme İçeriği */}
            <div className="p-3 sm:p-4 lg:p-6">
              {getCurrentFaaliyet() ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Tarih ve Detay Butonu */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-[#FA2C37]/20 rounded-lg">
                        <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#FA2C37]" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-100 leading-tight">
                          {formatDate(getCurrentFaaliyet().tarih)}
                        </h3>
                      </div>
                    </div>
                    
                    <Link
                      to={`/faaliyet-kilavuzu/detay/${getCurrentFaaliyet().id}`}
                      className="text-[#FA2C37] hover:text-[#FA2C37]/80 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors self-start"
                    >
                      <span>Detay Gör</span>
                      <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </div>

                  {/* Faaliyet Kartı */}
                  <div className="bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-600">
                    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                      
                      {/* Etkinlik Adı */}
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                          <FiActivity className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Etkinlik Adı</span>
                        </div>
                        <h4 className="text-base sm:text-lg lg:text-xl font-bold text-[#FA2C37] leading-tight">
                          {getCurrentFaaliyet().etkinlik_adi}
                        </h4>
                      </div>

                      {/* Konu */}
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                          <FiBook className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Konu</span>
                        </div>
                        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-100 leading-tight">
                          {getCurrentFaaliyet().konu}
                        </h4>
                      </div>

                    </div>

                    {/* İçerik */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-600">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                        <FiBook className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>İçerik</span>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
                          {getCurrentFaaliyet().icerik}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiCalendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
                    {getTabText(selectedTab)} için faaliyet bulunamadı
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4">
                    Bu tarihe ait faaliyet henüz planlanmamış.
                  </p>
                  {hasRole(['super_admin', 'dernek_admin']) && (
                    <Link
                      to="/faaliyet-kilavuzu/admin/create"
                      className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <FiPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Faaliyet Ekle</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Haftalık Program */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-100 flex items-center gap-2">
                  <FiClock className="h-4 w-4 sm:h-5 sm:w-5 text-[#FA2C37]" />
                  <span>Haftalık Program</span>
                </h2>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-6">
              {haftalikData.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {haftalikData.slice(0, 4).map((hafta, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
                      
                      {/* Hafta Başlığı - Tıklanabilir */}
                      <button
                        onClick={() => toggleWeek(index)}
                        className="w-full bg-gray-700/50 hover:bg-gray-700/70 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-100 flex items-center gap-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FA2C37] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                              {getWeekNumber(hafta)}
                            </div>
                            <span>{getWeekNumber(hafta)}. Hafta ({hafta.yil})</span>
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-400">
                              {hafta.faaliyetler?.length || 0} faaliyet
                            </span>
                            {expandedWeeks.has(index) ? (
                              <FiChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            ) : (
                              <FiChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Hafta Faaliyetleri - Accordion Content */}
                      <div className={`overflow-hidden transition-all duration-300 ${expandedWeeks.has(index) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 sm:p-4 lg:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {hafta.faaliyetler?.map((faaliyet) => (
                              <Link
                                key={faaliyet.id}
                                to={`/faaliyet-kilavuzu/detay/${faaliyet.id}`}
                                className="group bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 hover:border-[#FA2C37]/50 rounded-lg p-3 sm:p-4 transition-all duration-200"
                              >
                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FA2C37] rounded-full"></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-300">
                                      {getDayName(faaliyet.gun_no)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDateShort(faaliyet.tarih)}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-[#FA2C37] group-hover:text-[#FA2C37]/80 mb-1 sm:mb-2 text-sm sm:text-base leading-tight">
                                      {faaliyet.etkinlik_adi}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-400 leading-tight">
                                      {faaliyet.konu}
                                    </p>
                                  </div>
                                  <div className="flex items-center ml-2">
                                    <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-[#FA2C37] transition-colors" />
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
                    <div className="text-center pt-4 sm:pt-6">
                      <Link
                        to="/faaliyet-kilavuzu/haftalik"
                        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                      >
                        <span>Tüm Haftaları Gör</span>
                        <FiChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiClock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-1 sm:mb-2">
                    Haftalık program bulunamadı
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4">
                    Henüz faaliyet programı planlanmamış.
                  </p>
                  {hasRole(['super_admin', 'dernek_admin']) && (
                    <Link
                      to="/faaliyet-kilavuzu/admin"
                      className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <FiPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Faaliyet Planla</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FaaliyetKilavuzuDashboard;
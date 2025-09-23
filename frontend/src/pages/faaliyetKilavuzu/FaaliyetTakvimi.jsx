// src/pages/faaliyetKilavuzu/FaaliyetTakvimi.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiBook, FiActivity,
  FiRefreshCw, FiArrowLeft, FiPlus, FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FaaliyetTakvimi = () => {
  const { hasRole } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFaaliyet, setSelectedFaaliyet] = useState(null);

  useEffect(() => {
    loadMonthlyFaaliyetler();
  }, [currentDate]);

  // Tarih formatını normalize eden helper function
  const normalizeDate = (date) => {
    if (typeof date === 'string') {
      // YYYY-MM-DD formatındaysa
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  };

  const loadMonthlyFaaliyetler = async () => {
    try {
      setLoading(true);
      
      // Seçili ayın başı ve sonu
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      console.log('Tarih aralığı:', { startDate, endDate }); // Debug log

      const response = await faaliyetKilavuzuService.getByDateRange(startDate, endDate);
      
      console.log('API Response:', response); // Debug log
      
      if (response.success) {
        const normalizedFaaliyetler = (response.data || []).map(faaliyet => ({
          ...faaliyet,
          tarih: normalizeDate(faaliyet.tarih)
        }));
        
        console.log('Normalized faaliyetler:', normalizedFaaliyetler); // Debug log
        setFaaliyetler(normalizedFaaliyetler);
      } else {
        console.error('API başarısız:', response);
        toast.error('Faaliyetler yüklenemedi');
      }
    } catch (error) {
      console.error('Faaliyetler yükleme hatası:', error);
      toast.error('Faaliyetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadMonthlyFaaliyetler();
    toast.success('Takvim güncellendi');
  };

  // Ay değiştirme fonksiyonları
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedFaaliyet(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedFaaliyet(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setSelectedFaaliyet(null);
  };

  // Takvim hesaplamaları
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Önceki ayın son günleri
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dayNumber: prevDate.getDate()
      });
    }
    
    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        dayNumber: day
      });
    }
    
    // Sonraki ayın ilk günleri (takvimi tamamlamak için)
    const remainingDays = 42 - days.length; // 6 satır × 7 gün = 42
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dayNumber: nextDate.getDate()
      });
    }
    
    return days;
  };

  // Belirli bir tarihteki faaliyeti getir - İyileştirilmiş
  const getFaaliyetForDate = (date) => {
    const dateStr = normalizeDate(date);
    console.log('Aranıyor:', dateStr, 'Mevcut faaliyetler:', faaliyetler.map(f => f.tarih)); // Debug log
    
    const faaliyet = faaliyetler.find(f => {
      const faaliyetTarihi = normalizeDate(f.tarih);
      return faaliyetTarihi === dateStr;
    });
    
    console.log('Bulunan faaliyet:', faaliyet); // Debug log
    return faaliyet;
  };

  // Tarih seçimi
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDate(day.date);
    const faaliyet = getFaaliyetForDate(day.date);
    setSelectedFaaliyet(faaliyet);
    
    console.log('Seçilen tarih:', day.date, 'Faaliyet:', faaliyet); // Debug log
  };

  // Bugünün tarihi kontrolü
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Seçili tarih kontrolü
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const days = getDaysInMonth();
  const weekDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  if (loading && faaliyetler.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-400">Faaliyet takvimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:mb-0">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FiCalendar className="h-8 w-8" />
                Faaliyet Takvimi
              </h1>
              <p className="text-red-100">Aylık faaliyet programını görüntüleyin</p>
            </div>

          </div>
        </div>

        {/* Takvim Kontrolleri */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Ay Navigasyonu */}
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-100 min-w-48 text-center">
                {formatMonthYear()}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Takvim */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              
              {/* Haftanın Günleri */}
              <div className="grid grid-cols-7 bg-gray-700">
                {weekDays.map(day => (
                  <div key={day} className="p-4 text-center">
                    <span className="text-sm font-medium text-gray-300">
                      {day.substring(0, 3)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Takvim Günleri */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const faaliyet = getFaaliyetForDate(day.date);
                  const isCurrentDay = isToday(day.date);
                  const isSelectedDay = isSelected(day.date);
                  const hasFaaliyet = Boolean(faaliyet);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day)}
                      disabled={!day.isCurrentMonth}
                      className={`
                        relative aspect-square p-2 border-r border-b border-gray-700 
                        transition-all duration-200 hover:bg-gray-700/50
                        ${!day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-gray-200'}
                        ${isCurrentDay ? 'bg-[#FA2C37]/20 border-[#FA2C37]' : ''}
                        ${isSelectedDay ? 'bg-blue-600/20 border-blue-500' : ''}
                        ${hasFaaliyet && day.isCurrentMonth ? 'ring-2 ring-green-500/50 bg-green-500/10' : ''}
                      `}
                    >
                      {/* Gün Numarası */}
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentDay ? 'text-[#FA2C37] font-bold' : ''}
                        ${isSelectedDay ? 'text-blue-400 font-bold' : ''}
                        ${hasFaaliyet && day.isCurrentMonth ? 'text-green-400 font-bold' : ''}
                      `}>
                        {day.dayNumber}
                      </div>

                      {/* Faaliyet Dot Göstergesi - Alternatif */}
                      {hasFaaliyet && day.isCurrentMonth && (
                        <div className="absolute top-1 left-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}

                      {/* Bugün İşareti */}
                      {isCurrentDay && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-[#FA2C37] rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Takvim Açıklaması */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm items-center w-full justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FA2C37] rounded-full"></div>
                <span className="text-gray-400">Bugün</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Faaliyet Var</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Seçili Tarih</span>
              </div>
            </div>
          </div>

          {/* Seçili Tarih Detayı */}
          <div className="space-y-6">
            
            {/* Seçili Tarih Kartı */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-[#FA2C37]" />
                Seçili Tarih
              </h3>
              
              {selectedDate ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold text-[#FA2C37] mb-2">
                      {selectedDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatSelectedDate()}
                    </div>
                  </div>

                  {selectedFaaliyet ? (
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-[#FA2C37]">
                          {selectedFaaliyet.etkinlik_adi}
                        </h4>
                        <Link
                          to={`/faaliyet-kilavuzu/detay/${selectedFaaliyet.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          <FiEye className="h-3 w-3" />
                          Detay
                        </Link>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        <span className="text-gray-400">Konu:</span> {selectedFaaliyet.konu}
                      </p>
                      
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {selectedFaaliyet.icerik}
                      </p>
                      
                      {selectedFaaliyet.created_by_name && (
                        <p className="text-xs text-gray-500 mt-3">
                          Oluşturan: {selectedFaaliyet.created_by_name} {selectedFaaliyet.created_by_surname}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBook className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Bu tarihe ait faaliyet bulunmuyor
                      </p>
                      {hasRole(['super_admin', 'dernek_admin']) && (
                        <Link
                          to={`/faaliyet-kilavuzu/admin/create?date=${selectedDate.toISOString().split('T')[0]}`}
                          className="inline-flex items-center px-3 py-1.5 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded text-sm font-medium transition-colors"
                        >
                          <FiPlus className="mr-1 h-3 w-3" />
                          Faaliyet Ekle
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">
                    Detayları görmek için bir tarih seçin
                  </p>
                </div>
              )}
            </div>

            {/* Bu Ayki Faaliyetler */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-green-400" />
                Bu Ayki Faaliyetler ({faaliyetler.length})
              </h3>
              
              {faaliyetler.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {faaliyetler.map((faaliyet) => (
                    <button
                      key={faaliyet.id}
                      onClick={() => {
                        const faaliyetDate = new Date(faaliyet.tarih + 'T00:00:00');
                        setSelectedDate(faaliyetDate);
                        setSelectedFaaliyet(faaliyet);
                      }}
                      className="w-full text-left bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-3 transition-colors border border-gray-600/50 hover:border-[#FA2C37]/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-medium text-[#FA2C37]">
                          {faaliyet.etkinlik_adi}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(faaliyet.tarih + 'T00:00:00').toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mb-1">
                        {faaliyet.konu}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {faaliyet.icerik}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiActivity className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Bu ay için faaliyet bulunmuyor
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default FaaliyetTakvimi;
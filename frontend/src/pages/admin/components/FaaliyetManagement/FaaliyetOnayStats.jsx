import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../../services/adminApi';
import { Link } from "react-router-dom";

import {
  FiCalendar, FiUsers, FiActivity, FiTrendingUp, FiTrendingDown,
  FiLoader, FiRefreshCw, FiDownload, FiBarChart, FiPieChart,
  FiMapPin, FiAward, FiClock, FiFilter, FiGrid, FiCheck,
  FiX, FiAlertCircle, FiTarget, FiShield, FiEye, FiFileText
} from 'react-icons/fi';

const FaaliyetOnayStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    genel: {},
    gunlukTrend: [],
    adminStats: [],
    dernekStats: [],
    ilStats: [],
    sektorStats: []
  });
  const [filters, setFilters] = useState({
    tarih_baslangic: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tarih_bitis: new Date().toISOString().split('T')[0],
    dernek: '',
    il: '',
    sektor: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      console.log('🔍 API çağrıları başlatılıyor...');

      const promises = [];

      // Onay stats çağrısı
      promises.push(
        adminApi.getFaaliyetOnayStats().then(response => {
          console.log('✅ Onay Stats Response:', response);
          return response;
        }).catch(error => {
          console.error('❌ Onay stats error:', error);
          return { genel: {}, gunlukTrend: [], adminStats: [] };
        })
      );

      // Dashboard çağrısı
      promises.push(
        adminApi.getDashboard().then(response => {
          console.log('✅ Dashboard Response:', response);
          return response;
        }).catch(error => {
          console.error('❌ Dashboard error:', error);
          return { stats: { faaliyet: {} }, ilDagilimi: [] };
        })
      );

      // Faaliyet stats çağrısı
      promises.push(
        adminApi.getFaaliyetStats().then(response => {
          console.log('✅ Faaliyet Stats Response:', response);
          return response;
        }).catch(error => {
          console.error('❌ Faaliyet stats error:', error);
          return {};
        })
      );

      const [onayStatsResponse, dashboardResponse, faaliyetStatsResponse] =
        await Promise.all(promises);

      console.log('🔍 API Responses:', {
        onayStatsResponse,
        dashboardResponse,
        faaliyetStatsResponse
      });

      // Veri çıkarma işlemini düzelt
      const onayData = onayStatsResponse?.data || {};
      const dashboardData = dashboardResponse?.data || {};
      const faaliyetData = faaliyetStatsResponse?.data || {};

      console.log('🔍 Parsed Data:', {
        onayData,
        dashboardData,
        faaliyetData
      });

      // Genel istatistikleri birleştir
      const genel = {
        ...onayData.genel,
        ...dashboardData.stats?.faaliyet,
        toplam_faaliyet: onayData.genel?.toplam_faaliyet || 0,
        onaylanan: onayData.genel?.onaylanan || 0,
        beklemede: onayData.genel?.beklemede || 0,
        reddedilen: onayData.genel?.reddedilen || 0
      };

      console.log('🔍 Final Genel Stats:', genel);

      // Dernek ve diğer istatistikleri al
      const dernekStats = await fetchDernekStats();
      const ilStats = dashboardData.ilDagilimi || [];
      const sektorStats = await fetchSektorStats();

      const finalStats = {
        genel,
        gunlukTrend: onayData.gunlukTrend || [],
        adminStats: onayData.adminStats || [],
        dernekStats,
        ilStats,
        sektorStats
      };

      console.log('🔍 Final Stats Set:', finalStats);

      setStats(finalStats);

    } catch (error) {
      console.error('❌ Stats error:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');

      // Hata durumunda boş veriler set et
      setStats({
        genel: {
          toplam_faaliyet: 0,
          onaylanan: 0,
          beklemede: 0,
          reddedilen: 0
        },
        gunlukTrend: [],
        adminStats: [],
        dernekStats: [],
        ilStats: [],
        sektorStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDernekStats = async () => {
    try {
      const response = await adminApi.getAllDernekler();
      const dernekler = response?.data?.data || [];

      if (!Array.isArray(dernekler) || dernekler.length === 0) {
        return [];
      }

      const dernekStats = dernekler.map(dernek => ({
        dernek_adi: dernek.dernek_adi || 'Bilinmeyen Dernek',
        toplam_faaliyet: dernek.toplam_faaliyet || 0,
        onaylanan: dernek.onaylanan_faaliyet || 0,
        bekleyen: dernek.bekleyen_faaliyet || 0,
        reddedilen: dernek.reddedilen_faaliyet || 0,
        aktif_uye_sayisi: dernek.aktif_uye_sayisi || 0
      }));

      return dernekStats
        .filter(dernek => dernek.toplam_faaliyet > 0)
        .sort((a, b) => b.toplam_faaliyet - a.toplam_faaliyet)
        .slice(0, 10);

    } catch (error) {
      console.error('Dernek stats error:', error);
      return [];
    }
  };

  const fetchSektorStats = async () => {
    try {
      const response = await adminApi.getUserStats();
      const sektorData = response?.data?.data?.sektorBazinda || [];

      if (!Array.isArray(sektorData)) {
        return [];
      }

      return sektorData.filter(sektor => sektor.kullanici_sayisi > 0);
    } catch (error) {
      console.error('Sektor stats error:', error);
      return [];
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      tarih_baslangic: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tarih_bitis: new Date().toISOString().split('T')[0],
      dernek: '',
      il: '',
      sektor: ''
    });
  };

  const exportStats = () => {
    try {
      const exportData = {
        stats,
        filters,
        exportDate: new Date().toISOString(),
        title: 'Faaliyet İstatistikleri'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faaliyet_istatistikleri_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('İstatistikler dışa aktarıldı');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export işlemi başarısız');
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorConfig = {
      blue: { bg: 'bg-blue-600/20', border: 'border-blue-600/30', text: 'text-blue-300', icon: 'text-blue-400' },
      green: { bg: 'bg-green-600/20', border: 'border-green-600/30', text: 'text-green-300', icon: 'text-green-400' },
      yellow: { bg: 'bg-yellow-600/20', border: 'border-yellow-600/30', text: 'text-yellow-300', icon: 'text-yellow-400' },
      orange: { bg: 'bg-orange-600/20', border: 'border-orange-600/30', text: 'text-orange-300', icon: 'text-orange-400' },
      red: { bg: 'bg-red-600/20', border: 'border-red-600/30', text: 'text-red-300', icon: 'text-red-400' },
      purple: { bg: 'bg-purple-600/20', border: 'border-purple-600/30', text: 'text-purple-300', icon: 'text-purple-400' }
    };

    const config = colorConfig[color] || colorConfig.blue;

    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200 ${config.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${config.text}`}>{value}</p>
            {change && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change > 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                {Math.abs(change)}%
              </p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${config.bg}`}>
            <Icon className={`w-8 h-8 ${config.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  const formatNumber = (num) => {
    return num?.toLocaleString('tr-TR') || '0';
  };

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-16 w-16 animate-spin text-[#FA2C37] mx-auto mb-4" />
          <p className="text-lg text-gray-400">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FiBarChart className="h-8 w-8" />
                Faaliyet İstatistikleri
              </h1>
              <p className="text-red-100">
                Detaylı faaliyet analizleri ve performans metrikleri
              </p>
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
                to="/admin/faaliyetler/bekleyenler"
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
              >
                <FiClock className="mr-2 h-4 w-4" />
                Onay Bekleyenler
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
              <h3 className="text-lg font-semibold text-gray-100">Zaman Aralığı Filtreleri</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filters.tarih_baslangic}
                  onChange={(e) => handleFilterChange('tarih_baslangic', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filters.tarih_bitis}
                  onChange={(e) => handleFilterChange('tarih_bitis', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dernek</label>
                <input
                  type="text"
                  value={filters.dernek}
                  onChange={(e) => handleFilterChange('dernek', e.target.value)}
                  placeholder="Dernek ara..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Faaliyet"
            value={formatNumber(stats.genel.toplam_faaliyet)}
            icon={FiActivity}
            color="blue"
          />
          <StatCard
            title="Onaylanan"
            value={formatNumber(stats.genel.onaylanan)}
            icon={FiCheck}
            color="green"
          />
          <StatCard
            title="Bekleyen"
            value={formatNumber(stats.genel.beklemede)}
            icon={FiClock}
            color="orange"
          />
          <StatCard
            title="Reddedilen"
            value={formatNumber(stats.genel.reddedilen)}
            icon={FiX}
            color="red"
          />
        </div>

        {/* Detaylı Analizler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Onay Oranları */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiPieChart className="w-5 h-5 text-purple-400" />
              Onay Oranları
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Onaylanma Oranı</span>
                  <span className="text-lg font-semibold text-green-400">
                    {calculatePercentage(stats.genel.onaylanan, stats.genel.toplam_faaliyet)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats.genel.onaylanan, stats.genel.toplam_faaliyet)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Bekleyen Oranı</span>
                  <span className="text-lg font-semibold text-orange-400">
                    {calculatePercentage(stats.genel.beklemede, stats.genel.toplam_faaliyet)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats.genel.beklemede, stats.genel.toplam_faaliyet)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Reddetme Oranı</span>
                  <span className="text-lg font-semibold text-red-400">
                    {calculatePercentage(stats.genel.reddedilen, stats.genel.toplam_faaliyet)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats.genel.reddedilen, stats.genel.toplam_faaliyet)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Performansı */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiShield className="w-5 h-5 text-blue-400" />
              Admin Performansı
            </h3>
            <div className="space-y-4">
              {stats.adminStats && stats.adminStats.length > 0 ? (
                stats.adminStats.slice(0, 5).map((admin, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {admin.isim?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-200 font-medium">
                        {admin.isim} {admin.soyisim}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-400">
                          {admin.onaylanan || 0}
                        </div>
                        <div className="text-xs text-gray-500">Onay</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-red-400">
                          {admin.reddedilen || 0}
                        </div>
                        <div className="text-xs text-gray-500">Red</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Admin performans verileri bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          {/* Günlük Trend */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-cyan-400" />
              Son 7 Gün Trendi
            </h3>
            <div className="space-y-4">
              {stats.gunlukTrend && stats.gunlukTrend.length > 0 ? (
                stats.gunlukTrend.slice(0, 7).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-200">
                        {new Date(trend.tarih).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-400">
                          +{trend.onaylanan || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-red-400">
                          -{trend.reddedilen || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FiBarChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Günlük trend verileri bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* En Aktif Dernekler */}
        {stats.dernekStats && stats.dernekStats.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiTarget className="w-6 h-6 text-indigo-400" />
              En Aktif Dernekler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.dernekStats.slice(0, 6).map((dernek, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-200 truncate pr-2">
                      {dernek.dernek_adi}
                    </h4>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index < 3 ? 'bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60' : 'bg-gray-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {dernek.toplam_faaliyet}
                      </div>
                      <div className="text-xs text-gray-500">Toplam</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {dernek.onaylanan}
                      </div>
                      <div className="text-xs text-gray-500">Onay</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-400">
                        {dernek.bekleyen}
                      </div>
                      <div className="text-xs text-gray-500">Bekleyen</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Hızlı İşlemler</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/faaliyetler/bekleyenler"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg font-medium transition-colors"
            >
              <FiClock className="h-4 w-4" />
              Bekleyen Faaliyetler
              {stats.genel.beklemede > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {stats.genel.beklemede}
                </span>
              )}
            </Link>
            
            <Link
              to="/admin/faaliyetler/onay-gecmisi"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg font-medium transition-colors"
            >
              <FiFileText className="h-4 w-4" />
              Onay Geçmişi
            </Link>
            
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <FiGrid className="h-4 w-4" />
              Admin Dashboard
            </Link>
            
            <button
              onClick={exportStats}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg font-medium transition-colors"
            >
              <FiDownload className="h-4 w-4" />
              Rapor İndir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FaaliyetOnayStats;
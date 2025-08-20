import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../../services/adminApi';
import { Link } from "react-router-dom";

import {
  FiCalendar, FiUsers, FiActivity, FiTrendingUp, FiTrendingDown,
  FiLoader, FiRefreshCw, FiDownload, FiBarChart, FiPieChart,
  FiMapPin, FiAward, FiClock, FiFilter, FiGrid
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
    tarih_baslangic: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün önce
    tarih_bitis: new Date().toISOString().split('T')[0], // Bugün
    dernek: '',
    il: '',
    sektor: ''
  });

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
          // Direkt response'u döndür, response.data.data değil
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
          // Direkt response'u döndür
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
          // Direkt response'u döndür
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
      const onayData = onayStatsResponse?.data || {}; // .data.data yerine sadece .data
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

      // Eğer dernek verisi yoksa boş array döndür
      if (!Array.isArray(dernekler) || dernekler.length === 0) {
        return [];
      }

      // Basitleştirilmiş dernek stats - API'den gelen verilerle
      const dernekStats = dernekler.map(dernek => ({
        dernek_adi: dernek.dernek_adi || 'Bilinmeyen Dernek',
        toplam_faaliyet: dernek.toplam_faaliyet || 0,
        onaylanan: dernek.onaylanan_faaliyet || 0,
        bekleyen: dernek.bekleyen_faaliyet || 0,
        reddedilen: dernek.reddedilen_faaliyet || 0,
        aktif_uye_sayisi: dernek.aktif_uye_sayisi || 0
      }));

      return dernekStats
        .filter(dernek => dernek.toplam_faaliyet > 0) // Sadece faaliyet olanları göster
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

      // Eğer sektör verisi yoksa boş array döndür
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


  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className={`bg-red-600 rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {change > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const formatNumber = (num) => {
    return num?.toLocaleString('tr-TR') || '0';
  };

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Faaliyet İstatistikleri
            </h1>
            <p className="text-gray-100">
              Detaylı faaliyet analizleri ve performans metrikleri
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/faaliyetler/bekleyenler"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Onay Bekleyenler
            </Link>
            <Link
              to="/admin/faaliyetler/onay-gecmisi"
              className="px-4 py-2 bg-gray-200 text-red-700 rounded hover:bg-gray-300 transition"
            >
              Onay Geçmişi
            </Link>
          </div>
        </div>
      </div>


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
          icon={FiTrendingUp}
          color="green"
        />
        <StatCard
          title="Bekleyen"
          value={formatNumber(stats.genel.beklemede)}
          icon={FiClock}
          color="yellow"
        />
        <StatCard
          title="Reddedilen"
          value={formatNumber(stats.genel.reddedilen)}
          icon={FiTrendingDown}
          color="red"
        />
      </div>

      {/* Onay Oranları */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiPieChart className="w-5 h-5 mr-2" />
            Onay Oranları
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Onaylanma Oranı</span>
              <span className="text-lg font-semibold text-white">
                {calculatePercentage(stats.genel.onaylanan, stats.genel.toplam_faaliyet)}%
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div
                className="bg-gray-800 h-2 rounded-full"
                style={{ width: `${calculatePercentage(stats.genel.onaylanan, stats.genel.toplam_faaliyet)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Bekleyen Oranı</span>
              <span className="text-lg font-semibold text-white">
                {calculatePercentage(stats.genel.beklemede, stats.genel.toplam_faaliyet)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-800 h-2 rounded-full"
                style={{ width: `${calculatePercentage(stats.genel.beklemede, stats.genel.toplam_faaliyet)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Reddetme Oranı</span>
              <span className="text-lg font-semibold text-white">
                {calculatePercentage(stats.genel.reddedilen, stats.genel.toplam_faaliyet)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-800 h-2 rounded-full"
                style={{ width: `${calculatePercentage(stats.genel.reddedilen, stats.genel.toplam_faaliyet)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-red-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiUsers className="w-5 h-5 mr-2" />
            Admin Performansı
          </h3>
          <div className="space-y-3">
            {stats.adminStats.slice(0, 5).map((admin, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-white">
                  {admin.isim} {admin.soyisim}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-500">
                    {admin.onaylanan}
                  </span>
                  <span className="text-sm text-yellow-300">
                    {admin.reddedilen}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiBarChart className="w-5 h-5 mr-2" />
            Son 7 Günlük Trend
          </h3>
          <div className="space-y-3">
            {stats.gunlukTrend.slice(0, 7).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-white">
                  {new Date(trend.tarih).toLocaleDateString('tr-TR')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-500">
                    +{trend.onaylanan || 0}
                  </span>
                  <span className="text-sm text-yellow-300">
                    -{trend.reddedilen || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaaliyetOnayStats;
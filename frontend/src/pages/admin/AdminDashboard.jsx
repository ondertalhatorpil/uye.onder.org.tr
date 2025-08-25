import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';

import {
  FiUsers, FiGrid, FiActivity, FiTrendingUp, FiMapPin, FiClock, FiRefreshCw,
  FiBell, FiAlertCircle, FiArrowRight, FiEye, FiShield
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error('Dashboard verileri yüklenemedi');
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast.error('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Veriler güncellendi');
  };

  const formatNumber = (num) => {
    return num?.toLocaleString('tr-TR') || '0';
  };

  const formatTimeAgo = (dateString) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-gray-400">Admin Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentUsers = dashboardData?.recentUsers || [];
  const recentFaaliyetler = dashboardData?.recentFaaliyetler || [];
  const bekleyenFaaliyetler = dashboardData?.bekleyenFaaliyetler || [];
  const ilDagilim = dashboardData?.ilDagilim || [];
  const aktifDernekler = dashboardData?.aktifDernekler || [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🛡️ Yönetici Paneli
              </h1>
              <p className="text-red-100">Sistem yönetimi ve istatistikler</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Güncelleniyor...' : 'Yenile'}
              </button>
              <div className="text-right">
                <p className="text-sm text-red-100">Hoş geldiniz</p>
                <p className="font-semibold">{user?.isim} {user?.soyisim}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Kullanıcı Yönetimi */}
          <Link to="/admin/users" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-6 transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                  <FiUsers className="h-6 w-6 text-blue-400" />
                </div>
                <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Kullanıcı Yönetimi</h3>
              <p className="text-gray-400 text-sm mb-3">Kullanıcıları görüntüle ve yönet</p>
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(stats.kullanici?.toplam_kullanici)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-400">+{stats.kullanici?.son_30_gun_kayit || 0}</span> son 30 gün
              </p>
            </div>
          </Link>

          {/* Dernek Yönetimi */}
          <Link to="/admin/dernekler" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-500 rounded-xl p-6 transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                  <FiGrid className="h-6 w-6 text-green-400" />
                </div>
                <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Dernek Yönetimi</h3>
              <p className="text-gray-400 text-sm mb-3">Dernekleri görüntüle ve düzenle</p>
              <div className="text-2xl font-bold text-green-400">
                {formatNumber(stats.dernek?.toplam_dernek)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.dernek?.il_sayisi || 0} farklı şehir
              </p>
            </div>
          </Link>

          {/* Bekleyen Faaliyetler */}
          <Link to="/admin/faaliyetler/bekleyenler" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500 rounded-xl p-6 transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-600/20 rounded-lg group-hover:bg-orange-600/30 transition-colors">
                  <FiAlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Bekleyen Faaliyetler</h3>
              <p className="text-gray-400 text-sm mb-3">Onay bekleyen faaliyetler</p>
              <div className="text-2xl font-bold text-orange-400">
                {formatNumber(stats.faaliyet?.bekleyen_faaliyet || bekleyenFaaliyetler.length)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Onay bekliyor
              </p>
            </div>
          </Link>

          {/* Bildirim Gönder */}
          <Link to="/admin/bildirimler" className="group">
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#FA2C37] rounded-xl p-6 transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#FA2C37]/20 rounded-lg group-hover:bg-[#FA2C37]/30 transition-colors">
                  <FiBell className="h-6 w-6 text-[#FA2C37]" />
                </div>
                <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#FA2C37] transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Bildirim Gönder</h3>
              <p className="text-gray-400 text-sm mb-3">Kullanıcılara bildirim gönder</p>
              <div className="text-2xl font-bold text-[#FA2C37]">
                <FiBell className="h-8 w-8" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Yeni bildirim oluştur
              </p>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Toplam Faaliyet */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <FiActivity className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Toplam Faaliyet</div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatNumber(stats.faaliyet?.toplam_faaliyet)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Onaylanan:</span>
                <span className="text-green-400 font-medium">
                  {formatNumber(stats.faaliyet?.onaylanan_faaliyet || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bekleyen:</span>
                <span className="text-orange-400 font-medium">
                  {formatNumber(stats.faaliyet?.bekleyen_faaliyet || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reddedilen:</span>
                <span className="text-red-400 font-medium">
                  {formatNumber(stats.faaliyet?.reddedilen_faaliyet || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Son 7 Gün Aktivite */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-600/20 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Son 7 Gün</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatNumber(stats.kullanici?.son_7_gun_kayit || 0)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Yeni Kayıt:</span>
                <span className="text-green-400 font-medium">
                  {formatNumber(stats.kullanici?.son_7_gun_kayit || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Yeni Faaliyet:</span>
                <span className="text-blue-400 font-medium">
                  {formatNumber(stats.faaliyet?.son_7_gun_faaliyet || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Rol Dağılımı */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600/20 rounded-lg">
                <FiShield className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Kullanıcı Rolleri</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Admin:</span>
                <span className="text-red-400 font-medium">
                  {formatNumber(stats.kullanici?.admin_sayisi || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Dernek Admin:</span>
                <span className="text-blue-400 font-medium">
                  {formatNumber(stats.kullanici?.dernek_admin_sayisi || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Üye:</span>
                <span className="text-green-400 font-medium">
                  {formatNumber(stats.kullanici?.uye_sayisi || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Son Kayıt Olan Kullanıcılar */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <FiUsers className="h-5 w-5 text-blue-400" />
                  Son Kayıt Olan Kullanıcılar
                </h2>
                <Link
                  to="/admin/users"
                  className="text-[#FA2C37] hover:text-[#FA2C37]/80 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Tümünü Gör
                  <FiEye className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.isim?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">
                          {user.isim} {user.soyisim}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <FiClock className="mr-1 h-3 w-3" />
                          {formatTimeAgo(user.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'super_admin' ? 'bg-red-600/20 text-red-300 border border-red-600/30' :
                        user.role === 'dernek_admin' ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30' :
                        'bg-green-600/20 text-green-300 border border-green-600/30'
                      }`}>
                        {user.role === 'super_admin' && 'Admin'}
                        {user.role === 'dernek_admin' && 'Dernek Admin'}
                        {user.role === 'uye' && 'Üye'}
                      </div>
                      {user.gonullu_dernek && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-32">{user.gonullu_dernek}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bekleyen Faaliyetler */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <FiAlertCircle className="h-5 w-5 text-orange-400" />
                  Onay Bekleyen Faaliyetler
                </h2>
                <Link
                  to="/admin/faaliyetler/bekleyenler"
                  className="text-[#FA2C37] hover:text-[#FA2C37]/80 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Tümünü Gör
                  <FiEye className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(bekleyenFaaliyetler.length > 0 ? bekleyenFaaliyetler : recentFaaliyetler.filter(f => f.durum === 'beklemede')).slice(0, 5).map((faaliyet) => (
                  <div key={faaliyet.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {faaliyet.isim?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100">
                        {faaliyet.isim} {faaliyet.soyisim}
                      </p>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {faaliyet.aciklama || faaliyet.baslik || 'Faaliyet açıklaması'}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <FiClock className="mr-1 h-3 w-3" />
                        {formatTimeAgo(faaliyet.created_at)}
                        {faaliyet.gonullu_dernek && (
                          <>
                            <span className="mx-2">•</span>
                            <FiMapPin className="mr-1 h-3 w-3" />
                            <span className="truncate">{faaliyet.gonullu_dernek}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-orange-600/20 text-orange-300 text-xs font-medium rounded border border-orange-600/30">
                      Bekliyor
                    </div>
                  </div>
                ))}
                {(bekleyenFaaliyetler.length === 0 && recentFaaliyetler.filter(f => f.durum === 'beklemede').length === 0) && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiActivity className="h-6 w-6 text-green-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Bekleyen faaliyet bulunmamaktadır</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* İl Bazında Dağılım */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiMapPin className="h-5 w-5 text-cyan-400" />
              İl Bazında Kullanıcı Dağılımı
            </h2>
            <div className="space-y-3">
              {ilDagilim.slice(0, 8).map((il, index) => (
                <div key={il.il} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-100">{il.il}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#FA2C37]">
                    {formatNumber(il.kullanici_sayisi)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En Aktif Dernekler */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <FiGrid className="h-5 w-5 text-green-400" />
              En Aktif Dernekler
            </h2>
            <div className="space-y-3">
              {aktifDernekler.slice(0, 8).map((dernek, index) => (
                <div key={dernek.gonullu_dernek} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiGrid className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-100 truncate max-w-48">
                        {dernek.gonullu_dernek}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      {formatNumber(dernek.toplam_faaliyet || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dernek.aktif_uye_sayisi} aktif üye
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';

import {
  FiUsers, FiGrid, FiActivity, FiTrendingUp, FiMapPin, FiClock, FiRefreshCw
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Admin Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentUsers = dashboardData?.recentUsers || [];
  const recentFaaliyetler = dashboardData?.recentFaaliyetler || [];
  const ilDagilim = dashboardData?.ilDagilim || [];
  const aktifDernekler = dashboardData?.aktifDernekler || [];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-900 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Yönetici Paneli
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-red-800 px-4 py-2 rounded-lg font-medium transition-all flex items-center"
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Güncelleniyor...' : 'Yenile'}
            </button>
            <div className="text-right">
              <p className="text-sm text-red-100">Hoş geldiniz</p>
              <p className="font-semibold">{user?.isim} {user?.soyisim}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Kullanıcı İstatistikleri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="text-sm font-medium text-gray-500">Toplam Kullanıcı</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.kullanici?.toplam_kullanici)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+{stats.kullanici?.son_30_gun_kayit || 0}</span> son 30 gün
              </div>
            </div>
          </div>
        </div>

        {/* Dernek İstatistikleri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-full">
                <FiGrid className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="text-sm font-medium text-gray-500">Toplam Dernek</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.dernek?.toplam_dernek)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.dernek?.il_sayisi || 0} farklı şehir
              </div>
            </div>
          </div>
        </div>

        {/* Faaliyet İstatistikleri */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiActivity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="text-sm font-medium text-gray-500">Toplam Faaliyet</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.faaliyet?.toplam_faaliyet)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-blue-600">+{stats.faaliyet?.son_7_gun_faaliyet || 0}</span> son 7 gün
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Kullanıcılar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-orange-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="text-sm font-medium text-gray-500">Aktif Kullanıcılar</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.kullanici?.son_7_gun_kayit)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Son 7 gün aktif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Kayıt Olan Kullanıcılar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Son Kayıt Olan Kullanıcılar</h2>
              <Link
                to="/admin/users"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Tümünü Gör
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.isim?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.isim} {user.soyisim}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1 h-3 w-3" />
                        {formatTimeAgo(user.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'dernek_admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'super_admin' && 'Admin'}
                      {user.role === 'dernek_admin' && 'Dernek Admin'}
                      {user.role === 'uye' && 'Üye'}
                    </div>
                    {user.gonullu_dernek && (
                      <p className="text-xs text-gray-500 mt-1">{user.gonullu_dernek}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Son Faaliyetler */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Son Faaliyetler</h2>
              <Link
                to="/faaliyetler"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Tümünü Gör
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentFaaliyetler.slice(0, 5).map((faaliyet) => (
                <div key={faaliyet.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {faaliyet.isim?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {faaliyet.isim} {faaliyet.soyisim}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {faaliyet.baslik}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">İl Bazında Kullanıcı Dağılımı</h2>
  <div className="space-y-3">
    {ilDagilim.slice(0, 8).map((il, index) => (
      <div key={il.il} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-600">#{index + 1}</div>
          <div className="flex items-center space-x-2">
            <FiMapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{il.il}</span>
          </div>
        </div>
        <div className="text-sm font-bold text-red-600">{formatNumber(il.kullanici_sayisi)}</div>
      </div>
    ))}
  </div>
</div>

<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">En Aktif Dernekler</h2>
  <div className="space-y-3">
    {aktifDernekler.slice(0, 8).map((dernek, index) => (
      <div key={dernek.gonullu_dernek} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-600">#{index + 1}</div>
          <div className="flex items-center space-x-2">
            <FiGrid className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 truncate">{dernek.gonullu_dernek}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-blue-600">{formatNumber(dernek.faaliyet_sayisi)}</div>
          <div className="text-xs text-gray-500">{dernek.aktif_uye_sayisi} aktif üye</div>
        </div>
      </div>
    ))}
  </div>
</div>



    </div>
  );
};

export default AdminDashboard;
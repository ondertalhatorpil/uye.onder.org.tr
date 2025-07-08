import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, adminService } from '../../services/api';
import {  FiActivity, FiGrid, FiPlus, FiCalendar, FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user, isSuperAdmin, isDernekAdmin } = useAuth();
  const [recentFaaliyetler, setRecentFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isSuperAdmin()) {
        // Super admin için detaylı istatistikler
        const dashboardData = await adminService.getDashboard();
        console.log('Dashboard data:', dashboardData); // Debug için
        
      } else if (isDernekAdmin()) {
        try {
         
        } catch (error) {
          console.log('My faaliyetler error:', error);
          setStats({
            totalUsers: 0,
            totalDernekler: 0,
            totalFaaliyetler: 0,
            myFaaliyetler: 0
          });
        }
      }

      // Son faaliyetleri getir
      const faaliyetResponse = await faaliyetService.getFaaliyetler({ limit: 6 });
      setRecentFaaliyetler(faaliyetResponse.data || []);

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      toast.error('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, [isSuperAdmin, isDernekAdmin]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const getRoleTitle = () => {
    if (isSuperAdmin()) return 'Sistem Yöneticisi';
    if (isDernekAdmin()) return 'Dernek Yöneticisi';
    return 'Üye';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

  // Masonry grid için yükseklik hesaplama fonksiyonu
  const calculateCardHeight = (faaliyet) => {
    let baseHeight = 120; // Minimum card height
    
    // Başlık varsa ekle
    if (faaliyet.baslik) {
      baseHeight += 30;
    }
    
    // Açıklama varsa uzunluğuna göre ekle
    if (faaliyet.aciklama) {
      const lines = Math.ceil(faaliyet.aciklama.length / 50);
      baseHeight += Math.min(lines * 20, 80); // Maksimum 4 satır
    }
    
    // Resim varsa ekle
    if (faaliyet.gorseller && faaliyet.gorseller.length > 0) {
      const imageCount = Array.isArray(faaliyet.gorseller) 
        ? faaliyet.gorseller.length 
        : JSON.parse(faaliyet.gorseller || '[]').length;
      
      if (imageCount <= 2) baseHeight += 150;
      else if (imageCount <= 4) baseHeight += 200;
      else baseHeight += 250;
    }
    
    return baseHeight;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-900 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.isim}! 👋
            </h1>
            <p className="text-red-100 mt-1">
              {getRoleTitle()} olarak sisteme hoş geldiniz
            </p>
            {user?.gonullu_dernek && (
              <p className="text-red-200 text-sm mt-2">
                📍 {user.gonullu_dernek}
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <Link
              to="/faaliyetler/create"
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Faaliyet Paylaş
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activities - Masonry Grid */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-red-900">Son Faaliyetler</h2>
              <Link
                to="/faaliyetler"
                className="text-red-600 hover:text-blue-500 text-sm font-medium"
              >
                Tümünü Gör
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentFaaliyetler.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentFaaliyetler.map((faaliyet) => (
                  <div 
                    key={faaliyet.id} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    style={{ minHeight: `${calculateCardHeight(faaliyet)}px` }}
                  >
                    <div className="p-4">
                      {/* User info */}
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">
                            {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {faaliyet.isim} {faaliyet.soyisim}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FiCalendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatTimeAgo(faaliyet.created_at)}</span>
                            {faaliyet.gonullu_dernek && (
                              <>
                                <span className="mx-2">•</span>
                                <FiMapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{faaliyet.gonullu_dernek}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      {faaliyet.baslik && (
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {faaliyet.baslik}
                        </h3>
                      )}
                      {faaliyet.aciklama && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-4">
                          {faaliyet.aciklama}
                        </p>
                      )}

                      {/* Images - Responsive grid */}
                      {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
                        <div className="mb-3">
                          {(() => {
                            const images = Array.isArray(faaliyet.gorseller) 
                              ? faaliyet.gorseller 
                              : (typeof faaliyet.gorseller === 'string' 
                                  ? JSON.parse(faaliyet.gorseller || '[]') 
                                  : []);
                            
                            const displayImages = images.slice(0, 4);
                            const remainingCount = images.length - 4;
                            
                            return (
                              <div className={`grid gap-2 ${
                                displayImages.length === 1 ? 'grid-cols-1' :
                                displayImages.length === 2 ? 'grid-cols-2' :
                                displayImages.length === 3 ? 'grid-cols-2' :
                                'grid-cols-2'
                              }`}>
                                {displayImages.map((gorsel, index) => (
                                  <div 
                                    key={index} 
                                    className={`relative ${
                                      displayImages.length === 3 && index === 0 ? 'col-span-2' : ''
                                    }`}
                                  >
                                    <img
                                      src={`http://localhost:3001/uploads/faaliyet-images/${gorsel}`}
                                      alt={`Faaliyet ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                      onError={(e) => {
                                        console.log('Image load error:', e.target.src);
                                        e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
                                      }}
                                    />
                                    {index === 3 && remainingCount > 0 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                          +{remainingCount}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiActivity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Henüz faaliyet yok</p>
                <p className="text-gray-500 mb-4">İlk faaliyeti sen paylaş!</p>
                <Link
                  to="/faaliyetler/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Faaliyet Paylaş
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
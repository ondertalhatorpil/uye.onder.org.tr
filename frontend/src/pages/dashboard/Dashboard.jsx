// Dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, adminApi } from '../../services';
import { toast } from 'react-hot-toast';

import RecentActivities from './components/RecentActivities';

const Dashboard = () => {
  const { user, isSuperAdmin, isDernekAdmin } = useAuth();
  const [recentFaaliyetler, setRecentFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Faaliyet verilerini çek
        const faaliyetResponse = await faaliyetService.getFaaliyetler({ limit: 8 });
        setRecentFaaliyetler(faaliyetResponse.data || []);

      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata oluştu:', error);
        toast.error('Dashboard verileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isSuperAdmin, isDernekAdmin, user]); 

  // Tam ekran yükleme göstergesi
  if (loading && recentFaaliyetler.length === 0) { 
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-400 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white"> 
      {/* Genel dashboard içeriğini ortalamak ve genişliğini kısıtlamak için ana kapsayıcı */}
      {/* max-w-6xl küçük ekranlarda içeriğin kenarlara yapışmasını engelleyen px-4 sayesinde responsive çalışır. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Son Faaliyetler bölümü */}
        <RecentActivities
          faaliyetler={recentFaaliyetler}
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, adminService } from '../../services/api';
import { FiActivity, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import WelcomeHeader from './components/WelcomeHeader';
import RecentActivities from './components/RecentActivities';

const Dashboard = () => {
  const { user, isSuperAdmin, isDernekAdmin } = useAuth();
  const [recentFaaliyetler, setRecentFaaliyetler] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDernekler: 0,
    totalFaaliyetler: 0,
    myFaaliyetler: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (isSuperAdmin()) {
          // Super admin için detaylı istatistikler
          const dashboardData = await adminService.getDashboard();
          console.log('Dashboard data:', dashboardData);
          
          if (dashboardData.success) {
            setStats({
              totalUsers: dashboardData.data.totalUsers || 0,
              totalDernekler: dashboardData.data.totalDernekler || 0,
              totalFaaliyetler: dashboardData.data.totalFaaliyetler || 0,
              myFaaliyetler: dashboardData.data.myFaaliyetler || 0
            });
          }
        } else if (isDernekAdmin()) {
          try {
            // Dernek admin için basit istatistikler
            setStats({
              totalUsers: 0,
              totalDernekler: 1,
              totalFaaliyetler: 0,
              myFaaliyetler: 0
            });
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
        const faaliyetResponse = await faaliyetService.getFaaliyetler({ limit: 8 });
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
    if (hour < 12) return 'Hayırlı Sabahlar';
    if (hour < 18) return 'Hayırlı Günler';
    return 'İyi akşamlar';
  };

  const getRoleTitle = () => {
    if (isSuperAdmin()) return 'Sistem Yöneticisi';
    if (isDernekAdmin()) return 'Dernek Yöneticisi';
    return 'Üye';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader
          user={user}
          greeting={getGreeting()}
          roleTitle={getRoleTitle()}
        />

        {/* Recent Activities */}
        <RecentActivities
          faaliyetler={recentFaaliyetler}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
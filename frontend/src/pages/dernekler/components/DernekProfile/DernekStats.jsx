import React from 'react';
import { FiUsers, FiActivity, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ icon: Icon, title, value, subtitle, color = "red", trend }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className={`h-12 w-12 rounded-2xl bg-${color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        {trend && (
          <div className="flex items-center mt-2 text-xs text-green-600">
            <FiTrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
    </div>
  </div>
);

const DernekStats = ({ stats, formatDate }) => {
  // Kuruluştan geçen süre hesapla
  const getYearsSinceFoundation = (foundingDate) => {
    if (!foundingDate) return 0;
    const now = new Date();
    const founding = new Date(foundingDate);
    const yearsDiff = now.getFullYear() - founding.getFullYear();
    return yearsDiff;
  };

  // Son aktivite zamanı hesapla
  const getLastActivityTime = (lastActivityDate) => {
    if (!lastActivityDate) return 'Henüz yok';
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffInDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Bugün';
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 30) return `${diffInDays} gün önce`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
    return `${Math.floor(diffInDays / 365)} yıl önce`;
  };

  const yearsSinceFoundation = getYearsSinceFoundation(stats.foundingDate);
  const lastActivityTime = getLastActivityTime(stats.lastActivity);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={FiUsers}
        title="Toplam Üye"
        value={stats.totalMembers}
        subtitle="Aktif üyeler"
        color="blue"
        trend={stats.totalMembers > 10 ? "Güçlü topluluk" : "Büyüyen topluluk"}
      />
      
      <StatCard
        icon={FiActivity}
        title="Toplam Faaliyet"
        value={stats.totalActivities}
        subtitle="Paylaşılan faaliyetler"
        color="green"
        trend={stats.totalActivities > 0 ? "Aktif dernek" : "Yeni başlangıç"}
      />
      
      <StatCard
        icon={FiCalendar}
        title="Kuruluş Yılı"
        value={yearsSinceFoundation > 0 ? yearsSinceFoundation : "Yeni"}
        subtitle={yearsSinceFoundation > 0 ? "yıl önce kuruldu" : "dernek"}
        color="purple"
      />
      
      <StatCard
        icon={FiTrendingUp}
        title="Son Aktivite"
        value={stats.totalActivities > 0 ? "✓" : "✗"}
        subtitle={lastActivityTime}
        color={stats.totalActivities > 0 ? "green" : "gray"}
      />
    </div>
  );
};

export default DernekStats;
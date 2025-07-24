import React from 'react';
import { FiUsers, FiActivity, FiCalendar, FiTrendingUp } from 'react-icons/fi';

// StatCard bileşeni için renk eşlemeleri
// Tailwind JIT compiler'ı dinamik stringleri tam olarak çözümleyemediği için
// belirgin renk sınıflarını burada tanımlamak daha güvenli.
const iconBgColors = {
  blue: "bg-blue-900/30",   // Darker, semi-transparent blue
  green: "bg-green-900/30", // Darker, semi-transparent green
  purple: "bg-purple-900/30", // Darker, semi-transparent purple
  gray: "bg-gray-700",      // Dark gray
};

const iconColors = {
  blue: "text-blue-400",    // Brighter blue for icon
  green: "text-green-400",  // Brighter green for icon
  purple: "text-purple-400",// Brighter purple for icon
  gray: "text-gray-400",    // Lighter gray for icon
};


const StatCard = ({ icon: Icon, title, value, subtitle, color = "red", trend }) => (
  // Card background: Darker gray, more rounded, enhanced shadow and border
  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 group">
    <div className="flex items-start justify-between"> {/* Changed to items-start for better alignment */}
      <div className="flex-1">
        {/* Icon background and color: Using dynamic map for darker versions */}
        <div className={`h-12 w-12 rounded-2xl ${iconBgColors[color] || iconBgColors.gray} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${iconColors[color] || iconColors.gray}`} />
        </div>
        {/* Value: White, bold, larger font */}
        <div className="text-4xl font-extrabold text-white mb-1">{value}</div> {/* Increased font size and weight */}
        {/* Title: Slightly lighter gray, medium font */}
        <div className="text-base font-medium text-gray-300">{title}</div> {/* Adjusted font size and color */}
        {/* Subtitle: Same color, slight adjustment if needed */}
        {subtitle && <div className="text-sm text-gray-400 mt-2">{subtitle}</div>} {/* Adjusted margin top */}
        {/* Trend: Brighter green on dark, slightly larger icon */}
        {trend && (
          <div className="flex items-center mt-3 text-sm text-green-400"> {/* Adjusted margin top, brighter green, larger text */}
            <FiTrendingUp className="mr-1.5 h-4 w-4" /> {/* Slightly larger icon */}
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
    // Yıl farkını doğru hesaplamak için ay ve günleri de kontrol et
    let yearsDiff = now.getFullYear() - founding.getFullYear();
    const monthDiff = now.getMonth() - founding.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < founding.getDate())) {
        yearsDiff--;
    }
    return yearsDiff > 0 ? yearsDiff : 0; // Negatif olmaması için 0 döndür
  };

  // Son aktivite zamanı hesapla
  const getLastActivityTime = (lastActivityDate) => {
    if (!lastActivityDate) return 'Henüz yok';
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffInMilliseconds = now - lastActivity;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays === 0) {
      if (diffInHours === 0) {
        if (diffInMinutes === 0) return 'Az önce';
        return `${diffInMinutes} dakika önce`;
      }
      return `${diffInHours} saat önce`;
    }
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
    return `${Math.floor(diffInDays / 365)} yıl önce`;
  };

  const yearsSinceFoundation = getYearsSinceFoundation(stats.foundingDate);
  const lastActivityTime = getLastActivityTime(stats.lastActivity);

  return (
    // Grid container with consistent gap
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"> {/* Added margin top for spacing */}
      <StatCard
        icon={FiUsers}
        title="Toplam Üye"
        value={stats.totalMembers}
        subtitle="Aktif üyeler"
        color="blue"
        trend={stats.totalMembers > 10 ? "Güçlü topluluk" : (stats.totalMembers > 0 ? "Büyüyen topluluk" : "Yeni başlangıç")}
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
        trend={yearsSinceFoundation > 5 ? "Köklü dernek" : (yearsSinceFoundation > 0 ? "Gelişen dernek" : undefined)}
      />
      
      <StatCard
        icon={FiTrendingUp}
        title="Son Aktivite"
        value={stats.totalActivities > 0 ? "Aktif" : "Pasif"} 
        subtitle={lastActivityTime}
        color={stats.totalActivities > 0 ? "green" : "gray"}
        trend={lastActivityTime === 'Az önce' || lastActivityTime.includes('dakika') || lastActivityTime.includes('saat') ? "Çok Yakın Zamanlı" : undefined}
      />
    </div>
  );
};

export default DernekStats;
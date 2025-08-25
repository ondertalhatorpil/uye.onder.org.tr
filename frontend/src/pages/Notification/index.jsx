import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
// React Icons'tan gerekli ikonlar içe aktarılıyor
import { 
  FaBell, FaCheckDouble, FaList, FaEnvelope, FaInbox, 
  FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown,
  FaUser, FaClock, FaCheckCircle, FaBullhorn, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'unread'
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bildirimleri yükle
  const loadNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sadece_okunmamis: selectedFilter === 'unread'
      };

      const response = await notificationService.getMyNotifications(params);
      
      if (response.success) {
        setNotifications(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Bildirim yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Okunmamış sayısını yükle
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      console.error('Okunmamış sayısı hatası:', error);
    }
  };

  // Bildirimi okundu işaretle
  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        loadNotifications(currentPage);
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Okundu işaretleme hatası:', error);
    }
  };

  // Tümünü okundu işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        loadNotifications(currentPage);
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Tümünü okundu işaretleme hatası:', error);
    }
  };

  // Filtreli bildirimleri getir
  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.tip === selectedType);
    }

    return filtered;
  };

  // Sayfa değişikliği
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadNotifications(page);
    }
  };

  // Filter değişikliği
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  // İlk yükleme
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [selectedFilter]);

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-700/50 rounded-lg flex items-center justify-center">
                  <FaBell className="text-red-400 text-lg" />
                </div>
                <h1 className="text-2xl font-bold text-gray-100">
                  Bildirimler
                  {unreadCount > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </h1>
              </div>
              <p className="text-gray-400">
                Dernek ve sistem bildirimlerinizi burada görüntüleyebilirsiniz
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <FaCheckDouble />
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Durum Filtreleri */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Durum</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleFilterChange('all')}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedFilter === 'all' 
                      ? 'bg-red-700 text-white border border-red-600' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FaList />
                  Tümü ({notifications.length})
                </button>
                <button 
                  onClick={() => handleFilterChange('unread')}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedFilter === 'unread' 
                      ? 'bg-red-700 text-red-200 border border-red-600' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FaEnvelope />
                  Okunmamış ({unreadCount})
                </button>
              </div>
            </div>

            {/* Tip Filtresi */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tip</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">Tüm Tipler</option>
                <option value="genel">🔔 Genel</option>
                <option value="duyuru">📢 Duyuru</option>
                <option value="uyari">⚠️ Uyarı</option>
                <option value="bilgi">ℹ️ Bilgi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Bildirimler yükleniyor...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaInbox className="text-2xl text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Bildirim bulunamadı</h3>
            <p className="text-gray-400">
              {selectedFilter === 'unread' 
                ? 'Okunmamış bildiriminiz bulunmamaktadır.'
                : 'Henüz herhangi bir bildirim almamışsınız.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4 mt-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FaChevronLeft />
                Önceki
              </button>
              
              <span className="text-sm text-gray-400">
                Sayfa {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Sonraki
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Bildirim kartı komponenti
const NotificationCard = ({ notification, onMarkAsRead }) => {
  const [expanded, setExpanded] = useState(false);

  const getTypeConfig = (tip) => {
    const configs = {
      'genel': {
        icon: FaBell, // JSX elementi yerine komponentin kendisi atanıyor
        bgColor: 'bg-indigo-700/50',
        textColor: 'text-indigo-300',
        iconColor: 'text-indigo-400',
        borderColor: 'border-indigo-600'
      },
      'duyuru': {
        icon: FaBullhorn,
        bgColor: 'bg-green-700/50',
        textColor: 'text-green-300',
        iconColor: 'text-green-400',
        borderColor: 'border-green-600'
      },
      'uyari': {
        icon: FaExclamationTriangle,
        bgColor: 'bg-orange-700/50',
        textColor: 'text-orange-300',
        iconColor: 'text-orange-400',
        borderColor: 'border-orange-600'
      },
      'bilgi': {
        icon: FaInfoCircle,
        bgColor: 'bg-cyan-700/50',
        textColor: 'text-cyan-300',
        iconColor: 'text-cyan-400',
        borderColor: 'border-cyan-600'
      }
    };
    return configs[tip] || configs['genel'];
  };

  const typeConfig = getTypeConfig(notification.tip);
  const isUnread = !notification.okundu;
  const IconComponent = typeConfig.icon; // Komponent değişkeni oluşturuluyor

  return (
    <div 
      className={`bg-gray-800 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl cursor-pointer ${
        isUnread 
          ? 'border-indigo-600 bg-gray-800/50' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={() => {
        if (isUnread) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          
          {/* Icon */}
          <div className={`w-10 h-10 ${typeConfig.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {/* React Icon bileşeni burada render ediliyor */}
            <IconComponent className={`${typeConfig.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${isUnread ? 'text-gray-100' : 'text-gray-300'} truncate`}>
                  {notification.baslik}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaUser />
                    {notification.gonderici_isim} {notification.gonderici_soyisim}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {notificationService.formatNotificationDate(notification.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                  {notification.tip}
                </span>
                
                {isUnread && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" title="Okunmamış"></div>
                )}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-300 transition-colors duration-200"
                >
                  {expanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
            </div>

            {/* Preview */}
            {!expanded && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {notificationService.truncateContent(notification.icerik, 120)}
              </p>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="prose prose-sm max-w-none prose-invert">
              <p className="text-gray-300 whitespace-pre-wrap">
                {notification.icerik}
              </p>
            </div>
            
            {notification.okundu && notification.okunma_tarihi && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-500">
                <FaCheckCircle />
                <span>
                  Okundu: {notificationService.formatNotificationDate(notification.okunma_tarihi)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {  notificationService } from '../../services/notificationService'; 
import { authService } from '../../services/authService';
import {
  FiHome, FiUsers, FiActivity,
  FiSettings, FiShield, FiUser,
  FiSearch, FiPlus, FiGrid, FiLogOut,
  FiClock, FiAlertCircle, FiMoreHorizontal, FiBell
} from 'react-icons/fi';

// Define color palette and font for consistency
const APP_RED = 'red-500';
const APP_RED_HOVER = 'red-600';
const TEXT_COLOR_NORMAL = 'gray-400';
const TEXT_COLOR_ACTIVE = 'white';
const BG_HOVER = 'gray-800';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasRole, hasAnyRole, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0); // Okunmamış bildirim sayısı

  // Okunmamış bildirim sayısını yükle
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

  // Sayfa yüklendiğinde ve periyodik olarak güncelle
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      // Her 30 saniyede bir güncelle
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const getProfileImageUrl = () => {
    if (user?.profil_fotografi) {
      return authService.getProfileImageUrl(user.profil_fotografi);
    }
    
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=64&rounded=true`;
  };

  const getMenuItems = () => {
    const baseMenuItems = [
      {
        name: 'Ana Sayfa',
        href: '/',
        icon: FiHome,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Bildirimler',
        href: '/bildirimler',
        icon: FiBell,
        roles: ['super_admin', 'dernek_admin', 'uye'],
        badge: unreadCount > 0 ? unreadCount : null // Dinamik badge
      },
      {
        name: 'Üye Arama',
        href: '/uyeler',
        icon: FiSearch,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Dernekler',
        href: '/dernekler',
        icon: FiGrid,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Profil',
        href: '/profile',
        icon: FiUser,
        roles: ['super_admin', 'dernek_admin', 'uye']
      }
    ];

    const dernekAdminItems = [
      {
        name: 'Derneğim',
        href: '/my-dernek',
        icon: FiGrid,
        roles: ['dernek_admin']
      }
    ];

    const superAdminItems = [
      {
        name: 'Yönetim',
        href: '/admin',
        icon: FiShield,
        roles: ['super_admin']
      }
    ];

    const moreItems = [
      {
        name: 'Daha fazla',
        href: '/settings',
        icon: FiMoreHorizontal,
        roles: ['dernek_admin', 'uye']
      }
    ];

    return [
      ...baseMenuItems,
      ...(hasRole('dernek_admin') ? dernekAdminItems : []),
      ...(hasRole('super_admin') ? superAdminItems : []),
      ...(hasAnyRole(['dernek_admin', 'uye']) ? moreItems : [])
    ].filter(item => item.roles.includes(user?.role));
  };

  const menuItems = getMenuItems();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const MenuItemBadge = ({ item }) => {
    if (item.badge) {
      // Bildirimler için özel badge
      if (item.href === '/bildirimler' && typeof item.badge === 'number') {
        return (
          <span className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full animate-pulse`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        );
      }
      // Diğer badge'ler için
      else if (item.href === '/admin/faaliyetler/stats') {
        return (
          <span className={`ml-2 inline-flex items-center justify-center h-2 w-2 bg-red-500 rounded-full animate-pulse`}>
          </span>
        );
      }
      // Genel badge
      else if (typeof item.badge === 'number') {
        return (
          <span className={`ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full`}>
            {item.badge}
          </span>
        );
      }
    }
    return null;
  };

  const AppLogo = () => (
    <img
      src="https://www.onder.org.tr/build/assets/search-bg-842c8fc7.svg"
      className='h-8 w-auto' 
      alt="Logo"
    />
  );

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-96 lg:flex-col border-r border-gray-800 font-inter"> 
      <div className="flex flex-col flex-grow overflow-y-auto">
        {/* Logo Section */}
        <div className="flex items-center h-16 pl-26 pr-4 py-4"> 
          <Link to="/" className="p-2 rounded-full hover:bg-gray-900 hover:bg-opacity-50 transition-colors cursor-pointer">
            <AppLogo />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 pl-24"> 
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-2 text-base rounded-full transition-all duration-200 mb-1 ${
                  isActive(item.href)
                    ? `font-semibold text-${TEXT_COLOR_ACTIVE}`
                    : `font-normal text-${TEXT_COLOR_NORMAL} hover:bg-${BG_HOVER} hover:text-${TEXT_COLOR_ACTIVE}`
                }`}
                onClick={() => {
                  // Bildirimler sayfasına gidildiğinde sayacı sıfırla
                  if (item.href === '/bildirimler') {
                    setTimeout(() => loadUnreadCount(), 1000);
                  }
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                <MenuItemBadge item={item} />
              </Link>
            );
          })}
        </nav>

        {/* Post Button */}
        <div className="px-4 pb-4 pl-28"> 
          <Link
            to="/faaliyetler/create"
            className={`flex items-center justify-center w-full bg-${APP_RED} text-white font-bold py-2.5 px-6 rounded-full hover:bg-${APP_RED_HOVER} transition-colors shadow-lg text-base`}
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Gönderi yayınla
          </Link>
        </div>

        {/* User Profile and Logout Button */}
        <div className="px-4 pb-6 mt-auto pl-26"> 
          <div className="flex items-center p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => console.log('Profil detayları veya ayarlar açılabilir.')}>
            
            {/* Profil Fotoğrafı */}
            <div className="h-9 w-9 rounded-full bg-gray-700 p-0.5 flex-shrink-0">
              <img
                src={getProfileImageUrl()}
                alt={`${user?.isim} ${user?.soyisim}`}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=64&rounded=true`;
                }}
              />
            </div>
            
            <div className="ml-3 flex-grow overflow-hidden">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {user?.isim} {user?.soyisim}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user?.isim?.toLowerCase() || 'kullanici'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-1.5 text-red-400 rounded-full hover:bg-gray-900 transition-all flex items-center"
              title="Çıkış Yap"
            >
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
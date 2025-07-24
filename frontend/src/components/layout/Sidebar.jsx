import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiActivity,
  FiSettings, FiShield, FiUser, // FiX, kaldırıldı
  FiSearch, FiPlus, FiGrid, FiLogOut,
  FiClock, FiCheck, FiAlertCircle, FiMoreHorizontal
} from 'react-icons/fi';

// Kırmızı tonlarını merkezi olarak tanımlayalım
const APP_RED = 'red-500'; // Ana kırmızı renk
const APP_RED_HOVER = 'red-600'; // Hover durumu için daha koyu kırmızı

// Sidebar bileşeni artık sadece masaüstü için çalışıyor
const Sidebar = () => { // props olarak open, setOpen, mobile kaldırıldı
  const location = useLocation();
  const { user, hasRole, hasAnyRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
        name: 'Faaliyetler',
        href: '/faaliyetler',
        icon: FiActivity,
        roles: ['super_admin', 'dernek_admin', 'uye']
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
        name: 'Admin Panel',
        href: '/admin',
        icon: FiShield,
        roles: ['super_admin']
      },
      {
        name: 'Kullanıcı Yönetimi',
        href: '/admin/users',
        icon: FiUsers,
        roles: ['super_admin']
      },
      {
        name: 'Dernek Yönetimi',
        href: '/admin/dernekler',
        icon: FiGrid,
        roles: ['super_admin']
      },
      {
        name: 'Faaliyetler (Admin)',
        href: '/admin/faaliyetler/stats',
        icon: FiClock,
        roles: ['super_admin'],
        badge: true
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
      ...(hasAnyRole(['dernek_admin', 'uye']) ? moreItems : []) // Sadece dernek_admin veya üye ise 'Daha fazla' göster
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
    if (item.badge && item.href === '/admin/faaliyetler/stats') {
      return (
        <span className={`ml-2 inline-flex items-center justify-center h-2 w-2 bg-${APP_RED} rounded-full animate-pulse`}>
        </span>
      );
    }
    return null;
  };

  // Logo için kendi bileşeniniz
  const AppLogo = () => (
    <img
      src="https://onder.org.tr/assets/images/statics/onder-logo.svg"
      className='h-8 w-auto' // Logo boyutunu ayarla
      alt="Logo"
    />
  );

  // Masaüstü sidebar renderı
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col border-r border-gray-800 bg-black"> {/* lg:w-80 olarak güncellendi */}
      <div className="flex flex-col flex-grow overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center h-16 pl-6 pr-4 py-4"> {/* Sol boşluk ayarı */}
          <Link to="/" className="p-2 rounded-full hover:bg-gray-900 hover:bg-opacity-50 transition-colors cursor-pointer">
            <AppLogo />
          </Link>
        </div>

        {/* Navigasyon menüsü */}
        <nav className="flex-1 pl-6 pr-4 py-2"> {/* Sol boşluk ayarı */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-lg rounded-full transition-all duration-200 ${
                  isActive(item.href)
                    ? `font-bold text-white`
                    : 'font-normal text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon
                  className="mr-4 h-6 w-6"
                />
                <span className="">{item.name}</span>
                <MenuItemBadge item={item} />
              </Link>
            );
          })}
        </nav>

        {/* Gönderi Yayınla Butonu */}
        <div className="pl-6 pr-4 pb-4"> {/* Sol boşluk ayarı */}
          <Link
            to="/faaliyetler/create"
            className={`flex items-center justify-center w-full bg-${APP_RED} text-white font-bold py-3 px-6 rounded-full hover:bg-${APP_RED_HOVER} transition-colors shadow-lg`}
          >
            Gönderi yayınla
          </Link>
        </div>

        {/* Kullanıcı Profili ve Çıkış Butonu */}
        <div className="pl-6 pr-4 pb-6 mt-auto"> {/* Sol boşluk ayarı */}
          <div className="flex items-center p-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => alert('Profil detayları veya ayarlar açılabilir.')}>
            <div className={`h-10 w-10 rounded-full bg-${APP_RED} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              <span>
                {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-grow overflow-hidden">
              <p className="text-base font-bold text-white leading-tight truncate">
                {user?.isim} {user?.soyisim}
              </p>
              <p className="text-sm text-gray-500 truncate">
                @{user?.isim?.toLowerCase() || 'kullanici'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-2 text-red-400 rounded-full hover:bg-gray-900 transition-all flex items-center"
              title="Çıkış Yap"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
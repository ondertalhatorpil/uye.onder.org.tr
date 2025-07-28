import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assuming this path is correct
import { authService } from '../../services'; // authService'i import et
import {
  FiHome, FiUsers, FiActivity,
  FiSettings, FiShield, FiUser,
  FiSearch, FiPlus, FiGrid, FiLogOut,
  FiClock, FiAlertCircle, FiMoreHorizontal, FiBell // Added FiBell for notifications as seen in example
} from 'react-icons/fi';

// Define color palette and font for consistency
const APP_RED = 'red-500'; // Main red color
const APP_RED_HOVER = 'red-600'; // Darker red for hover states
const TEXT_COLOR_NORMAL = 'gray-400'; // Default text color for inactive items
const TEXT_COLOR_ACTIVE = 'white'; // Text color for active items
const BG_HOVER = 'gray-800'; // Background color for hover states

const Sidebar = () => {
  const location = useLocation();
  const { user, hasRole, hasAnyRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Profil fotoğrafı URL'ini oluştur
  const getProfileImageUrl = () => {
    if (user?.profil_fotografi) {
      return authService.getProfileImageUrl(user.profil_fotografi);
    }
    
    // Varsayılan avatar
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
        name: 'Bildirimler', // Added based on the example image
        href: '/notifications',
        icon: FiBell,
        roles: ['super_admin', 'dernek_admin', 'uye'],
        badge: true // Example for a badge
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

    // Filter menu items based on user roles
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
      // Example for a dynamic badge, e.g., notification count
      let badgeContent = null;
      if (item.href === '/notifications') {
        badgeContent = (
          <span className={`ml-2 inline-flex items-center justify-center h-4 w-4 text-xs font-semibold bg-${APP_RED} text-white rounded-full`}>
            1 {/* Example static count, replace with dynamic data */}
          </span>
        );
      } else if (item.href === '/admin/faaliyetler/stats') {
        badgeContent = (
          <span className={`ml-2 inline-flex items-center justify-center h-2 w-2 bg-${APP_RED} rounded-full animate-pulse`}>
          </span>
        );
      }
      return badgeContent;
    }
    return null;
  };

  // Logo component
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
                className={`group flex items-center px-4 py-2 text-base rounded-full transition-all duration-200 mb-1 ${ // Smaller text, less vertical padding, margin-bottom
                  isActive(item.href)
                    ? `font-semibold text-${TEXT_COLOR_ACTIVE}` // Semibold for active, softer white
                    : `font-normal text-${TEXT_COLOR_NORMAL} hover:bg-${BG_HOVER} hover:text-${TEXT_COLOR_ACTIVE}` // Normal weight, gray text
                }`}
              >
                <Icon className="mr-3 h-5 w-5" /> {/* Smaller icon size */}
                <span className="">{item.name}</span>
                <MenuItemBadge item={item} />
              </Link>
            );
          })}
        </nav>

        {/* Post Button */}
        <div className="px-4 pb-4 pl-28"> 
          <Link
            to="/faaliyetler/create"
            className={`flex items-center justify-center w-full bg-${APP_RED} text-white font-bold py-2.5 px-6 rounded-full hover:bg-${APP_RED_HOVER} transition-colors shadow-lg text-base`} // Slightly less vertical padding, smaller text
          >
            <FiPlus className="mr-2 h-5 w-5" /> {/* Added plus icon */}
            Gönderi yayınla
          </Link>
        </div>

        {/* User Profile and Logout Button */}
        <div className="px-4 pb-6 mt-auto pl-26"> 
          <div className="flex items-center p-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => console.log('Profil detayları veya ayarlar açılabilir.')}> {/* Slightly less padding */}
            
            {/* Profil Fotoğrafı */}
            <div className="h-9 w-9 rounded-full bg-gray-700 p-0.5 flex-shrink-0">
              <img
                src={getProfileImageUrl()}
                alt={`${user?.isim} ${user?.soyisim}`}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  // Resim yüklenemezse varsayılan avatar'a geç
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=64&rounded=true`;
                }}
              />
            </div>
            
            <div className="ml-3 flex-grow overflow-hidden">
              <p className="text-sm font-semibold text-white leading-tight truncate"> {/* Smaller text, semibold */}
                {user?.isim} {user?.soyisim}
              </p>
              <p className="text-xs text-gray-500 truncate"> {/* Even smaller text */}
                @{user?.isim?.toLowerCase() || 'kullanici'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-1.5 text-red-400 rounded-full hover:bg-gray-900 transition-all flex items-center" // Smaller padding
              title="Çıkış Yap"
            >
              <FiLogOut className="h-4 w-4" /> {/* Smaller icon */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
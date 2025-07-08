import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiActivity,
  FiSettings, FiShield, FiUser, FiX,
  FiSearch, FiPlus, FiBarChart, FiGrid, FiLogOut
} from 'react-icons/fi';


const Sidebar = ({ open, setOpen, mobile }) => {
  const location = useLocation();
  const { user, hasRole, hasAnyRole, logout } = useAuth();



  const handleLogout = () => {
    logout();
  };

  // Menü öğeleri - rol bazlı
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
        name: 'Faaliyet Paylaş',
        href: '/faaliyetler/create',
        icon: FiPlus,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Dernekler',
        href: '/dernekler',
        icon: FiGrid,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Üye Arama',
        href: '/uyeler',
        icon: FiSearch,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Üyeler',
        href: '/uyeler/list',
        icon: FiUsers,
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
        name: 'İstatistikler',
        href: '/admin/analytics',
        icon: FiBarChart,
        roles: ['super_admin']
      }
    ];

    const profileItems = [
      {
        name: 'Profilim',
        href: '/profile',
        icon: FiUser,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Ayarlar',
        href: '/settings',
        icon: FiSettings,
        roles: ['super_admin', 'dernek_admin', 'uye']
      }
    ];

    return [
      ...baseMenuItems,
      ...dernekAdminItems,
      ...superAdminItems,
      ...profileItems
    ].filter(item => item.roles.includes(user?.role));
  };

  const menuItems = getMenuItems();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (mobile) {
      setOpen(false);
    }
  };

  if (mobile) {
    return (
      <>
        {/* Mobile sidebar overlay */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setOpen(false)} />

            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
              {/* Close button */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center h-16 px-4 border-b border-gray-200">
                  <div className="h-4 w-4 flex items-center justify-center">
                    <span className="text-sm font-bold text-white"><img src="https://www.onder.org.tr/build/assets/search-bg-842c8fc7.svg" /></span>
                  </div>
                  <span className="ml-2 text-xl font-semibold text-gray-900">
                    ÖNDER
                  </span>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User info */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.isim} {user?.soyisim}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'super_admin' && 'Süper Admin'}
                      {user?.role === 'dernek_admin' && 'Dernek Admin'}
                      {user?.role === 'uye' && 'Üye'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="h-4 w-4 flex items-center justify-center">
            <span className="text-sm font-bold text-white"><img src="https://www.onder.org.tr/build/assets/search-bg-842c8fc7.svg" /></span>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">
            ÖNDER
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

       <div className="border-t border-gray-200 bg-gray-50 p-4">
  <div className="flex items-center justify-between">
    {/* Sol taraf - Logo ve kullanıcı bilgileri */}
    <div className="flex items-center space-x-3">
      {/* Logo/Avatar */}
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
        <span className="text-lg font-bold text-white">
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      
      {/* Kullanıcı bilgileri */}
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-gray-900">
          {user?.isim} {user?.soyisim}
        </p>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center  py-1 rounded-full text-xs font-medium ${
            user?.role === 'super_admin' ? '' :
            user?.role === 'dernek_admin' ? '' :
            ''
          }`}>
            {user?.role === 'super_admin' && 'Admin'}
            {user?.role === 'dernek_admin' && 'Dernek Yöneticisi'}
            {user?.role === 'uye' && 'Dernek Üyesi'}
          </span>
        </div>
      </div>
    </div>

    <button
      onClick={handleLogout}
      className="flex items-center justify-center h-10 w-10 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
      title="Çıkış Yap"
    >
      <FiLogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default Sidebar;
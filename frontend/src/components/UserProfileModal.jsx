import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services'; // authService'i import et
import {
  FiX, FiHome, FiUsers, FiActivity, FiSettings, FiShield,
  FiUser, FiSearch, FiGrid, FiLogOut, FiClock, FiMoreHorizontal,
  FiBriefcase, FiCreditCard, FiMail, FiBarChart2, FiBell
} from 'react-icons/fi';

const APP_RED = 'red-500';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, hasRole, hasAnyRole, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose(); 
  };

  // Profil fotoğrafı URL'ini oluştur
  const getProfileImageUrl = () => {
    if (user?.profil_fotografi) {
      return authService.getProfileImageUrl(user.profil_fotografi);
    }
    
    // Varsayılan avatar
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=96&rounded=true`;
  };

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getModalMenuItems = () => {
    const sections = []; 

    // Genel Kullanıcı Menüleri
    const generalItems = [
      
      {
        name: 'Anasayfa',
        href: '/', 
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
        name: 'Bildirimler',
        href: '/bildirimler',
        icon: FiBell,
        roles: ['super_admin', 'dernek_admin', 'uye']
      },
      {
        name: 'Profilim',
        href: '/profile',
        icon: FiUser,
        roles: ['super_admin', 'dernek_admin', 'uye']
      }
    ].filter(item => item.roles.includes(user?.role));

    if (generalItems.length > 0) {
      sections.push({ title: 'Genel', items: generalItems });
    }

    // Dernek Admin Menüsü
    const dernekAdminItems = [
      {
        name: 'Derneğim (Yönetim)',
        href: '/my-dernek',
        icon: FiBriefcase,
        roles: ['dernek_admin']
      }
    ].filter(item => item.roles.includes(user?.role));

    if (hasRole('dernek_admin') && dernekAdminItems.length > 0) {
      sections.push({ title: 'Dernek Yönetimi', items: dernekAdminItems });
    }

    // Super Admin Menüsü
    const superAdminItems = [
      {
        name: 'Yönetim',
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
        icon: FiBarChart2,
        roles: ['super_admin'],
        badge: true
      },
    ].filter(item => item.roles.includes(user?.role));

    if (hasRole('super_admin') && superAdminItems.length > 0) {
      sections.push({ title: 'Süper Yönetici', items: superAdminItems });
    }

    // Ayarlar Menüsü (Her zaman en sonda)
    const settingsItems = [
      {
        name: 'Uygulama Ayarları',
        href: '/settings',
        icon: FiSettings,
        roles: ['super_admin', 'dernek_admin', 'uye']
      }
    ].filter(item => item.roles.includes(user?.role));

    if (settingsItems.length > 0) {
      sections.push({ title: 'Ayarlar', items: settingsItems });
    }

    return sections;
  };

  const menuSections = getModalMenuItems();

  const MenuItemBadge = ({ item }) => {
    if (item.badge && item.href === '/admin/faaliyetler/stats') {
      return (
        <span className={`ml-2 inline-flex items-center justify-center h-2 w-2 bg-${APP_RED} rounded-full animate-pulse`}>
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm" // items-end yerine items-center, justify-center
      onClick={onClose} 
    >
      <div
        className="relative w-full h-full lg:max-w-md lg:max-h-[90vh] bg-gray-900 lg:rounded-3xl shadow-2xl p-6 transform transition-all duration-300 ease-out sm:p-8 overflow-y-auto" // h-full ve rounded-t-3xl kaldırıldı, lg:max-h-[90vh] eklendi
        // Mobil için alttan açılma animasyonu yerine, tam ekran açılış animasyonu
        style={{ transform: isOpen ? 'translateY(0%)' : 'translateY(100%)' }} // Bu animasyon hala alttan açılma hissiyatı verir. İsterseniz farklı bir animasyon tipi seçebiliriz (örn: scale(0) -> scale(1))
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors z-10"
          aria-label="Menüyü Kapat"
        >
          <FiX className="h-6 w-6" />
        </button>

        {/* Kullanıcı Bilgileri */}
        <div className="flex flex-col items-center border-b border-gray-700/50 pb-6 mb-6">
          {/* Profil Fotoğrafı */}
          <div className="h-24 w-24 rounded-full bg-gray-700 p-0.5 mb-3 shadow-lg">
            <img
              src={getProfileImageUrl()}
              alt={`${user?.isim} ${user?.soyisim}`}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                // Resim yüklenemezse varsayılan avatar'a geç
                e.target.src = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=96&rounded=true`;
              }}
            />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-1">{user?.isim} {user?.soyisim}</h3>
          <p className="text-gray-400 text-sm">@{user?.isim?.toLowerCase() || 'kullanici'}</p>
          {user?.dernek_isim && (
            <p className="text-red-300 text-xs mt-3 bg-red-800/50 px-3 py-1 rounded-full">{user.dernek_isim}</p>
          )}
        </div>

        {/* Menü Grupları */}
        {menuSections.length > 0 ? (
          menuSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6 last:mb-0">
              {section.title && (
                <h4 className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2 ml-4">
                  {section.title}
                </h4>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose} 
                      className={`group flex items-center px-4 py-3 text-base rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? `font-bold text-white bg-gray-700`
                          : 'font-normal text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-4 h-5 w-5 text-gray-400 group-hover:text-white group-[.font-bold]:text-${APP_RED}" />
                      <span className="flex-1">{item.name}</span>
                      <MenuItemBadge item={item} />
                    </Link>
                  );
                })}
              </nav>
              {sectionIndex < menuSections.length - 1 && (
                <hr className="border-gray-700/50 my-4" />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">Gösterilecek ek menü öğesi yok.</p>
        )}

        {/* Çıkış Yap Butonu */}
        <div className="pt-6 border-t border-gray-700/50 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-700 transition-colors duration-200 shadow-md"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
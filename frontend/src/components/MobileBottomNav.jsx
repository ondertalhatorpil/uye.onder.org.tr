// src/components/MobileBottomNav.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services'; // authService'i import et
import {
  FiHome, FiActivity, FiUser, FiSearch, FiPlus, FiGrid,FiBell,FiBook, FiMoreHorizontal
} from 'react-icons/fi';
import UserProfileModal from './UserProfileModal';

const APP_RED = 'red-500';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, hasRole, hasAnyRole } = useAuth();
  const [isUserProfileModalOpen, setUserProfileModalOpen] = useState(false);

  // Profil fotoğrafı URL'ini oluştur
  const getProfileImageUrl = () => {
    if (user?.profil_fotografi) {
      return authService.getProfileImageUrl(user.profil_fotografi);
    }
    
    // Varsayılan avatar (küçük boyut için 32px)
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=32&rounded=true`;
  };

  const getBottomNavItems = () => {
    let baseItems = [
      { name: 'Ana Sayfa', href: '/', icon: FiHome, roles: ['super_admin', 'dernek_admin', 'uye'] },
      { name: 'OAB', href: '/faaliyet-kilavuzu', icon: FiActivity, roles: ['super_admin', 'dernek_admin', 'uye'] },
      { name: 'Üye Arama', href: '/uyeler', icon: FiSearch, roles: ['super_admin', 'dernek_admin', 'uye'] },
      { name: 'Bildirimler', href: '/bildirimler', icon: FiBell, roles: ['super_admin', 'dernek_admin', 'uye'] },
      
    ];

    const lastItem = {
      name: user?.isim?.charAt(0)?.toUpperCase() || 'Profil', 
      href: '#', 
      icon: FiUser, 
      action: () => setUserProfileModalOpen(true),
      isProfile: true, 
      roles: ['super_admin', 'dernek_admin', 'uye'] 
    };

    // Kullanıcının rolüne göre filtreleme ve öğe ekleme mantığı
    const currentRole = user?.role;
    let itemsToShow = [];

    // Ana Sayfa (Eğer rolüne uygunsa)
    if (baseItems[0].roles.includes(currentRole)) {
        itemsToShow.push(baseItems[0]);
    }
    // Faaliyetler (Eğer rolüne uygunsa)
    if (baseItems[1].roles.includes(currentRole)) {
        itemsToShow.push(baseItems[1]);
    }
    // Üye Arama (Eğer rolüne uygunsa)
    if (baseItems[2].roles.includes(currentRole)) {
        itemsToShow.push(baseItems[2]);
    }

    if (baseItems[3].roles.includes(currentRole)) {
        itemsToShow.push(baseItems[3]);
    }

    // Profil / Daha Fazla (Her zaman son öğe olacak ve modalı açacak)
    // Eğer kullanıcı herhangi bir role sahipse, bu öğeyi göster.
    if (currentRole) { 
        itemsToShow.push(lastItem);
    }
    
    return itemsToShow;
  };

  const menuItems = getBottomNavItems();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-gray-900 border-t border-gray-800 shadow-xl py-2 px-2" style={{ zIndex: 1000 }}>
        <div className="flex justify-around items-center h-14">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            const fabPlacementIndex = 2; 

            if (index === fabPlacementIndex && !item.isProfile) {
              return (
                <Link
                  key="create-post-fab"
                  to="/faaliyetler/create"
                  className={`relative flex items-center justify-center -top-6 w-16 h-16 rounded-full bg-${APP_RED} text-white shadow-2xl transition-all duration-200 hover:scale-105 transform hover:bg-${APP_RED}-600 focus:outline-none focus:ring-2 focus:ring-${APP_RED} focus:ring-offset-2 focus:ring-offset-gray-900`}
                  aria-label="Gönderi Yayınla"
                >
                  <FiPlus className="h-8 w-8" />
                </Link>
              );
            }
            return (
              <button
                key={item.name}
                onClick={item.action ? item.action : () => window.location.href = item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                  isActive(item.href) && !item.action 
                    ? `text-${APP_RED}`
                    : 'text-gray-400 hover:text-white'
                } ${item.isProfile ? 'text-white' : ''}`} 
              >
                {item.isProfile ? (
                  // Profil fotoğrafı veya varsayılan avatar
                  <div className="h-6 w-6 rounded-full bg-gray-700 p-0.5 mb-1 flex-shrink-0">
                    <img
                      src={getProfileImageUrl()}
                      alt={`${user?.isim} ${user?.soyisim}`}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        // Resim yüklenemezse varsayılan avatar'a geç
                        e.target.src = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=32&rounded=true`;
                      }}
                    />
                  </div>
                ) : (
                  <Icon className="h-5 w-5 mb-1" />
                )}
                {!item.isProfile && <span>{item.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />
    </>
  );
};

export default MobileBottomNav;
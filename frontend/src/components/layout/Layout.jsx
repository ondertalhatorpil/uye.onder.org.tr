import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Masaüstü Sidebar
import MobileBottomNav from '../MobileBottomNav'; // Mobil alt navigasyon

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Masaüstü Sidebar (Her zaman açık, sadece lg ve üzeri ekranlarda görünür) */}
      <Sidebar />

      {/* Ana İçerik Alanı */}
      {/* pb-16: Mobil alt menü için alt boşluk ekler. lg:pb-0: Masaüstünde bu boşluğu sıfırlar. */}
      <div className="lg:pl-80 pb-16 lg:pb-0">
        {/* Sayfa içeriği */}
        <main className="py-6 bg-[#000000]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobil Alt Navigasyon (Sadece lg'den küçük ekranlarda görünür) */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from '../MobileBottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Daha geniş */}
      <div className="hidden lg:block w-80 xl:w-96">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto pb-16 lg:pb-0"> 
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};

export default Layout;
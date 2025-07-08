import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        mobile={true}
      />

      {/* Sidebar for desktop */}
      <Sidebar 
        open={true} 
        setOpen={() => {}}
        mobile={false}
      />

      {/* Main content */}
      <div className="lg:pl-64">

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
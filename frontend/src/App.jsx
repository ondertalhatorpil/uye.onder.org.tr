import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyResetCode from './pages/auth/VerifyResetCode';
import ResetPassword from './pages/auth/ResetPassword';

import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import FaaliyetCreate from './pages/faaliyetler/FaaliyetCreate';
import FaaliyetList from './pages/faaliyetler/FaaliyetList';
import DernekList from './pages/dernekler/DernekList';
import DernekProfile from './pages/dernekler/DernekProfile';
import MyDernek from './pages/dernekler/MyDernek';
import UyeSearch from './pages/uyeler/UyeSearch';
import UyeProfile from './pages/uyeler/UyeProfile';
import Profile from './pages/profile/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DernekManagement from './pages/admin/DernekManagement';

// Faaliyet Onay Sayfaları (YENİ)
import BekleyenFaaliyetler from './pages/admin/BekleyenFaaliyetler';
import FaaliyetOnayGecmisi from './pages/admin/components/FaaliyetManagement/FaaliyetOnayGecmisi';
import FaaliyetOnayStats from './pages/admin/components/FaaliyetManagement/FaaliyetOnayStats';

import Settings from './pages/settings/settings';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: 'red',
                  secondary: 'black',
                },
              },
            }}
          />

          {/* Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Şifre Sıfırlama Routes - YENİ */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-code" element={<VerifyResetCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Nested routes inside Layout */}
              <Route index element={<Dashboard />} />
              <Route path="faaliyetler" element={<FaaliyetList />} />
              <Route path="faaliyetler/create" element={<FaaliyetCreate />} />
              <Route path="dernekler" element={<DernekList />} />
              <Route path="dernekler/:dernekAdi" element={<DernekProfile />} />
              <Route path="uyeler" element={<UyeSearch />} />
              <Route path="uyeler/:id" element={<UyeProfile />} />
              <Route path="uyeler/list" element={<UyeSearch />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={
                <Settings />
              } />

              {/* Dernek Admin routes */}
              <Route
                path="my-dernek"
                element={
                  <ProtectedRoute roles={['dernek_admin']}>
                    <MyDernek />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin routes */}
              <Route path="admin" element={
                <ProtectedRoute roles={['super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute roles={['super_admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/dernekler" element={
                <ProtectedRoute roles={['super_admin']}>
                  <DernekManagement />
                </ProtectedRoute>
              } />
              
              {/* Faaliyet Onay Sistemi Routes (YENİ) */}
              <Route path="admin/faaliyetler/bekleyenler" element={
                <ProtectedRoute roles={['super_admin']}>
                  <BekleyenFaaliyetler />
                </ProtectedRoute>
              } />
              <Route path="admin/faaliyetler/onay-gecmisi" element={
                <ProtectedRoute roles={['super_admin']}>
                  <FaaliyetOnayGecmisi />
                </ProtectedRoute>
              } />
              <Route path="admin/faaliyetler/stats" element={
                <ProtectedRoute roles={['super_admin']}>
                  <FaaliyetOnayStats />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
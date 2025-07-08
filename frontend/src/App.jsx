import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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
// import Layout from './components/layout/Layout';


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
              <Route path="settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Ayarlar</h1></div>} />

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
                  <div className="p-8 text-center"><h1 className="text-2xl font-bold">Admin Panel</h1></div>
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute roles={['super_admin']}>
                  <div className="p-8 text-center"><h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1></div>
                </ProtectedRoute>
              } />
              <Route path="admin/dernekler" element={
                <ProtectedRoute roles={['super_admin']}>
                  <div className="p-8 text-center"><h1 className="text-2xl font-bold">Dernek Yönetimi</h1></div>
                </ProtectedRoute>
              } />
              <Route path="admin/analytics" element={
                <ProtectedRoute roles={['super_admin']}>
                  <div className="p-8 text-center"><h1 className="text-2xl font-bold">İstatistikler</h1></div>
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
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors({
  origin: true,  // Tüm origin'lere izin ver (development için)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Dernek Yönetim Sistemi API',
    status: 'OK',
    version: '1.0.0',
    cors: 'Enabled for localhost:5173',
    endpoints: {
      auth: '/api/auth',
      constants: '/api/constants',
      dernekler: '/api/dernekler',
      faaliyetler: '/api/faaliyetler',
      users: '/api/users',
      admin: '/api/admin',
      analytics: '/api/analytics'
    }
  });
});

// File access test
app.get('/test-files', (req, res) => {
  res.json({
    success: true,
    message: 'File access endpoints',
    endpoints: {
      dernekLogos: '/uploads/dernek-logos/',
      faaliyetImages: '/uploads/faaliyet-images/'
    },
    examples: [
      'http://localhost:5000/uploads/dernek-logos/logo-123456789.jpg',
      'http://localhost:5000/uploads/faaliyet-images/faaliyet-123456789.jpg'
    ]
  });
});

// Routes
try {
  const authRoutes = require('./routes/auth');
  const dernekRoutes = require('./routes/dernekler');
  const constantRoutes = require('./routes/constants');
  const faaliyetRoutes = require('./routes/faaliyetler');
  const userRoutes = require('./routes/users');
  const adminRoutes = require('./routes/admin');
  const analyticsRoutes = require('./routes/analytics');

  app.use('/api/auth', authRoutes);
  app.use('/api/dernekler', dernekRoutes);
  app.use('/api/constants', constantRoutes);
  app.use('/api/faaliyetler', faaliyetRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);

  console.log('✅ Tüm route\'lar başarıyla yüklendi!');

} catch (error) {
  console.error('❌ Route loading error:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/constants',
      '/api/dernekler',
      '/api/faaliyetler',
      '/api/users',
      '/api/admin',
      '/api/analytics'
    ]
  });
});

module.exports = app;
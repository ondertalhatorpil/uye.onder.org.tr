const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    }
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
  const okullarRoutes = require('./routes/okullar');

  app.use('/api/auth', authRoutes);
  app.use('/api/dernekler', dernekRoutes);
  app.use('/api/constants', constantRoutes);
  app.use('/api/faaliyetler', faaliyetRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/okullar', okullarRoutes);

  console.log('✅ Tüm route\'lar başarıyla yüklendi!');
} catch (error) {
  console.error('❌ Route loading error:', error.message);
}

// SMS Service kontrolü - YENİ EKLENEN KISIM
const checkSmsServiceOnStartup = async () => {
  try {
    const smsService = require('./services/smsService');
    const serviceStatus = await smsService.checkServiceHealth();
    
    if (serviceStatus.status === 'healthy') {
      console.log(`✅ SMS Service: ${serviceStatus.mode} modunda çalışıyor`);
    } else {
      console.log(`⚠️ SMS Service Uyarısı: ${serviceStatus.message}`);
    }
  } catch (error) {
    console.error('❌ SMS Service kontrolü başarısız:', error.message);
  }
};

// SMS servis kontrolünü export et ki server.js'te kullanabilelim
app.checkSmsService = checkSmsServiceOnStartup;

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
    ]
  });
});

module.exports = app;
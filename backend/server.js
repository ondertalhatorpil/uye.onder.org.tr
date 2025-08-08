const app = require('./app');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const { testQuery } = require('./utils/helpers');

const PORT = config.PORT;

// Database bağlantısını test et
testConnection().then(async () => {
  testQuery();
  
  try {
    await app.checkSmsService();
  } catch (error) {
    console.error('❌ SMS Service startup kontrolü başarısız:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 API Base URL: ${config.API_BASE_URL}`);
  console.log(`📱 SMS Test Mode: ${config.SMS_TEST_MODE ? 'Açık' : 'Kapalı'}`);
});
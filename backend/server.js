const app = require('./app');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const { testQuery } = require('./utils/helpers'); 


const PORT = config.PORT;

testConnection().then(() => {
  testQuery(); 
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 API Base URL: ${config.API_BASE_URL}`);
});
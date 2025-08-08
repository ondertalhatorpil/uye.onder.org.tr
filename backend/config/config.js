require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'dernek_system',
  
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880, // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // SMS Settings - YENİ
  EKOMESAJ_API_URL: process.env.EKOMESAJ_API_URL,
  EKOMESAJ_SENDER: process.env.EKOMESAJ_SENDER || 'ONDER iHD',
  EKOMESAJ_USERNAME: process.env.EKOMESAJ_USERNAME,
  EKOMESAJ_PASSWORD: process.env.EKOMESAJ_PASSWORD,
  
  SMS_CODE_EXPIRE_MINUTES: process.env.SMS_CODE_EXPIRE_MINUTES || 5,
  SMS_MAX_ATTEMPTS: process.env.SMS_MAX_ATTEMPTS || 3,
  SMS_RATE_LIMIT_MINUTES: process.env.SMS_RATE_LIMIT_MINUTES || 1,
  SMS_RATE_LIMIT_MAX_REQUESTS: process.env.SMS_RATE_LIMIT_MAX_REQUESTS || 1,
  SMS_TEST_MODE: process.env.SMS_TEST_MODE === 'true'
};
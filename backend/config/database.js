const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL bağlantısı başarılı');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL bağlantı hatası:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
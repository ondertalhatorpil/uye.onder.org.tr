const { pool } = require('../config/database');

// Test sorgusu
const testQuery = async () => {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as user_count FROM users');
    console.log('👥 Toplam kullanıcı:', rows[0].user_count);
    
    const [dernekRows] = await pool.execute('SELECT COUNT(*) as dernek_count FROM dernekler');
    console.log('🏢 Toplam dernek:', dernekRows[0].dernek_count);
    
  } catch (error) {
    console.error('❌ Database test hatası:', error.message);
  }
};

module.exports = { testQuery };
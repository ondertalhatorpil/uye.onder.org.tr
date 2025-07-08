const jwt = require('jsonwebtoken');
const config = require('../config/config');

function auth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Erişim token\'ı bulunamadı. Lütfen giriş yapın.' 
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token süresi dolmuş. Tekrar giriş yapın.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      error: 'Geçersiz token' 
    });
  }
}

module.exports = auth;
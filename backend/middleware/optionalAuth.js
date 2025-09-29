// middleware/optionalAuth.js
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    // Token yoksa da devam et (public endpoint)
    next();
  } catch (error) {
    // Token geçersiz olsa bile devam et (public endpoint için)
    next();
  }
};

module.exports = optionalAuth;
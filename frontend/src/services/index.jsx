// src/services/index.js
// Base API configuration
export { api, UPLOADS_BASE_URL } from './api';

// Service exports
export { authService } from './authService';
export { constantsService } from './constantsService';
export { userService } from './userService';
export { dernekService } from './dernekService';
export { faaliyetService } from './faaliyetService';
export { adminApi } from './adminApi';

// Default exports for convenience (farklı isimlerle)
export { default as authApi } from './authService';
export { default as constantsApi } from './constantsService';
export { default as userApi } from './userService';
export { default as dernekApi } from './dernekService';
export { default as faaliyetApi } from './faaliyetService';
export { default as adminApiDefault } from './adminApi';
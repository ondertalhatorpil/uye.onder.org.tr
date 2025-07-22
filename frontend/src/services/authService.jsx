// src/services/authService.js
import { api } from './api';

export const authService = {
  // Kullanıcı girişi
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Token'ı localStorage'a kaydet
    if (response.success && response.token) {
      localStorage.setItem('dernek_token', response.token);
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // Token'ı localStorage'a kaydet
    if (response.success && response.token) {
      localStorage.setItem('dernek_token', response.token);
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // KVKK metinlerini getir - DÜZELTİLDİ
  getKvkkTexts: async () => {
    const response = await api.get('/auth/kvkk-texts');
    return response;
  },

  // Profil bilgilerini getir
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    
    // User bilgilerini güncelle
    if (response.success && response.user) {
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Profil güncelle
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    
    // User bilgilerini güncelle
    if (response.success && response.user) {
      localStorage.setItem('dernek_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem('dernek_token');
    localStorage.removeItem('dernek_user');
    window.location.href = '/login';
  },

  // Token kontrolü
  isAuthenticated: () => {
    const token = localStorage.getItem('dernek_token');
    const user = localStorage.getItem('dernek_user');
    return !!(token && user);
  },

  // Mevcut kullanıcıyı getir
  getCurrentUser: () => {
    const userStr = localStorage.getItem('dernek_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Token'ı getir
  getToken: () => {
    return localStorage.getItem('dernek_token');
  }
};

export default authService;
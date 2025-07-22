// src/services/userService.js
import { api } from './api';

export const userService = {
  // Kullanıcı arama
  searchUsers: async (filters) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/users/search?${params}`);
  },

  // Kullanıcı detayı
  getUserById: async (userId) => {
    return await api.get(`/users/${userId}`);
  },

  // Dernek üyeleri
  getUsersByDernek: async (dernekAdi) => {
    return await api.get(`/users/by-dernek/${encodeURIComponent(dernekAdi)}`);
  }
};

export default userService;
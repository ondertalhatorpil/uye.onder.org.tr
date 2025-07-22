// src/services/constantsService.js
import { api } from './api';

export const constantsService = {
  // İller
  getIller: async () => {
    return await api.get('/constants/iller');
  },

  // İlçeler (il parametresi ile)
  getIlceler: async (il) => {
    return await api.get(`/constants/ilceler/${encodeURIComponent(il)}`);
  },

  // Dernekler (il ve ilçe parametresi ile)
  getDerneklerByLocation: async (il, ilce = null) => {
    const endpoint = ilce 
      ? `/constants/dernekler/${encodeURIComponent(il)}/${encodeURIComponent(ilce)}`
      : `/constants/dernekler/${encodeURIComponent(il)}`;
    return await api.get(endpoint);
  },

  // Sektörler
  getSektorler: async () => {
    return await api.get('/constants/sektorler');
  },

  // Komisyonlar
  getKomisyonlar: async () => {
    return await api.get('/constants/komisyonlar');
  },

  // ===== OKUL SERVİSLERİ =====
  
  // Okul arama - Register ve Profile için
  searchOkullar: async (okulTuru, filters = {}) => {
    const params = new URLSearchParams({
      okul_turu: okulTuru,
      ...filters
    }).toString();
    return await api.get(`/okullar/search?${params}`);
  },

  // İl bazında okul listesi
  getOkullarByIl: async (okulTuru, il, ilce = null) => {
    const endpoint = ilce 
      ? `/okullar/${okulTuru}/${encodeURIComponent(il)}?ilce=${encodeURIComponent(ilce)}`
      : `/okullar/${okulTuru}/${encodeURIComponent(il)}`;
    return await api.get(endpoint);
  },

  // Okul detayı
  getOkulById: async (okulId) => {
    return await api.get(`/okullar/detail/${okulId}`);
  },

  // Okul varlığını kontrol et
  checkOkulExists: async (okulId, okulTuru) => {
    return await api.get(`/okullar/check/${okulId}/${okulTuru}`);
  },

  getIllerWithOkul: async (okulTuru) => {
  
  // BÜYÜK HARFTAN KÜÇÜK HARFE ÇEVİR
  const cleanOkulTuru = okulTuru.toLowerCase();
  
  try {
    const url = `/okullar/iller/${cleanOkulTuru}`;
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('❌ getIllerWithOkul error:', error);
    throw error;
  }
},

  // İlçe listesi (okul seçimi için)
  getIlcelerWithOkul: async (okulTuru, il) => {
    return await api.get(`/okullar/ilceler/${okulTuru}/${encodeURIComponent(il)}`);
  },

  // Mezuniyet yılları
getMezuniyetYillari: async () => {
  return await api.get('/constants/mezuniyet-yillari');
},

// Sınıf listesi
getSiniflar: async (okulTuru) => {
  return await api.get(`/constants/siniflar/${okulTuru}`);
}
};

export default constantsService;
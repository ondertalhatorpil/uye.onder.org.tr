// config/schoolYear.js
const SCHOOL_YEAR_CONFIG = {
  startDate: '2025-09-08', 
  maxWeeks: 36
};

/**
 * Verilen tarihin kaçıncı eğitim haftasında olduğunu hesaplar
 * @param {Date|string} date - Kontrol edilecek tarih
 * @returns {number|null} - Hafta numarası (1-36) veya null
 */
const getWeekNumber = (date) => {
  const targetDate = new Date(date);
  const startDate = new Date(SCHOOL_YEAR_CONFIG.startDate);
  
  // Tarihleri normalize et (saat bilgisini sıfırla)
  targetDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  
  // Eğer tarih okul başlangıcından önceyse
  if (targetDate < startDate) {
    return null;
  }
  
  // Gün farkını hesapla
  const diffTime = targetDate - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Hafta numarasını hesapla (1'den başlar)
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  // Maximum haftayı aşıyorsa null dön
  if (weekNumber > SCHOOL_YEAR_CONFIG.maxWeeks) {
    return null;
  }
  
  return weekNumber;
};

/**
 * Belirli bir haftanın başlangıç ve bitiş tarihlerini döndürür
 * @param {number} weekNumber - Hafta numarası (1-36)
 * @returns {Object|null} - { startDate, endDate } veya null
 */
const getWeekDateRange = (weekNumber) => {
  if (weekNumber < 1 || weekNumber > SCHOOL_YEAR_CONFIG.maxWeeks) {
    return null;
  }
  
  const startDate = new Date(SCHOOL_YEAR_CONFIG.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  // Hafta başlangıcı (weekNumber - 1 çünkü ilk hafta 0 gün sonra başlar)
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + ((weekNumber - 1) * 7));
  
  // Hafta sonu
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0]
  };
};

/**
 * Şu anki haftayı döndürür
 * @returns {number|null} - Mevcut hafta numarası veya null
 */
const getCurrentWeek = () => {
  return getWeekNumber(new Date());
};

module.exports = {
  SCHOOL_YEAR_CONFIG,
  getWeekNumber,
  getWeekDateRange,
  getCurrentWeek
};
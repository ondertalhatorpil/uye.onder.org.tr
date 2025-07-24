import React, { useState, useEffect } from 'react';
import { constantsService } from '../../../services';

const FaaliyetFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [dernekler, setDernekler] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadIller = async () => {
      try {
        setLoading(true);
        let response;
        try {
          response = await constantsService.getIller();
        } catch (error) {
          const derneklerResponse = await constantsService.getDerneklerByLocation(''); 
          if (derneklerResponse.success) {
            const uniqueIller = [...new Set(derneklerResponse.data.map(d => d.il))].map(il => il);
            setIller(uniqueIller);
            return;
          }
        }
        
        if (response.success && Array.isArray(response.data)) {
          const processedIller = response.data.map(item => item.il_adi || item);
          setIller(processedIller);
        } else {
          console.error('İller API başarısız veya veri formatı hatalı:', response);
        }
      } catch (error) {
        console.error('İller yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    loadIller();
  }, []);

  useEffect(() => {
    if (filters.il) {
      loadIlceler(filters.il);
    } else {
      setIlceler([]);
      setDernekler([]);
    }
  }, [filters.il]);

  useEffect(() => {
    if (filters.il) {
      loadDernekler(filters.il, filters.ilce);
    } else {
      setDernekler([]);
    }
  }, [filters.il, filters.ilce]);

  const loadIlceler = async (il) => {
    try {
      setLoading(true);
      const response = await constantsService.getIlceler(il);
      
      if (response.success && Array.isArray(response.data)) {
        const processedIlceler = response.data.map(item => item.ilce_adi || item);
        setIlceler(processedIlceler);
      } else {
        console.error('İlçeler API başarısız veya veri formatı hatalı:', response);
        setIlceler([]);
      }
    } catch (error) {
      console.error('İlçeler yüklenemedi:', error);
      setIlceler([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDernekler = async (il, ilce = null) => {
    try {
      setLoading(true);
      const response = await constantsService.getDerneklerByLocation(il, ilce);
      
      if (response.success && Array.isArray(response.data)) {
        setDernekler(response.data || []);
      } else {
        console.error('Dernekler API başarısız veya veri formatı hatalı:', response);
        setDernekler([]);
      }
    } catch (error) {
      console.error('Dernekler yüklenemedi:', error);
      setDernekler([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIlChange = (e) => {
    const il = e.target.value;
    onFilterChange({ 
      il, 
      ilce: '',
      dernek: ''
    });
  };

  const handleIlceChange = (e) => {
    const ilce = e.target.value;
    onFilterChange({ 
      ilce,
      dernek: ''
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl"> {/* padding ve rounded küçültüldü */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"> {/* Mobil tek sütun, tablet/masaüstü çoklu */}
        {/* İl Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">İl</label>
          <select
            value={filters.il}
            onChange={handleIlChange}
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 text-sm"
          >
            <option key="empty-il" value="">Tüm İller</option>
            {iller.map((il) => (
              <option key={`il-${il}`} value={il}>
                {il}
              </option>
            ))}
          </select>
        </div>
        
        {/* İlçe Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">İlçe</label>
          <select
            value={filters.ilce}
            onChange={handleIlceChange}
            disabled={!filters.il || loading}
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
          >
            <option key="empty-ilce" value="">Tüm İlçeler</option>
            {ilceler.map((ilce) => (
              <option key={`ilce-${ilce}`} value={ilce}>
                {ilce}
              </option>
            ))}
          </select>
        </div>
        
        {/* Dernek Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Dernek</label>
          <select
            value={filters.dernek}
            onChange={(e) => onFilterChange({ dernek: e.target.value })}
            disabled={!filters.il || loading}
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm"
          >
            <option key="empty-dernek" value="">Tüm Dernekler</option>
            {dernekler.map((dernek) => (
              <option key={`dernek-${dernek.id || dernek.dernek_adi}`} value={dernek.dernek_adi}>
                {dernek.dernek_adi}
              </option>
            ))}
          </select>
        </div>

        {/* Başlangıç Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç Tarihi</label>
          <input
            type="date"
            value={filters.baslangic_tarihi}
            onChange={(e) => onFilterChange({ baslangic_tarihi: e.target.value })}
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 text-sm"
          />
        </div>

        {/* Bitiş Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bitiş Tarihi</label>
          <input
            type="date"
            value={filters.bitis_tarihi}
            onChange={(e) => onFilterChange({ bitis_tarihi: e.target.value })}
            min={filters.baslangic_tarihi}
            className="block w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 text-sm" 
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4 sm:mt-6"> {/* Mobil boşluk */}
        <button
          onClick={onClearFilters}
          className="px-5 py-2 sm:px-6 sm:py-3 text-sm font-medium text-red-100 bg-red-700 rounded-xl hover:bg-red-600 transition-colors shadow-md" 
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
};

export default FaaliyetFilters;
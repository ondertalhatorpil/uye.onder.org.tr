import React, { useState, useEffect } from 'react';
import { constantsService } from '../../../services';

const FaaliyetFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [dernekler, setDernekler] = useState([]);
  const [loading, setLoading] = useState(false);

  // İlleri yükle
  useEffect(() => {
    const loadIller = async () => {
      try {
        console.log('İller yükleniyor...');
        
        // Eğer constants endpoint'i yoksa, dernekler endpoint'inden illeri çekelim
        let response;
        try {
          response = await constantsService.getIller();
        } catch (error) {
          console.log('Constants/iller endpoint bulunamadı, dernekler endpoint\'i deneniyor...');
          // Alternatif: Tüm dernekleri çek ve illerini ayıkla
          const derneklerResponse = await constantsService.getDerneklerByLocation(''); // Boş il ile tüm dernekler
          if (derneklerResponse.success) {
            const uniqueIller = [...new Set(derneklerResponse.data.map(d => d.il))].map(il => ({ il_adi: il }));
            console.log('Derneklerden çıkarılan iller:', uniqueIller);
            setIller(uniqueIller);
            return;
          }
        }
        
        console.log('İller API Response:', response);
        
        if (response.success) {
          console.log('İller Data:', response.data);
          setIller(response.data || []);
        } else {
          console.log('İller API başarısız:', response);
        }
      } catch (error) {
        console.error('İller yüklenemedi:', error);
      }
    };
    loadIller();
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (filters.il) {
      loadIlceler(filters.il);
    } else {
      setIlceler([]);
      setDernekler([]);
    }
  }, [filters.il]);

  // İlçe değiştiğinde dernekleri yükle
  useEffect(() => {
    if (filters.il) {
      loadDernekler(filters.il, filters.ilce);
    }
  }, [filters.il, filters.ilce]);

  const loadIlceler = async (il) => {
    try {
      setLoading(true);
      console.log('İlçeler yükleniyor, il:', il);
      const response = await constantsService.getIlceler(il);
      console.log('İlçeler response:', response);
      console.log('İlçeler data:', response.data);
      
      if (response.success) {
        console.log('İlk 3 İlçe:', response.data?.slice(0, 3));
        setIlceler(response.data || []);
      }
    } catch (error) {
      console.error('İlçeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDernekler = async (il, ilce = null) => {
    try {
      setLoading(true);
      console.log('Dernekler yükleniyor, il:', il, 'ilce:', ilce);
      const response = await constantsService.getDerneklerByLocation(il, ilce);
      console.log('Dernekler response:', response);
      console.log('Dernekler data:', response.data);
      
      if (response.success) {
        console.log('İlk 3 Dernek:', response.data?.slice(0, 3));
        console.log('Dernekler Array mı?', Array.isArray(response.data));
        if (response.data?.length > 0) {
          console.log('İlk dernek yapısı:', response.data[0]);
          console.log('İlk dernek keys:', Object.keys(response.data[0]));
        }
        setDernekler(response.data || []);
      }
    } catch (error) {
      console.error('Dernekler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIlChange = (e) => {
    const il = e.target.value;
    onFilterChange({ 
      il, 
      ilce: '', // İl değiştiğinde ilçeyi sıfırla
      dernek: '' // Derneği de sıfırla
    });
  };

  const handleIlceChange = (e) => {
    const ilce = e.target.value;
    onFilterChange({ 
      ilce,
      dernek: '' // İlçe değiştiğinde derneği sıfırla
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* İl Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
          <select
            value={filters.il}
            onChange={handleIlChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option key="empty-il" value="">Tüm İller</option>
            {iller.map((il, index) => (
              <option key={`il-${il}-${index}`} value={il}>
                {il}
              </option>
            ))}
          </select>
        </div>
        
        {/* İlçe Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
          <select
            value={filters.ilce}
            onChange={handleIlceChange}
            disabled={!filters.il || loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
          >
            <option key="empty-ilce" value="">Tüm İlçeler</option>
            {ilceler.map((ilce, index) => (
              <option key={`ilce-${ilce}-${index}`} value={ilce}>
                {ilce}
              </option>
            ))}
          </select>
        </div>
        
        {/* Dernek Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dernek</label>
          <select
            value={filters.dernek}
            onChange={(e) => onFilterChange({ dernek: e.target.value })}
            disabled={!filters.il || loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
          >
            <option key="empty-dernek" value="">Tüm Dernekler</option>
            {dernekler.map((dernek, index) => (
              <option key={`dernek-${dernek.id || dernek.dernek_adi}-${index}`} value={dernek.dernek_adi}>
                {dernek.dernek_adi}
              </option>
            ))}
          </select>
        </div>

        {/* Başlangıç Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
          <input
            type="date"
            value={filters.baslangic_tarihi}
            onChange={(e) => onFilterChange({ baslangic_tarihi: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Bitiş Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
          <input
            type="date"
            value={filters.bitis_tarihi}
            onChange={(e) => onFilterChange({ bitis_tarihi: e.target.value })}
            min={filters.baslangic_tarihi}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
};

export default FaaliyetFilters;
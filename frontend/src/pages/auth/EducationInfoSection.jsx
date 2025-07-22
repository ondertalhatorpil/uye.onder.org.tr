import React, { useState, useEffect } from 'react';
import { constantsService } from '../../services';
import { toast } from 'react-hot-toast';
import { FiBook, FiSearch, FiX } from 'react-icons/fi';

const EducationInfoSection = ({ formData, handleChange, onEducationDataChange }) => {
  // Okul arama state'leri
  const [ortaokulSearch, setOrtaokulSearch] = useState({
    iller: [],
    ilceler: [],
    okullar: [],
    searchText: '',
    selectedIl: '',
    selectedIlce: '',
    loading: false,
    showResults: false
  });

  const [liseSearch, setLiseSearch] = useState({
    iller: [],
    ilceler: [],
    okullar: [],
    searchText: '',
    selectedIl: '',
    selectedIlce: '',
    loading: false,
    showResults: false
  });

  // Yıl seçenekleri oluştur
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1980; year--) {
      years.push(year);
    }
    return years;
  };

  const years = generateYears();
  const ortaokulSiniflari = [5, 6, 7, 8];
  const liseSiniflari = [9, 10, 11, 12];

  // İlleri yükle
  useEffect(() => {
   const loadIller = async () => {
  console.log('🚀 loadIller başladı');
  try {
    console.log('📞 ortaokul illeri çağırılıyor...');
    const ortaokulIller = await constantsService.getIllerWithOkul('ortaokul');
    console.log('✅ ortaokulIller response:', ortaokulIller);
    
    console.log('📞 lise illeri çağırılıyor...');
    const liseIller = await constantsService.getIllerWithOkul('lise');
    console.log('✅ liseIller response:', liseIller);
    
    console.log('🔄 State güncelleniyor...');
    setOrtaokulSearch(prev => ({ ...prev, iller: ortaokulIller.iller || [] }));
    setLiseSearch(prev => ({ ...prev, iller: liseIller.iller || [] }));
    console.log('✅ State güncellendi');
    
  } catch (error) {
    console.error('❌ loadIller tam hata:', error);
  }
  console.log('🏁 loadIller tamamlandı');
};
    loadIller();
  }, []);

  // Ortaokul il değiştiğinde ilçeleri yükle
  const handleOrtaokulIlChange = async (il) => {
  if (!il) {
    setOrtaokulSearch(prev => ({
      ...prev,
      selectedIl: '',
      selectedIlce: '',
      ilceler: [],
      okullar: [],
      showResults: false
    }));
    return;
  }
  
  try {
    // İlçeleri yükle
    const response = await constantsService.getIlcelerWithOkul('ortaokul', il);
    setOrtaokulSearch(prev => ({
      ...prev,
      selectedIl: il,
      selectedIlce: '',
      ilceler: response.ilceler || [],
      okullar: [],
      showResults: false,
      loading: true // Okul yüklemeyi başlat
    }));

    // İldeki tüm okulları yükle (ilçe seçimi olmadan)
    const okullarResponse = await constantsService.getOkullarByIl('ortaokul', il);
    setOrtaokulSearch(prev => ({
      ...prev,
      okullar: okullarResponse.okullar || [],
      showResults: true, // Sonuçları göster
      loading: false
    }));

  } catch (error) {
    toast.error('İlçeler ve okullar yüklenemedi');
    setOrtaokulSearch(prev => ({ ...prev, loading: false }));
  }
};


const handleOrtaokulIlceChange = async (ilce) => {
  setOrtaokulSearch(prev => ({ ...prev, selectedIlce: ilce, loading: true }));

  if (!ilce) {
    // İlçe seçimi kaldırıldıysa, tüm ildeki okulları göster
    try {
      const response = await constantsService.getOkullarByIl('ortaokul', ortaokulSearch.selectedIl);
      setOrtaokulSearch(prev => ({
        ...prev,
        okullar: response.okullar || [],
        showResults: true,
        loading: false
      }));
    } catch (error) {
      toast.error('Okullar yüklenemedi');
      setOrtaokulSearch(prev => ({ ...prev, loading: false }));
    }
    return;
  }

  try {
    // Seçilen ilçedeki okulları yükle
    const response = await constantsService.getOkullarByIl('ortaokul', ortaokulSearch.selectedIl, ilce);
    setOrtaokulSearch(prev => ({
      ...prev,
      okullar: response.okullar || [],
      showResults: true,
      loading: false
    }));
  } catch (error) {
    toast.error('İlçe okulları yüklenemedi');
    setOrtaokulSearch(prev => ({ ...prev, loading: false }));
  }
};

  // Lise il değiştiğinde ilçeleri yükle
  const handleLiseIlChange = async (il) => {
  if (!il) {
    setLiseSearch(prev => ({
      ...prev,
      selectedIl: '',
      selectedIlce: '',
      ilceler: [],
      okullar: [],
      showResults: false
    }));
    return;
  }
  
  try {
    const response = await constantsService.getIlcelerWithOkul('lise', il);
    setLiseSearch(prev => ({
      ...prev,
      selectedIl: il,
      selectedIlce: '',
      ilceler: response.ilceler || [],
      okullar: [],
      showResults: false,
      loading: true
    }));

    const okullarResponse = await constantsService.getOkullarByIl('lise', il);
    setLiseSearch(prev => ({
      ...prev,
      okullar: okullarResponse.okullar || [],
      showResults: true,
      loading: false
    }));

  } catch (error) {
    toast.error('İlçeler ve okullar yüklenemedi');
    setLiseSearch(prev => ({ ...prev, loading: false }));
  }
};


const handleLiseIlceChange = async (ilce) => {
  setLiseSearch(prev => ({ ...prev, selectedIlce: ilce, loading: true }));

  if (!ilce) {
    try {
      const response = await constantsService.getOkullarByIl('lise', liseSearch.selectedIl);
      setLiseSearch(prev => ({
        ...prev,
        okullar: response.okullar || [],
        showResults: true,
        loading: false
      }));
    } catch (error) {
      toast.error('Okullar yüklenemedi');
      setLiseSearch(prev => ({ ...prev, loading: false }));
    }
    return;
  }

  try {
    const response = await constantsService.getOkullarByIl('lise', liseSearch.selectedIl, ilce);
    setLiseSearch(prev => ({
      ...prev,
      okullar: response.okullar || [],
      showResults: true,
      loading: false
    }));
  } catch (error) {
    toast.error('İlçe okulları yüklenemedi');
    setLiseSearch(prev => ({ ...prev, loading: false }));
  }
};



  // Okul arama fonksiyonu
  const searchOkullar = async (okulTuru, searchState, setSearchState) => {
    const { searchText, selectedIl, selectedIlce } = searchState;
    
    if (!selectedIl || (!searchText && !selectedIlce)) return;

    setSearchState(prev => ({ ...prev, loading: true }));

    try {
      const filters = {
        il: selectedIl,
        ...(selectedIlce && { ilce: selectedIlce }),
        ...(searchText && { search: searchText }),
        limit: 20
      };

      const response = await constantsService.searchOkullar(okulTuru, filters);
      
      setSearchState(prev => ({
        ...prev,
        okullar: response.okullar || [],
        showResults: true,
        loading: false
      }));
    } catch (error) {
      toast.error('Okullar aranırken hata oluştu');
      setSearchState(prev => ({ ...prev, loading: false }));
    }
  };

  // Okul seçme fonksiyonu
  const selectOkul = (okulTuru, okul) => {
    if (okulTuru === 'ortaokul') {
      onEducationDataChange({
        [`${okulTuru}_id`]: okul.id,
        [`${okulTuru}_custom`]: ''
      });
      setOrtaokulSearch(prev => ({ ...prev, showResults: false, searchText: okul.kurum_adi }));
    } else {
      onEducationDataChange({
        [`${okulTuru}_id`]: okul.id,
        [`${okulTuru}_custom`]: ''
      });
      setLiseSearch(prev => ({ ...prev, showResults: false, searchText: okul.kurum_adi }));
    }
  };

  // Custom okul girişi
  const handleCustomOkul = (okulTuru, value) => {
    onEducationDataChange({
      [`${okulTuru}_id`]: null,
      [`${okulTuru}_custom`]: value
    });
  };

  return (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-lg flex items-center justify-center">
        <FiBook className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 ml-3">Eğitim Bilgileri</h3>
    </div>

    <div className="space-y-8">
      {/* ORTAOKUL BİLGİLERİ */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Ortaokul Bilgileri</h4>
        
        {/* Ortaokul Durumu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ortaokul Durumu</label>
            <select
              name="ortaokul_durumu"
              value={formData.ortaokul_durumu || 'okumadi'}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            >
              <option value="okumadi">Okumadım</option>
              <option value="mezun">Mezunum</option>
              <option value="devam_ediyor">Devam Ediyorum</option>
            </select>
          </div>

          {formData.ortaokul_durumu === 'mezun' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mezuniyet Yılı *</label>
              <select
                name="ortaokul_mezun_yili"
                value={formData.ortaokul_mezun_yili || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              >
                <option value="">Yıl seçiniz</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {formData.ortaokul_durumu === 'devam_ediyor' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sınıf *</label>
              <select
                name="ortaokul_sinif"
                value={formData.ortaokul_sinif || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              >
                <option value="">Sınıf seçiniz</option>
                {ortaokulSiniflari.map(sinif => (
                  <option key={sinif} value={sinif}>{sinif}. Sınıf</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Ortaokul Seçimi */}
        {(formData.ortaokul_durumu === 'mezun' || formData.ortaokul_durumu === 'devam_ediyor') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">İl *</label>
                <select
                  value={ortaokulSearch.selectedIl}
                  onChange={(e) => handleOrtaokulIlChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
                >
                  <option value="">İl seçiniz</option>
                  {ortaokulSearch.iller.map(il => (
                    <option key={il.il_adi} value={il.il_adi}>
                      {il.il_adi} ({il.okul_sayisi} okul)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">İlçe (Opsiyonel)</label>
                <select
                  value={ortaokulSearch.selectedIlce}
                  onChange={(e) => handleOrtaokulIlceChange(e.target.value)}
                  disabled={!ortaokulSearch.selectedIl}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                >
                  <option value="">Tüm ilçeler</option>
                  {ortaokulSearch.ilceler.map(ilce => (
                    <option key={ilce.ilce_adi} value={ilce.ilce_adi}>
                      {ilce.ilce_adi} ({ilce.okul_sayisi} okul)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arama Input'u */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Okul Adı Ara (Filtreleme)</label>
              <div className="relative">
                <input
                  type="text"
                  value={ortaokulSearch.searchText}
                  onChange={(e) => setOrtaokulSearch(prev => ({ ...prev, searchText: e.target.value }))}
                  placeholder="Okul adı yazın (filtreleme için)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Okul Listesi */}
            {ortaokulSearch.selectedIl && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-800">
                    {ortaokulSearch.selectedIlce 
                      ? `${ortaokulSearch.selectedIlce} İlçesi Ortaokulları` 
                      : `${ortaokulSearch.selectedIl} İli Ortaokulları`
                    }
                  </h5>
                  {ortaokulSearch.loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E2000A] border-t-transparent"></div>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {ortaokulSearch.okullar
                    .filter(okul => 
                      !ortaokulSearch.searchText || 
                      okul.kurum_adi.toLowerCase().includes(ortaokulSearch.searchText.toLowerCase())
                    )
                    .map(okul => (
                      <button
                        key={okul.id}
                        type="button"
                        onClick={() => selectOkul('ortaokul', okul)}
                        className="w-full text-left p-3 bg-white rounded border hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#E2000A]"
                      >
                        <div className="font-medium text-gray-800">{okul.kurum_adi}</div>
                        <div className="text-sm text-gray-600">{okul.il_adi} / {okul.ilce_adi}</div>
                      </button>
                    ))}
                </div>
                
                {ortaokulSearch.okullar.length === 0 && !ortaokulSearch.loading && (
                  <p className="text-gray-500 text-center py-4">Bu bölgede ortaokul bulunamadı</p>
                )}
              </div>
            )}

            {/* Manuel Okul Girişi */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Veya okul adını manuel girin *
              </label>
              <input
                type="text"
                value={formData.ortaokul_custom || ''}
                onChange={(e) => handleCustomOkul('ortaokul', e.target.value)}
                placeholder="Ortaokul adını yazın..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* LİSE BİLGİLERİ */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Lise Bilgileri</h4>
        
        {/* Lise Durumu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Lise Durumu</label>
            <select
              name="lise_durumu"
              value={formData.lise_durumu || 'okumadi'}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            >
              <option value="okumadi">Okumadım</option>
              <option value="mezun">Mezunum</option>
              <option value="devam_ediyor">Devam Ediyorum</option>
            </select>
          </div>

          {formData.lise_durumu === 'mezun' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mezuniyet Yılı *</label>
              <select
                name="lise_mezun_yili"
                value={formData.lise_mezun_yili || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              >
                <option value="">Yıl seçiniz</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {formData.lise_durumu === 'devam_ediyor' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sınıf *</label>
              <select
                name="lise_sinif"
                value={formData.lise_sinif || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              >
                <option value="">Sınıf seçiniz</option>
                {liseSiniflari.map(sinif => (
                  <option key={sinif} value={sinif}>{sinif}. Sınıf</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Lise Seçimi */}
        {(formData.lise_durumu === 'mezun' || formData.lise_durumu === 'devam_ediyor') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">İl *</label>
                <select
                  value={liseSearch.selectedIl}
                  onChange={(e) => handleLiseIlChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
                >
                  <option value="">İl seçiniz</option>
                  {liseSearch.iller.map(il => (
                    <option key={il.il_adi} value={il.il_adi}>
                      {il.il_adi} ({il.okul_sayisi} okul)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">İlçe (Opsiyonel)</label>
                <select
                  value={liseSearch.selectedIlce}
                  onChange={(e) => handleLiseIlceChange(e.target.value)}
                  disabled={!liseSearch.selectedIl}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                >
                  <option value="">Tüm ilçeler</option>
                  {liseSearch.ilceler.map(ilce => (
                    <option key={ilce.ilce_adi} value={ilce.ilce_adi}>
                      {ilce.ilce_adi} ({ilce.okul_sayisi} okul)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arama Input'u */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Okul Adı Ara (Filtreleme)</label>
              <div className="relative">
                <input
                  type="text"
                  value={liseSearch.searchText}
                  onChange={(e) => setLiseSearch(prev => ({ ...prev, searchText: e.target.value }))}
                  placeholder="Okul adı yazın (filtreleme için)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Okul Listesi */}
            {liseSearch.selectedIl && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-800">
                    {liseSearch.selectedIlce 
                      ? `${liseSearch.selectedIlce} İlçesi Liseleri` 
                      : `${liseSearch.selectedIl} İli Liseleri`
                    }
                  </h5>
                  {liseSearch.loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E2000A] border-t-transparent"></div>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {liseSearch.okullar
                    .filter(okul => 
                      !liseSearch.searchText || 
                      okul.kurum_adi.toLowerCase().includes(liseSearch.searchText.toLowerCase())
                    )
                    .map(okul => (
                      <button
                        key={okul.id}
                        type="button"
                        onClick={() => selectOkul('lise', okul)}
                        className="w-full text-left p-3 bg-white rounded border hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#E2000A]"
                      >
                        <div className="font-medium text-gray-800">{okul.kurum_adi}</div>
                        <div className="text-sm text-gray-600">{okul.il_adi} / {okul.ilce_adi}</div>
                      </button>
                    ))}
                </div>
                
                {liseSearch.okullar.length === 0 && !liseSearch.loading && (
                  <p className="text-gray-500 text-center py-4">Bu bölgede lise bulunamadı</p>
                )}
              </div>
            )}

            {/* Manuel Lise Girişi */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Veya okul adını manuel girin *
              </label>
              <input
                type="text"
                value={formData.lise_custom || ''}
                onChange={(e) => handleCustomOkul('lise', e.target.value)}
                placeholder="Lise adını yazın..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* ÜNİVERSİTE DURUMU */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Üniversite Durumu</h4>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Üniversite Durumunuz</label>
          <select
            name="universite_durumu"
            value={formData.universite_durumu || 'okumadi'}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
          >
            <option value="okumadi">Okumadım</option>
            <option value="devam_ediyor">Devam Ediyorum</option>
            <option value="mezun">Mezunum</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);
};

export default EducationInfoSection;
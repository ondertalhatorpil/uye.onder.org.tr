import React, { useState, useEffect, useCallback } from 'react'; // useCallback eklendi
import { constantsService } from '../../services';
import { toast } from 'react-hot-toast';
import { 
  FiBook, 
  FiSearch, 
  FiX, 
  FiCalendar, 
  FiMapPin 
} from 'react-icons/fi'; // FiSchool kaldırıldı, FiCalendar ve FiMapPin eklendi

// InputField Helper Component (Tekrar tanımlanıyor, emin olmak için)
const InputField = ({ label, name, type = "text", icon: Icon, value, placeholder, onChange, options = null, disabled = false, hint = null, required = false }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-500">*</span>} {/* required prop'una göre yıldız ekle */}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
      )}
    </div>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);


const EducationInfoSection = ({ formData, handleChange, onEducationDataChange }) => {
  // Okul arama state'leri için ortak bir yapı ve set fonksiyonu
  const [schoolSearchStates, setSchoolSearchStates] = useState({
    ortaokul: {
      iller: [],
      ilceler: [],
      okullar: [],
      searchText: '',
      selectedIl: '',
      selectedIlce: '',
      loading: false,
      showResults: false
    },
    lise: {
      iller: [],
      ilceler: [],
      okullar: [],
      searchText: '',
      selectedIl: '',
      selectedIlce: '',
      loading: false,
      showResults: false
    }
  });

  // Belirli bir okul türünün (ortaokul/lise) state'ini güncelleyen yardımcı fonksiyon
  const setSchoolSearchState = useCallback((schoolType, updates) => {
    setSchoolSearchStates(prev => ({
      ...prev,
      [schoolType]: { ...prev[schoolType], ...updates }
    }));
  }, []);

  // Yıl seçenekleri oluştur
  const generateYears = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1980; year--) {
      years.push({ value: year, label: year });
    }
    return years;
  }, []); // useCallback ile hafızaya al

  const years = generateYears();

  // İlleri yükle
  useEffect(() => {
    const loadIller = async () => {
      setSchoolSearchState('ortaokul', { loading: true });
      setSchoolSearchState('lise', { loading: true });

      try {
        const [ortaokulIllerRes, liseIllerRes] = await Promise.allSettled([
          constantsService.getIllerWithOkul('ortaokul'),
          constantsService.getIllerWithOkul('lise')
        ]);

        if (ortaokulIllerRes.status === 'fulfilled') {
          setSchoolSearchState('ortaokul', { iller: ortaokulIllerRes.value.iller || [] });
        } else {
          toast.error('Ortaokul illeri yüklenemedi.');
          console.error('Ortaokul illeri hata:', ortaokulIllerRes.reason);
        }

        if (liseIllerRes.status === 'fulfilled') {
          setSchoolSearchState('lise', { iller: liseIllerRes.value.iller || [] });
        } else {
          toast.error('Lise illeri yüklenemedi.');
          console.error('Lise illeri hata:', liseIllerRes.reason);
        }
        
      } catch (error) {
        console.error('Eğitim verileri yüklenirken bir hata oluştu:', error);
        toast.error('Eğitim verileri yüklenirken beklenmeyen bir hata oluştu.');
      } finally {
        setSchoolSearchState('ortaokul', { loading: false });
        setSchoolSearchState('lise', { loading: false });
      }
    };
    loadIller();
  }, [setSchoolSearchState]);

  // İl/İlçe/Okul bilgilerini yükleyen genel fonksiyon
  const loadSchoolData = useCallback(async (schoolType, selectedIl, selectedIlce = null) => {
    setSchoolSearchState(schoolType, { loading: true, okullar: [] }); // Okulları temizle

    try {
      const [ilcelerRes, okullarRes] = await Promise.all([
        selectedIl ? constantsService.getIlcelerWithOkul(schoolType, selectedIl) : Promise.resolve({ ilceler: [] }),
        selectedIl ? constantsService.getOkullarByIl(schoolType, selectedIl, selectedIlce) : Promise.resolve({ okullar: [] })
      ]);

      setSchoolSearchState(schoolType, {
        ilceler: ilcelerRes.ilceler || [],
        okullar: okullarRes.okullar || [],
        loading: false
      });
    } catch (error) {
      toast.error(`${schoolType === 'ortaokul' ? 'Ortaokul' : 'Lise'} ilçeleri veya okulları yüklenemedi.`);
      setSchoolSearchState(schoolType, { loading: false });
      console.error(`Error loading ${schoolType} data:`, error);
    }
  }, [setSchoolSearchState]);

  const handleIlChange = useCallback(async (schoolType, il) => {
    setSchoolSearchState(schoolType, {
      selectedIl: il,
      selectedIlce: '', // İl değiştiğinde ilçe sıfırlanır
      searchText: '', // İl değiştiğinde arama metni sıfırlanır
      showResults: il !== '', // İl seçilirse sonuçları göster
      ilceler: [], // Yeni il seçildiğinde ilçeleri sıfırla
      okullar: [] // Yeni il seçildiğinde okulları sıfırla
    });

    if (il) {
      await loadSchoolData(schoolType, il);
    }
  }, [setSchoolSearchState, loadSchoolData]);

  const handleIlceChange = useCallback(async (schoolType, ilce) => {
    setSchoolSearchState(schoolType, prev => ({ 
      ...prev, 
      selectedIlce: ilce, 
      searchText: '', // İlçe değiştiğinde arama metni sıfırlanır
      okullar: [] // Yeni ilçeye göre okulları sıfırla
    }));

    if (schoolSearchStates[schoolType].selectedIl) { // İl seçili olduğundan emin ol
      await loadSchoolData(schoolType, schoolSearchStates[schoolType].selectedIl, ilce);
    }
  }, [setSchoolSearchStates, loadSchoolData, schoolSearchStates]);


  // Okul seçme fonksiyonu
  const selectOkul = useCallback((schoolType, okul) => {
    onEducationDataChange({
      [`${schoolType}_id`]: okul.id,
      [`${schoolType}_custom`]: '' // Özel okul alanını temizle
    });
    setSchoolSearchState(schoolType, prev => ({ 
      ...prev, 
      showResults: false, 
      searchText: okul.kurum_adi, // Seçilen okulun adını arama kutusuna yazdır
      selectedIl: okul.il_adi, 
      selectedIlce: okul.ilce_adi, 
    }));
    // Seçilen okulun il ve ilçe bilgilerine göre dropdown'ları güncelle
    handleIlChange(schoolType, okul.il_adi); 
    handleIlceChange(schoolType, okul.ilce_adi); 
  }, [onEducationDataChange, setSchoolSearchState, handleIlChange, handleIlceChange]);

  // Custom okul girişi
  const handleCustomOkul = useCallback((schoolType, value) => {
    onEducationDataChange({
      [`${schoolType}_id`]: null,
      [`${schoolType}_custom`]: value
    });
    setSchoolSearchState(schoolType, prev => ({ // Özel okul girildiğinde diğer search alanlarını sıfırla/temizle
      ...prev, 
      searchText: value, // Arama kutusuna manuel girilen değeri yaz
      selectedIl: '', 
      selectedIlce: '', 
      ilceler: [], 
      okullar: [], 
      showResults: false
    }));
  }, [onEducationDataChange, setSchoolSearchState]);

  // Okul bilgisi temizleme fonksiyonu
  const clearOkulSelection = useCallback((schoolType) => {
    onEducationDataChange({
      [`${schoolType}_id`]: null,
      [`${schoolType}_custom`]: '', // Null yerine boş string
      [`${schoolType}_mezun_yili`]: '' // Mezuniyet yılını da sıfırla (boş string)
    });
    setSchoolSearchState(schoolType, prev => ({
      ...prev,
      ilceler: [],
      okullar: [],
      searchText: '',
      selectedIl: '',
      selectedIlce: '',
      loading: false,
      showResults: false
    }));
    toast.success(`${schoolType === 'ortaokul' ? 'Ortaokul' : 'Lise'} bilgileri temizlendi.`);
  }, [onEducationDataChange, setSchoolSearchState]);


  // Ortaokul ve Lise state'lerini daha kısa erişim için
  const ortaokulState = schoolSearchStates.ortaokul;
  const liseState = schoolSearchStates.lise;

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-700 p-4 sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-9 h-9 sm:w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiBook className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white ml-3">Eğitim Bilgileri</h3>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* ORTAOKUL BİLGİLERİ */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-5 relative">
          <h4 className="text-base sm:text-lg font-medium text-white mb-4">Ortaokul Bilgileri</h4>
          
          {/* Temizle butonu */}
          {(formData.ortaokul_mezun_yili || formData.ortaokul_id || formData.ortaokul_custom) && (
            <button
              type="button"
              onClick={() => clearOkulSelection('ortaokul')}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-red-800 text-white hover:bg-red-900 transition-colors z-10"
              title="Ortaokul bilgilerini temizle"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Mezuniyet Yılı (Ortaokul)"
              name="ortaokul_mezun_yili"
              type="select"
              icon={FiCalendar}
              value={formData.ortaokul_mezun_yili || ''}
              onChange={handleChange}
              placeholder="Yıl seçiniz"
              options={years}
            />
          </div>

          {/* Ortaokul Seçimi - Sadece mezuniyet yılı seçildiyse göster */}
          {formData.ortaokul_mezun_yili && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="İl (Ortaokul)"
                  name="ortaokul_selectedIl"
                  icon={FiMapPin}
                  value={ortaokulState.selectedIl}
                  onChange={(e) => handleIlChange('ortaokul', e.target.value)}
                  placeholder="İl seçiniz"
                  options={ortaokulState.iller.map(il => ({ value: il.il_adi, label: `${il.il_adi} (${il.okul_sayisi} okul)` }))}
                  disabled={ortaokulState.loading}
                  hint={ortaokulState.loading && ortaokulState.selectedIl === '' ? "İller yükleniyor..." : null}
                  required // Zorunlu alan olarak işaretle
                />

                <InputField
                  label="İlçe (Ortaokul - Opsiyonel)"
                  name="ortaokul_selectedIlce"
                  icon={FiMapPin}
                  value={ortaokulState.selectedIlce}
                  onChange={(e) => handleIlceChange('ortaokul', e.target.value)}
                  placeholder="Tüm ilçeler"
                  options={ortaokulState.ilceler.map(ilce => ({ value: ilce.ilce_adi, label: `${ilce.ilce_adi} (${ilce.okul_sayisi} okul)` }))}
                  disabled={!ortaokulState.selectedIl || ortaokulState.loading}
                  hint={ortaokulState.loading && ortaokulState.selectedIlce === '' && ortaokulState.selectedIl !== '' ? "İlçeler yükleniyor..." : null}
                />
              </div>

              {/* Arama Input'u */}
              <InputField
                label="Okul Adı Ara (Filtreleme)"
                name="ortaokul_searchText"
                icon={FiSearch}
                value={ortaokulState.searchText}
                onChange={(e) => setSchoolSearchState('ortaokul', { searchText: e.target.value })}
                placeholder="Okul adı yazın (filtreleme için)..."
                hint="Yukarıdaki il ve ilçe seçimine göre filtreler."
              />

              {/* Okul Listesi */}
              {ortaokulState.selectedIl && ortaokulState.showResults && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-300 text-sm">
                      {ortaokulState.selectedIlce 
                        ? `${ortaokulState.selectedIlce} İlçesi Ortaokulları` 
                        : `${ortaokulState.selectedIl} İli Ortaokulları`
                      }
                    </h5>
                    {ortaokulState.loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    )}
                  </div>
                  
                  <div className="max-h-52 sm:max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {ortaokulState.okullar
                      .filter(okul => 
                        !ortaokulState.searchText || 
                        okul.kurum_adi.toLowerCase().includes(ortaokulState.searchText.toLowerCase())
                      )
                      .map(okul => (
                        <button
                          key={okul.id}
                          type="button"
                          onClick={() => selectOkul('ortaokul', okul)}
                          className={`w-full text-left p-3 rounded-md border transition-all duration-200 
                            ${formData.ortaokul_id === okul.id 
                              ? 'bg-red-700 border-red-600 text-white shadow-md' 
                              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-red-500'
                            }`}
                        >
                          <div className="font-medium text-base">{okul.kurum_adi}</div>
                          <div className="text-sm text-gray-400">{okul.il_adi} / {okul.ilce_adi}</div>
                        </button>
                      ))}
                  </div>
                  
                  {ortaokulState.okullar.length === 0 && !ortaokulState.loading && (
                    <p className="text-gray-500 text-center py-4 text-sm">Bu bölgede ortaokul bulunamadı.</p>
                  )}
                  {ortaokulState.okullar.length > 0 && 
                   ortaokulState.searchText && 
                   ortaokulState.okullar.filter(okul => !ortaokulState.searchText || okul.kurum_adi.toLowerCase().includes(ortaokulState.searchText.toLowerCase())).length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">Aramanıza uygun okul bulunamadı.</p>
                  )}
                </div>
              )}

              {/* Manuel Okul Girişi */}
              <InputField
                label="Veya okul adını manuel girin"
                name="ortaokul_custom"
                icon={FiBook} 
                value={formData.ortaokul_custom || ''}
                onChange={(e) => handleCustomOkul('ortaokul', e.target.value)}
                placeholder="Ortaokul adını yazın..."
                hint="Yukarıdaki listede bulamazsanız manuel girebilirsiniz."
                required={!formData.ortaokul_id} // Ya listeden seçilmeli ya da manuel girilmeli
              />
            </div>
          )}
        </div>

        {/* LİSE BİLGİLERİ */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-5 relative">
          <h4 className="text-base sm:text-lg font-medium text-white mb-4">Lise Bilgileri</h4>

          {/* Temizle butonu */}
          {(formData.lise_mezun_yili || formData.lise_id || formData.lise_custom) && (
            <button
              type="button"
              onClick={() => clearOkulSelection('lise')}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-red-800 text-white hover:bg-red-900 transition-colors z-10"
              title="Lise bilgilerini temizle"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Mezuniyet Yılı (Lise)"
              name="lise_mezun_yili"
              type="select"
              icon={FiCalendar}
              value={formData.lise_mezun_yili || ''}
              onChange={handleChange}
              placeholder="Yıl seçiniz"
              options={years}
            />
          </div>

          {/* Lise Seçimi - Sadece mezuniyet yılı seçildiyse göster */}
          {formData.lise_mezun_yili && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="İl (Lise)"
                  name="lise_selectedIl"
                  icon={FiMapPin}
                  value={liseState.selectedIl}
                  onChange={(e) => handleIlChange('lise', e.target.value)}
                  placeholder="İl seçiniz"
                  options={liseState.iller.map(il => ({ value: il.il_adi, label: `${il.il_adi} (${il.okul_sayisi} okul)` }))}
                  disabled={liseState.loading}
                  hint={liseState.loading && liseState.selectedIl === '' ? "İller yükleniyor..." : null}
                  required
                />

                <InputField
                  label="İlçe (Lise - Opsiyonel)"
                  name="lise_selectedIlce"
                  icon={FiMapPin}
                  value={liseState.selectedIlce}
                  onChange={(e) => handleIlceChange('lise', e.target.value)}
                  placeholder="Tüm ilçeler"
                  options={liseState.ilceler.map(ilce => ({ value: ilce.ilce_adi, label: `${ilce.ilce_adi} (${ilce.okul_sayisi} okul)` }))}
                  disabled={!liseState.selectedIl || liseState.loading}
                  hint={liseState.loading && liseState.selectedIlce === '' && liseState.selectedIl !== '' ? "İlçeler yükleniyor..." : null}
                />
              </div>

              {/* Arama Input'u */}
              <InputField
                label="Okul Adı Ara (Filtreleme)"
                name="lise_searchText"
                icon={FiSearch}
                value={liseState.searchText}
                onChange={(e) => setSchoolSearchState('lise', { searchText: e.target.value })}
                placeholder="Okul adı yazın (filtreleme için)..."
                hint="Yukarıdaki il ve ilçe seçimine göre filtreler."
              />

              {/* Okul Listesi */}
              {liseState.selectedIl && liseState.showResults && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-300 text-sm">
                      {liseState.selectedIlce 
                        ? `${liseState.selectedIlce} İlçesi Liseleri` 
                        : `${liseState.selectedIl} İli Liseleri`
                      }
                    </h5>
                    {liseState.loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    )}
                  </div>
                  
                  <div className="max-h-52 sm:max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {liseState.okullar
                      .filter(okul => 
                        !liseState.searchText || 
                        okul.kurum_adi.toLowerCase().includes(liseState.searchText.toLowerCase())
                      )
                      .map(okul => (
                        <button
                          key={okul.id}
                          type="button"
                          onClick={() => selectOkul('lise', okul)}
                          className={`w-full text-left p-3 rounded-md border transition-all duration-200 
                            ${formData.lise_id === okul.id 
                              ? 'bg-red-700 border-red-600 text-white shadow-md' 
                              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-red-500'
                            }`}
                        >
                          <div className="font-medium text-base">{okul.kurum_adi}</div>
                          <div className="text-sm text-gray-400">{okul.il_adi} / {okul.ilce_adi}</div>
                        </button>
                      ))}
                  </div>
                  
                  {liseState.okullar.length === 0 && !liseState.loading && (
                    <p className="text-gray-500 text-center py-4 text-sm">Bu bölgede lise bulunamadı.</p>
                  )}
                  {liseState.okullar.length > 0 && 
                   liseState.searchText && 
                   liseState.okullar.filter(okul => !liseState.searchText || okul.kurum_adi.toLowerCase().includes(liseState.searchText.toLowerCase())).length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">Aramanıza uygun okul bulunamadı.</p>
                  )}
                </div>
              )}

              {/* Manuel Lise Girişi */}
              <InputField
                label="Veya lise adını manuel girin"
                name="lise_custom"
                icon={FiBook} 
                value={formData.lise_custom || ''}
                onChange={(e) => handleCustomOkul('lise', e.target.value)}
                placeholder="Lise adını yazın..."
                hint="Yukarıdaki listede bulamazsanız manuel girebilirsiniz."
                required={!formData.lise_id} // Ya listeden seçilmeli ya da manuel girilmeli
              />
            </div>
          )}
        </div>

        {/* ÜNİVERSİTE DURUMU */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-5">
          <h4 className="text-base sm:text-lg font-medium text-white mb-4">Üniversite Bilgileri</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Üniversite Durumunuz"
              name="universite_durumu"
              type="select"
              icon={FiBook} 
              value={formData.universite_durumu || 'okumadi'}
              onChange={handleChange}
              options={[
                { value: 'okumadi', label: 'Okumadım' },
                { value: 'devam_ediyor', label: 'Devam Ediyorum' },
                { value: 'mezun', label: 'Mezunum' }
              ]}
              required
            />

            {/* Mezuniyet Yılı - Sadece mezun ise göster */}
            {formData.universite_durumu === 'mezun' && (
              <InputField
                label="Mezuniyet Yılı"
                name="universite_mezun_yili"
                type="select"
                icon={FiCalendar}
                value={formData.universite_mezun_yili || ''}
                onChange={handleChange}
                placeholder="Yıl seçiniz"
                options={years}
                required
              />
            )}
          </div>

          {/* Üniversite Bilgileri - Devam ediyor veya mezun ise göster */}
          {(formData.universite_durumu === 'mezun' || formData.universite_durumu === 'devam_ediyor') && (
            <div className="space-y-4 mt-4">
              <InputField
                label="Üniversite Adı"
                name="universite_adi"
                icon={FiBook} 
                value={formData.universite_adi || ''}
                onChange={handleChange}
                placeholder="Üniversite adını yazın..."
                required
              />

              <InputField
                label="Bölüm"
                name="universite_bolum"
                icon={FiBook}
                value={formData.universite_bolum || ''}
                onChange={handleChange}
                placeholder="Bölüm adını yazın..."
                required
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationInfoSection;
import React, { useState, useEffect } from 'react';
import { FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import authService from '../../services/authService'; 

const Settings = () => {

  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Gizlilik ayarları yükleniyor...');
        const response = await authService.getPrivacySettings();
        
        console.log('Privacy settings response:', response);
        
        if (response.success) {
          setShowEmail(response.data.show_email);
          setShowPhone(response.data.show_phone);
          console.log('Ayarlar yüklendi:', { 
            show_email: response.data.show_email, 
            show_phone: response.data.show_phone 
          });
        } else {
          throw new Error(response.error || 'Ayarlar yüklenemedi');
        }
      } catch (err) {
        console.error('Settings load error:', err);
        setError(err.message);
        toast.error('Ayarlar yüklenirken hata oluştu: ' + err.message);
        
        // Hata durumunda varsayılan değerleri kullan
        setShowEmail(true);
        setShowPhone(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Ayarları kaydet
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);

      console.log('Ayarlar kaydediliyor:', { show_email: showEmail, show_phone: showPhone });
      
      const response = await authService.updatePrivacySettings({
        show_email: showEmail,
        show_phone: showPhone
      });

      console.log('Privacy settings update response:', response);

      if (response.success) {
        toast.success('Ayarlar başarıyla kaydedildi!');
        console.log('Güncellenmiş ayarlar:', response.data);
      } else {
        throw new Error(response.error || 'Ayarlar kaydedilemedi');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      setError(err.message);
      toast.error('Ayarlar kaydedilirken hata oluştu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl mx-auto bg-gray-850 rounded-xl sm:rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-400">Ayarlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-gray-850 rounded-xl sm:rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900 flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex-1">Gizlilik Ayarları</h1>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isSaving
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                Ayarları Kaydet
              </>
            )}
          </button>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="p-4 bg-red-900/20 text-red-300 border-b border-red-800 flex items-center">
            <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Settings Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Email Setting */}
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div>
                <label htmlFor="showEmailToggle" className="text-base font-medium text-white cursor-pointer">
                  E-posta Adresimi Herkese Göster
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  E-posta adresinizin profilinizde ve arama sonuçlarında görünmesini sağlar.
                </p>
              </div>
            </div>
            <label htmlFor="showEmailToggle" className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                id="showEmailToggle"
                className="sr-only peer"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                disabled={isSaving}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Phone Number Setting */}
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div>
                <label htmlFor="showPhoneToggle" className="text-base font-medium text-white cursor-pointer">
                  Telefon Numaramı Herkese Göster
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  Telefon numaranızın profilinizde ve arama sonuçlarında görünmesini sağlar.
                </p>
              </div>
            </div>
            <label htmlFor="showPhoneToggle" className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                id="showPhoneToggle"
                className="sr-only peer"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                disabled={isSaving}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Bilgi Kutusu */}
          <div className="flex items-start p-4 bg-blue-900/20 rounded-lg border border-blue-900 text-blue-300 shadow-sm">
            <FiAlertCircle className="h-5 w-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white text-base">Gizlilik Notu</h3>
              <p className="text-sm mb-2">
                Bu ayarlar sadece profil sayfanızdaki ve arama sonuçlarındaki görünürlüğü etkiler.
              </p>
              <ul className="text-xs space-y-1">
                <li>• Verileriniz sistemimizde güvende tutulmaktadır</li>
                <li>• Kendi profilinizi her zaman tam olarak görürsünüz</li>
                <li>• Değişiklikler anında etkili olur</li>
              </ul>
            </div>
          </div>

          {/* Mevcut Durum Özeti */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
            <h3 className="font-semibold text-white text-base mb-3">Mevcut Ayarlarınız</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">E-posta Görünürlüğü:</span>
                <span className={`font-medium ${showEmail ? 'text-green-400' : 'text-red-400'}`}>
                  {showEmail ? 'Herkese Açık' : 'Gizli'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Telefon Görünürlüğü:</span>
                <span className={`font-medium ${showPhone ? 'text-green-400' : 'text-red-400'}`}>
                  {showPhone ? 'Herkese Açık' : 'Gizli'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
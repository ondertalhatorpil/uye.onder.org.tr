import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiSave, FiAlertCircle, FiCode } from 'react-icons/fi'; // FiCode ikonu eklendi
import { toast } from 'react-hot-toast'; // Toast bildirimleri için

const Settings = () => {
  // Ayar durumları, başlangıçta kullanıcı tercihlerinden veya varsayılandan gelsin
  const [showEmail, setShowEmail] = useState(true); // Varsayılan olarak true
  const [showPhone, setShowPhone] = useState(false); // Varsayılan olarak false
  const [isSaving, setIsSaving] = useState(false); // Kaydetme durumu

  // Gerçek bir uygulamada, bu useEffect içinde kullanıcının mevcut ayarlarını API'den çekerdiniz.
  // Örnek olarak, localStorage'dan okuyalım:
  useEffect(() => {
    const savedEmailSetting = localStorage.getItem('showEmail');
    const savedPhoneSetting = localStorage.getItem('showPhone');

    if (savedEmailSetting !== null) {
      setShowEmail(JSON.parse(savedEmailSetting));
    }
    if (savedPhoneSetting !== null) {
      setShowPhone(JSON.parse(savedPhoneSetting));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Burada sunucuya bir API çağrısı yapardınız
    // Örn: await userService.updateUserSettings({ showEmail, showPhone });

    // API çağrısı simülasyonu
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Ayarlar kaydedildi:', { showEmail, showPhone });
        localStorage.setItem('showEmail', JSON.stringify(showEmail));
        localStorage.setItem('showPhone', JSON.stringify(showPhone));
        setIsSaving(false);
        toast.success('Ayarlar başarıyla kaydedildi!');
        resolve();
      }, 1500); // 1.5 saniye gecikme
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-gray-850 rounded-xl sm:rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900 flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex-1">Ayarlar</h1>
          <button
            // onClick={handleSaveSettings}
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

        {/* Geliştirme Aşamasında Uyarısı */}
        <div className="p-4 bg-yellow-900/20 text-yellow-300 border-b border-yellow-800 flex items-center">
            <FiCode className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium">
                Bu sayfa **geliştirme aşamasındadır**. 
            </p>
        </div>

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
                  E-posta adresinizin profilinizde herkese açık görünmesini sağlar.
                </p>
              </div>
            </div>
            <label htmlFor="showEmailToggle" className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                id="showEmailToggle"
                className="sr-only peer"
                checked={showEmail}
                onChange={() => setShowEmail(!showEmail)}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
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
                  Telefon numaranızın profilinizde herkese açık görünmesini sağlar.
                </p>
              </div>
            </div>
            <label htmlFor="showPhoneToggle" className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                id="showPhoneToggle"
                className="sr-only peer"
                checked={showPhone}
                onChange={() => setShowPhone(!showPhone)}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Bilgi Kutusu (İsteğe bağlı) */}
          <div className="flex items-start p-4 bg-blue-900/20 rounded-lg border border-blue-900 text-blue-300 shadow-sm">
            <FiAlertCircle className="h-5 w-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white text-base">Gizlilik Notu</h3>
              <p className="text-sm">
                Bu ayarlar sadece profil sayfanızdaki görünürlüğü etkiler. Verileriniz sistemimizde güvende tutulmaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
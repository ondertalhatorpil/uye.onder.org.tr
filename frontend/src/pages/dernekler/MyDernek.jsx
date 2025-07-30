import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dernekService, UPLOADS_BASE_URL } from '../../services';
import { 
  FiEdit3, FiSave, FiX, FiCamera, FiUpload,
  FiUser, FiPhone, FiMail, FiCalendar, 
  FiMapPin, FiUsers, FiHome, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import LocationPickerModal from './components/DernekProfile/LocationPickerModal'; // Make sure this modal also supports dark theme

const MyDernek = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [dernek, setDernek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    dernek_adi: '',
    dernek_baskani: '',
    dernek_telefon: '',
    dernek_email: '',
    dernek_kuruluş_tarihi: '',
    dernek_sosyal_medya_hesaplari: {
      website: '',
      instagram: '',
      twitter: '',
      facebook: ''
    }
  });

  useEffect(() => {
    const loadMyDernek = async () => {
      try {
        setLoading(true);
        const response = await dernekService.getMyDernek();
        
        if (response.success) {
          const dernekData = response.data;
          setDernek(dernekData);
          
          // Form data'yı doldur
          setFormData({
            dernek_adi: dernekData.dernek_adi || '',
            dernek_baskani: dernekData.dernek_baskani || '',
            dernek_telefon: dernekData.dernek_telefon || '',
            dernek_email: dernekData.dernek_email || '',
            dernek_kuruluş_tarihi: dernekData.dernek_kuruluş_tarihi || '',
            dernek_sosyal_medya_hesaplari: {
              website: dernekData.dernek_sosyal_medya_hesaplari?.website || '',
              instagram: dernekData.dernek_sosyal_medya_hesaplari?.instagram || '',
              twitter: dernekData.dernek_sosyal_medya_hesaplari?.twitter || '',
              facebook: dernekData.dernek_sosyal_medya_hesaplari?.facebook || ''
            }
          });
        } else {
          toast.error('Size atanmış bir dernek bulunamadı');
        }
      } catch (error) {
        console.error('My dernek loading error:', error);
        toast.error('Dernek bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadMyDernek();
  }, []);

  // YENİ: Konum kaydetme fonksiyonu
  const handleSaveLocation = async (locationData) => {
    try {
      setSavingLocation(true);
      
      const response = await dernekService.updateDernekLocation(locationData);
      
      if (response.success) {
        // Dernek bilgilerini yenile
        const updatedResponse = await dernekService.getMyDernek();
        if (updatedResponse.success) {
          setDernek(updatedResponse.data);
        }
        
        setIsLocationModalOpen(false);
        toast.success('Dernek konumu başarıyla güncellendi');
      } else {
        toast.error(response.error || 'Konum güncellenemedi');
      }
    } catch (error) {
      console.error('Location save error:', error);
      toast.error('Konum kaydedilirken hata oluştu');
    } finally {
      setSavingLocation(false);
    }
  };


  // Form değişikliği
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name.startsWith('social_')) {
    const socialField = name.replace('social_', '');
    setFormData(prev => ({
      ...prev,
      dernek_sosyal_medya_hesaplari: {
        ...prev.dernek_sosyal_medya_hesaplari,
        [socialField]: value
      }
    }));
  } else {
    // Tarih alanı için özel işlem
    let processedValue = value;
    if (name === 'dernek_kuruluş_tarihi' && value) {
      // YYYY-MM-DD formatında olduğundan emin ol
      processedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  }
};

  // Logo seçimi
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo boyutu en fazla 2MB olabilir');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    uploadLogo(file);
  };

  // Logo yükleme
  const uploadLogo = async (file) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('logo', file);

      const response = await dernekService.uploadLogo(formData);
      
      if (response.success) {
        // Dernek bilgilerini yenile
        const updatedResponse = await dernekService.getMyDernek();
        if (updatedResponse.success) {
          setDernek(updatedResponse.data);
        }
        
        toast.success('Logo başarıyla güncellendi');
      } else {
        toast.error(response.error || 'Logo yüklenemedi');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Logo yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Dernek bilgilerini kaydet
  const handleSave = async () => {
  try {
    setSaving(true);
    
    // Tarih formatını kontrol et ve düzelt
    const dataToSend = { ...formData };
    if (dataToSend.dernek_kuruluş_tarihi) {
      // Date input'undan gelen değer zaten YYYY-MM-DD formatında olmalı
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataToSend.dernek_kuruluş_tarihi)) {
        // Eğer farklı formattaysa dönüştür
        const date = new Date(dataToSend.dernek_kuruluş_tarihi);
        if (!isNaN(date.getTime())) {
          dataToSend.dernek_kuruluş_tarihi = date.toISOString().split('T')[0];
        } else {
          toast.error('Geçerli bir tarih giriniz');
          return;
        }
      }
    }
    
    console.log('Gönderilecek tarih:', dataToSend.dernek_kuruluş_tarihi);
    
    const response = await dernekService.updateMyDernek(dataToSend);
    
    if (response.success) {
      setDernek(response.data);
      setIsEditing(false);
      toast.success('Dernek bilgileri güncellendi');
    } else {
      toast.error(response.error || 'Güncelleme başarısız');
    }
  } catch (error) {
    console.error('Update dernek error:', error);
    toast.error('Güncelleme sırasında hata oluştu');
  } finally {
    setSaving(false);
  }
};

  // Düzenlemeyi iptal et
  const handleCancel = () => {
    if (dernek) {
      setFormData({
        dernek_adi: dernek.dernek_adi || '',
        dernek_baskani: dernek.dernek_baskani || '',
        dernek_telefon: dernek.dernek_telefon || '',
        dernek_email: dernek.dernek_email || '',
        dernek_kuruluş_tarihi: dernek.dernek_kuruluş_tarihi || '',
        dernek_sosyal_medya_hesaplari: {
          website: dernek.dernek_sosyal_medya_hesaplari?.website || '',
          instagram: dernek.dernek_sosyal_medya_hesaplari?.instagram || '',
          twitter: dernek.dernek_sosyal_medya_hesaplari?.twitter || '',
          facebook: dernek.dernek_sosyal_medya_hesaplari?.facebook || ''
        }
      });
    }
    setIsEditing(false);
  };

  // Logo URL'i
  const getLogoUrl = () => {
    if (!dernek?.dernek_logosu) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-logos/${dernek.dernek_logosu}`;
  };

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Eğer zaten YYYY-MM-DD formatındaysa direkt döndür
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // ISO string'i YYYY-MM-DD'ye çevir
  return dateString.split('T')[0];
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center"> {/* Daha koyu arka plan */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-red-700 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-400 font-medium tracking-wide">Dernek bilgileri yükleniyor...</p> {/* Biraz tracking eklendi */}
        </div>
      </div>
    );
  }

  if (!dernek) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12">
        <div className="text-center">
          <FiHome className="mx-auto h-16 w-16 text-gray-600 mb-6" /> {/* İkon büyütüldü ve koyulaştırıldı */}
          <h2 className="text-3xl font-extrabold text-white mb-3">Dernek Bulunamadı</h2> {/* Font büyütüldü */}
          <p className="text-lg text-gray-400 max-w-sm mx-auto">Size atanmış bir dernek bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçin.</p> {/* Metin büyütüldü, açıklama eklendi */}
        </div>
      </div>
    );
  }


return (
  // Ana kapsayıcıya daha koyu arka plan verildi
  <div className="min-h-screen text-white py-12"> {/* Genel metin rengi beyaz, padding artırıldı */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"> {/* padding ve boşluk artırıldı */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"> {/* Responsive düzenleme */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Derneğim</h1> {/* Font büyütüldü */}
          <p className="text-gray-400 text-lg mt-1">Dernek bilgilerinizi görüntüleyin ve güncelleyin</p> {/* Metin büyütüldü */}
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-5 py-2.5 border border-gray-600 rounded-xl text-base font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md" // Boyutlar ve efektler değişti
              >
                <FiX className="mr-2 h-5 w-5" /> {/* İkon boyutu */}
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-xl text-base font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:scale-100" // Boyutlar ve efektler değişti
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> {/* Boyut */}
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-5 w-5" /> {/* Boyut */}
                    Kaydet
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-xl text-base font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md" // Boyutlar ve efektler değişti
            >
              <FiEdit3 className="mr-2 h-5 w-5" /> {/* Boyut */}
              Düzenle
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* Boşluk artırıldı */}
        {/* Ana Bilgiler */}
        <div className="lg:col-span-2">
          {/* Card arka planı, kenarlık ve daha belirgin shadow */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
            {/* Dekoratif gradyan */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 to-red-600"></div>

            {/* Dernek Header */}
            <div className="p-8 border-b border-gray-700"> {/* Padding artırıldı */}
              <div className="flex items-center">
                {/* Logo */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-700 flex items-center justify-center shadow-lg"> {/* Logo çerçevesi, border ve shadow */}
                    {getLogoUrl() ? (
                      <img
                        src={getLogoUrl()}
                        alt={dernek.dernek_adi}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${getLogoUrl() ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      <FiHome className="h-10 w-10 text-gray-500" /> {/* İkon boyutu */}
                    </div>
                  </div>
                  
                  {/* Logo Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:scale-100 shadow-md" // Boyut ve efektler
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <FiCamera className="h-5 w-5" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>

                <div className="ml-6"> {/* Boşluk artırıldı */}
                  <h2 className="text-2xl font-bold text-white mb-1"> {/* Başlık font boyutu */}
                    {dernek.dernek_adi}
                  </h2>
                  <p className="text-gray-400 text-lg">{dernek.dernek_baskani}</p> {/* Metin boyutu */}
                  <div className="flex items-center text-base text-gray-500 mt-2"> {/* Metin boyutu */}
                    <FiUsers className="mr-2 h-5 w-5" /> {/* İkon boyutu */}
                    <span className="font-semibold text-white">{dernek.uye_sayisi || 0}</span> üye
                  </div>
                </div>
              </div>
            </div>

            {/* Dernek Bilgileri */}
            <div className="p-8"> {/* Padding artırıldı */}
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Dernek Bilgileri</h3> {/* Başlık stili, alt çizgi */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Boşluklar artırıldı */}
                {/* Her bir form alanı için dark theme stilleri */}
                {/* Dernek Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dernek Adı</label> {/* Label boşluğu */}
                  {isEditing ? (
                    <input
                      type="text"
                      name="dernek_adi"
                      value={formData.dernek_adi}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm" // Boyutlar ve shadow
                    />
                  ) : (
                    <div className="flex items-center text-lg text-gray-200"> {/* Metin boyutu */}
                      <FiHome className="mr-3 h-5 w-5 text-gray-500" /> {/* İkon boyutu ve boşluk */}
                      {dernek.dernek_adi}
                    </div>
                  )}
                </div>

                {/* Başkan */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Başkan</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="dernek_baskani"
                      value={formData.dernek_baskani}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center text-lg text-gray-200">
                      <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                      {dernek.dernek_baskani || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="dernek_telefon"
                      value={formData.dernek_telefon}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm"
                      placeholder="05xxxxxxxxx"
                    />
                  ) : (
                    <div className="flex items-center text-lg text-gray-200">
                      <FiPhone className="mr-3 h-5 w-5 text-gray-500" />
                      {dernek.dernek_telefon || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="dernek_email"
                      value={formData.dernek_email}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm"
                      placeholder="dernek@email.com"
                    />
                  ) : (
                    <div className="flex items-center text-lg text-gray-200">
                      <FiMail className="mr-3 h-5 w-5 text-gray-500" />
                      {dernek.dernek_email || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Kuruluş Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kuruluş Tarihi</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dernek_kuruluş_tarihi"
                      value={formatDate(formData.dernek_kuruluş_tarihi)}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center text-lg text-gray-200">
                      <FiCalendar className="mr-3 h-5 w-5 text-gray-500" />
                      {dernek.dernek_kuruluş_tarihi ? 
                        new Date(dernek.dernek_kuruluş_tarihi).toLocaleDateString('tr-TR') : 
                        'Belirtilmemiş'
                      }
                    </div>
                  )}
                </div>

                {/* Lokasyon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lokasyon</label>
                  <div className="flex items-center text-lg text-gray-200">
                    <FiMapPin className="mr-3 h-5 w-5 text-gray-500" />
                    {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                    <span className="ml-3 text-xs bg-gray-700 text-gray-400 px-2.5 py-1 rounded-full font-medium tracking-wide"> {/* Etiket stili */}
                      Değiştirilemez
                    </span>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <h3 className="text-xl font-semibold text-white mt-10 mb-6 border-b border-gray-700 pb-3">Sosyal Medya</h3> {/* Başlık stili */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Boşluklar artırıldı */}
                {['website', 'instagram', 'twitter', 'facebook'].map(platform => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {platform}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name={`social_${platform}`}
                        value={formData.dernek_sosyal_medya_hesaplari[platform]}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400 text-base shadow-sm"
                        placeholder={`https://${platform}.com/...`}
                      />
                    ) : (
                      <div className="flex items-center text-lg text-gray-200">
                        <FiExternalLink className="mr-3 h-5 w-5 text-gray-500" />
                        {formData.dernek_sosyal_medya_hesaplari[platform] ? (
                          <a 
                            href={formData.dernek_sosyal_medya_hesaplari[platform]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 truncate" // Alt çizgi eklendi
                          >
                            {formData.dernek_sosyal_medya_hesaplari[platform]}
                          </a>
                        ) : (
                          'Belirtilmemiş'
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Konum Bölümü */}
            <div className="p-8 border-t border-gray-700"> {/* Padding ve border */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"> {/* Responsive düzenleme */}
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FiMapPin className="mr-3 h-6 w-6 text-red-500" /> {/* İkon boyutu ve boşluk */}
                  Dernek Konumu
                </h3>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="inline-flex items-center px-4 py-2.5 text-base font-semibold text-red-400 bg-red-900/30 rounded-xl hover:bg-red-900/50 transition-all duration-300 transform hover:scale-105 shadow-md" // Boyutlar ve efektler
                >
                  <FiMapPin className="mr-2 h-5 w-5" />
                  {dernek.dernek_latitude ? 'Konumu Değiştir' : 'Konum Belirle'}
                </button>
              </div>

              {dernek.dernek_latitude && dernek.dernek_longitude ? (
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600 shadow-inner"> {/* Konum bilgisi kutusu stili */}
                  <div className="grid grid-cols-2 gap-6 text-base"> {/* Metin boyutu */}
                    <div>
                      <span className="font-medium text-gray-300">Enlem:</span>
                      <p className="text-gray-100 font-mono">{parseFloat(dernek.dernek_latitude).toFixed(6)}</p> {/* Font mono */}
                    </div>
                    <div>
                      <span className="font-medium text-gray-300">Boylam:</span>
                      <p className="text-gray-100 font-mono">{parseFloat(dernek.dernek_longitude).toFixed(6)}</p>
                    </div>
                  </div>
                  {dernek.dernek_adres && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-300">Adres:</span>
                      <p className="text-gray-100 text-sm mt-1">{dernek.dernek_adres}</p>
                    </div>
                  )}
                  
                  {/* Haritayı göster butonu */}
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <a
                      href={`http://maps.google.com/?q=${dernek.dernek_latitude},${dernek.dernek_longitude}`} // Corrected Google Maps URL
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2.5 text-base font-semibold text-blue-400 bg-blue-900/30 rounded-xl hover:bg-blue-900/50 transition-all duration-300 transform hover:scale-105 shadow-md" // Buton stili
                    >
                      <FiExternalLink className="mr-2 h-5 w-5" />
                      Haritada Göster
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-xl p-6 shadow-inner"> {/* Uyarı kutusu stili */}
                  <div className="flex items-start">
                    <FiMapPin className="h-6 w-6 text-yellow-400 mr-4 mt-1" /> {/* İkon boyutu ve boşluk */}
                    <div>
                      <p className="text-lg font-semibold text-yellow-200 mb-1">Konum Belirtilmemiş</p> {/* Metin boyutu */}
                      <p className="text-sm text-yellow-300">Derneğinizin harita üzerinde görünmesi için konum bilgisini belirlemeniz gerekmektedir. Lütfen "Konum Belirle" butonuna tıklayın.</p> {/* Metin boyutu, açıklama */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8"> {/* Boşluk artırıldı */}
          {/* Logo Yükleme Talimatları */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
            {/* Dekoratif gradyan */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 to-red-600"></div>

            <div className="p-8"> {/* Padding artırıldı */}
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Logo Yükleme</h3> {/* Başlık stili */}
              
              <div className="space-y-4 text-base text-gray-400"> {/* Metin boyutu, boşluk */}
                <div className="flex items-start">
                  <FiUpload className="mt-0.5 mr-3 h-5 w-5 text-red-500" /> {/* İkon boyutu */}
                  <div>
                    <p className="font-medium text-gray-200">Dosya Formatı</p>
                    <p>JPG, PNG, GIF desteklenir</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiCamera className="mt-0.5 mr-3 h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-200">Boyut Limiti</p>
                    <p>Maksimum 2MB</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 h-5 w-5 bg-red-600 rounded-md flex-shrink-0"></div> {/* Boyut, flex-shrink */}
                  <div>
                    <p className="font-medium text-gray-200">Önerilen Boyut</p>
                    <p>400x400 piksel kare format</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full mt-8 inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-md text-base font-semibold" // Buton stili
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <FiCamera className="mr-2 h-5 w-5" />
                    Logo Değiştir
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 to-red-600"></div>

          
          </div>
        </div>
      </div>
    </div>

    <LocationPickerModal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
      onSave={handleSaveLocation}
      dernek={dernek}
      saving={savingLocation}
    />
  </div>
);
};

export default MyDernek;
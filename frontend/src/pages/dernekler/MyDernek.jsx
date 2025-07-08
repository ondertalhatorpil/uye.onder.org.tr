import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dernekService } from '../../services/api';
import { 
  FiEdit3, FiSave, FiX, FiCamera, FiUpload,
  FiUser, FiPhone, FiMail, FiCalendar, 
  FiMapPin, FiUsers, FiHome, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MyDernek = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [dernek, setDernek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Dernek bilgilerini getir
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
      setFormData(prev => ({
        ...prev,
        [name]: value
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
      
      const response = await dernekService.updateMyDernek(formData);
      
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
    return `http://localhost:3001/uploads/dernek-logos/${dernek.dernek_logosu}`;
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // YYYY-MM-DD formatına çevir
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dernek bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!dernek) {
    return (
      <div className="text-center py-12">
        <FiHome className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dernek Bulunamadı</h2>
        <p className="text-gray-600">Size atanmış bir dernek bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Derneğim</h1>
          <p className="text-gray-600">Dernek bilgilerinizi görüntüleyin ve düzenleyin</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FiX className="mr-2 h-4 w-4" />
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <FiEdit3 className="mr-2 h-4 w-4" />
              Düzenle
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana Bilgiler */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Dernek Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                {/* Logo */}
                <div className="relative">
                  <div className="h-20 w-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
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
                      <FiHome className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Logo Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 p-2 bg-red-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FiCamera className="h-4 w-4" />
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

                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {dernek.dernek_adi}
                  </h2>
                  <p className="text-gray-600">{dernek.dernek_baskani}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiUsers className="mr-1 h-4 w-4" />
                    {dernek.uye_sayisi || 0} üye
                  </div>
                </div>
              </div>
            </div>

            {/* Dernek Bilgileri */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernek Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dernek Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dernek Adı</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="dernek_adi"
                      value={formData.dernek_adi}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiHome className="mr-2 h-4 w-4 text-gray-400" />
                      {dernek.dernek_adi}
                    </div>
                  )}
                </div>

                {/* Başkan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başkan</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="dernek_baskani"
                      value={formData.dernek_baskani}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                      {dernek.dernek_baskani || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="dernek_telefon"
                      value={formData.dernek_telefon}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="05xxxxxxxxx"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                      {dernek.dernek_telefon || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="dernek_email"
                      value={formData.dernek_email}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="dernek@email.com"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                      {dernek.dernek_email || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Kuruluş Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuruluş Tarihi</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dernek_kuruluş_tarihi"
                      value={formatDate(formData.dernek_kuruluş_tarihi)}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                      {dernek.dernek_kuruluş_tarihi ? 
                        new Date(dernek.dernek_kuruluş_tarihi).toLocaleDateString('tr-TR') : 
                        'Belirtilmemiş'
                      }
                    </div>
                  )}
                </div>

                {/* Lokasyon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
                  <div className="flex items-center text-gray-900">
                    <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Değiştirilemez
                    </span>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Sosyal Medya</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['website', 'instagram', 'twitter', 'facebook'].map(platform => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {platform}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name={`social_${platform}`}
                        value={formData.dernek_sosyal_medya_hesaplari[platform]}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`https://${platform}.com/...`}
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <FiExternalLink className="mr-2 h-4 w-4 text-gray-400" />
                        {formData.dernek_sosyal_medya_hesaplari[platform] ? (
                          <a 
                            href={formData.dernek_sosyal_medya_hesaplari[platform]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 truncate"
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo Yükleme Talimatları */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Yükleme</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <FiUpload className="mt-0.5 mr-2 h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Dosya Formatı</p>
                  <p>JPG, PNG, GIF desteklenir</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiCamera className="mt-0.5 mr-2 h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Boyut Limiti</p>
                  <p>Maksimum 2MB</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 h-4 w-4 bg-red-600 rounded-sm"></div>
                <div>
                  <p className="font-medium text-gray-900">Önerilen Boyut</p>
                  <p>400x400 piksel kare format</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <FiCamera className="mr-2 h-4 w-4" />
                  Logo Değiştir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDernek;
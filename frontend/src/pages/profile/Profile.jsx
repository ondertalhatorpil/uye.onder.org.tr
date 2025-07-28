import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import faaliyetService from '../../services/faaliyetService';
import constantsService from '../../services/constantsService';
import { authService } from '../../services';
import { toast } from 'react-hot-toast';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ProfileSidebar from './components/ProfileSidebar';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myFaaliyetler, setMyFaaliyetler] = useState([]);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(true);
  
  // Profil fotoğrafı için yeni state'ler
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    isim: '',
    soyisim: '',
    dogum_tarihi: '',
    sektor: '',
    meslek: '',
    telefon: '',
    il: '',
    ilce: '',
    gonullu_dernek: '',
    calisma_komisyon: '',
    mezun_okul: ''
  });

  // Options for dropdowns
  const [options, setOptions] = useState({
    sektorler: [],
    komisyonlar: [],
    iller: [],
    ilceler: []
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      const formattedDogumTarihi = user.dogum_tarihi ? new Date(user.dogum_tarihi).toISOString().split('T')[0] : '';
      setFormData({
        isim: user.isim || '',
        soyisim: user.soyisim || '',
        dogum_tarihi: formattedDogumTarihi,
        sektor: user.sektor || '',
        meslek: user.meslek || '',
        telefon: user.telefon || '',
        il: user.il || '',
        ilce: user.ilce || '',
        gonullu_dernek: user.gonullu_dernek || '',
        calisma_komisyon: user.calisma_komisyon || '',
        mezun_okul: user.mezun_okul || ''
      });
    }
  }, [user]);

  // Load options
  useEffect(() => {
    const loadAllOptions = async () => {
      try {
        const [sektorResponse, komisyonResponse, illerResponse] = await Promise.all([
          constantsService.getSektorler(),
          constantsService.getKomisyonlar(),
          constantsService.getIller()
        ]);

        setOptions(prev => ({
          ...prev,
          sektorler: sektorResponse.data || [],
          komisyonlar: komisyonResponse.data || [],
          iller: illerResponse.data || []
        }));
      } catch (error) {
        console.error('Options loading error:', error);
        toast.error('Seçenekler yüklenirken hata oluştu.');
      }
    };

    loadAllOptions();
  }, []);

  // Load ilçeler when 'il' changes
  useEffect(() => {
    const loadIlceler = async () => {
      if (formData.il) {
        try {
          const response = await constantsService.getIlceler(formData.il);
          setOptions(prev => ({
            ...prev,
            ilceler: response.data || []
          }));
        } catch (error) {
          console.error('İlçeler loading error:', error);
          toast.error('İlçeler yüklenirken hata oluştu.');
        }
      } else {
        setOptions(prev => ({ ...prev, ilceler: [] }));
      }
    };

    loadIlceler();
  }, [formData.il]);

  // Load user's activities
  useEffect(() => {
    const loadMyFaaliyetler = async () => {
      try {
        setLoadingFaaliyetler(true);
        const response = await faaliyetService.getMyFaaliyetler();
        
        if (response.success) {
          setMyFaaliyetler(response.data || []);
        } else {
          toast.error(response.message || 'Faaliyetler yüklenirken bir sorun oluştu.');
        }
      } catch (error) {
        console.error('My faaliyetler loading error:', error);
        toast.error('Faaliyetler yüklenirken hata oluştu.');
      } finally {
        setLoadingFaaliyetler(false);
      }
    };

    loadMyFaaliyetler();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'il' && prev.ilce) {
      setFormData(prev => ({
        ...prev,
        ilce: ''
      }));
    }
  };

  // Profil fotoğrafı seçme
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // Fotoğraf validasyonu (yerel fonksiyon)
  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      return { valid: false, error: 'Dosya seçilmedi' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Sadece resim dosyaları (JPG, PNG, GIF, WebP) yüklenebilir' };
    }
    
    return { valid: true };
  };

  // Fotoğraf değişimi
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    console.log('File selected:', file);
    
    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }
    
    // Dosya validasyonu
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      fileInputRef.current.value = '';
      return;
    }
    
    setSelectedImage(file);
    console.log('Selected image set:', file.name);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      console.log('Image preview created');
    };
    reader.readAsDataURL(file);
  };

  // Profil fotoğrafını sil
  const handleDeleteProfileImage = async () => {
    if (!window.confirm('Profil fotoğrafını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await authService.deleteProfileImage();
      
      if (response.success) {
        toast.success('Profil fotoğrafı silindi');
        // Auth context'i güncelle
        const updatedProfile = await authService.getProfile();
        if (updatedProfile.success) {
          updateProfile(updatedProfile.user);
        }
      } else {
        toast.error(response.error || 'Fotoğraf silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Fotoğraf silme hatası:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Tarih formatını düzelt
      const profileData = { ...formData };
      if (profileData.dogum_tarihi) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(profileData.dogum_tarihi)) {
          const date = new Date(profileData.dogum_tarihi);
          profileData.dogum_tarihi = date.toISOString().split('T')[0];
        }
      } else {
        profileData.dogum_tarihi = null;
      }
      
      // Profil fotoğrafı ile birlikte güncelle
      const result = await authService.updateProfile(profileData, selectedImage);
      
      if (result.success) {
        toast.success('Profil başarıyla güncellendi');
        setIsEditing(false);
        
        // Form'u temizle
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Auth context'i güncelle
        updateProfile(result.user);
        
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (user) {
      const formattedDogumTarihi = user.dogum_tarihi ? new Date(user.dogum_tarihi).toISOString().split('T')[0] : '';
      setFormData({
        isim: user.isim || '',
        soyisim: user.soyisim || '',
        dogum_tarihi: formattedDogumTarihi,
        sektor: user.sektor || '',
        meslek: user.meslek || '',
        telefon: user.telefon || '',
        il: user.il || '',
        ilce: user.ilce || '',
        gonullu_dernek: user.gonullu_dernek || '',
        calisma_komisyon: user.calisma_komisyon || '',
        mezun_okul: user.mezun_okul || ''
      });
    }
    
    // Fotoğraf seçimini temizle
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-400 font-medium">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          isEditing={isEditing}
          loading={loading}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onImageSelect={handleImageSelect}
          onDeleteImage={handleDeleteProfileImage}
          imagePreview={imagePreview}
          selectedImage={selectedImage}
        />

        {/* Main Content */}
        <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-2/3">
            <ProfileInfo 
              user={user}
              formData={formData}
              isEditing={isEditing}
              options={options}
              onChange={handleChange}
            />
          </div>

          <div className="lg:w-1/3">
            <ProfileSidebar 
              user={user}
              myFaaliyetler={myFaaliyetler}
              loadingFaaliyetler={loadingFaaliyetler}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
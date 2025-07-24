import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, constantsService } from '../../services';
import { toast } from 'react-hot-toast';
import ProfileHeader from './components/ProfileHeader'; // Yolu güncelledim
import ProfileInfo from './components/ProfileInfo';     // Yolu güncelledim
import ProfileSidebar from './components/ProfileSidebar'; // Yolu güncelledim

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myFaaliyetler, setMyFaaliyetler] = useState([]);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(true);

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
    iller: [], // İller ve ilçeler için de seçenekleri ekleyelim
    ilceler: []
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      // Doğum tarihini YYYY-MM-DD formatına dönüştürerek input'ta düzgün görünmesini sağla
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

  // Load options (sektorler, komisyonlar, iller)
  useEffect(() => {
    const loadAllOptions = async () => {
      try {
        const [sektorResponse, komisyonResponse, illerResponse] = await Promise.all([
          constantsService.getSektorler(),
          constantsService.getKomisyonlar(),
          constantsService.getIller() // İlleri de yükle
        ]);

        setOptions(prev => ({
          ...prev, // Mevcut ilceler boş kalabilir
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
  }, [formData.il]); // formData.il değiştiğinde ilçeleri yükle


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
    // Eğer il değişiyorsa, ilçe seçimini sıfırla
    if (name === 'il' && prev.ilce) {
        setFormData(prev => ({
            ...prev,
            ilce: ''
        }));
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Tarih formatını düzelt (ISO formatından YYYY-MM-DD'ye)
      const profileData = { ...formData };
      if (profileData.dogum_tarihi) {
        // Eğer tarih zaten YYYY-MM-DD ise tekrar dönüştürme
        if (!/^\d{4}-\d{2}-\d{2}$/.test(profileData.dogum_tarihi)) {
            const date = new Date(profileData.dogum_tarihi);
            profileData.dogum_tarihi = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
        }
      } else {
        profileData.dogum_tarihi = null; // Boşsa null gönder
      }
      
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profil başarıyla güncellendi');
        setIsEditing(false);
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
    // Reset form data to current user data
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
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-300"> {/* Koyu tema arka planı */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div> {/* Renkler güncellendi */}
          <p className="mt-4 text-gray-400 font-medium">Profil yükleniyor...</p> {/* Metin rengi güncellendi */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white"> {/* Genel arka plan ve metin rengi */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10"> {/* Responsive padding */}
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          isEditing={isEditing}
          loading={loading}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Main Content */}
        <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col lg:flex-row gap-6 lg:gap-8"> {/* Responsive boşluk ve düzen */}
          {/* Profile Information (Sol taraf - geniş ekranlarda) */}
          <div className="lg:w-2/3">
            <ProfileInfo 
              user={user}
              formData={formData}
              isEditing={isEditing}
              options={options}
              onChange={handleChange}
            />
          </div>

          {/* Statistics and Activities (Sağ taraf - geniş ekranlarda) */}
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
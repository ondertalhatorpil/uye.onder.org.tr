import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, constantsService } from '../../services';
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
    komisyonlar: []
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        isim: user.isim || '',
        soyisim: user.soyisim || '',
        dogum_tarihi: user.dogum_tarihi || '',
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
    const loadOptions = async () => {
      try {
        const [sektorResponse, komisyonResponse] = await Promise.all([
          constantsService.getSektorler(),
          constantsService.getKomisyonlar()
        ]);

        setOptions({
          sektorler: sektorResponse.data || [],
          komisyonlar: komisyonResponse.data || []
        });
      } catch (error) {
        console.error('Options loading error:', error);
      }
    };

    loadOptions();
  }, []);

  // Load user's activities
  useEffect(() => {
    const loadMyFaaliyetler = async () => {
      try {
        setLoadingFaaliyetler(true);
        const response = await faaliyetService.getMyFaaliyetler();
        
        if (response.success) {
          setMyFaaliyetler(response.data || []);
        }
      } catch (error) {
        console.error('My faaliyetler loading error:', error);
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
  };

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Tarih formatını düzelt (ISO formatından YYYY-MM-DD'ye)
      const profileData = { ...formData };
      if (profileData.dogum_tarihi) {
        const date = new Date(profileData.dogum_tarihi);
        profileData.dogum_tarihi = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
      }
      
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profil başarıyla güncellendi');
        setIsEditing(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        isim: user.isim || '',
        soyisim: user.soyisim || '',
        dogum_tarihi: user.dogum_tarihi || '',
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="mt-8 space-y-8">
          {/* Profile Information */}
          <ProfileInfo 
            user={user}
            formData={formData}
            isEditing={isEditing}
            options={options}
            onChange={handleChange}
          />

          {/* Statistics and Activities */}
          <ProfileSidebar 
            user={user}
            myFaaliyetler={myFaaliyetler}
            loadingFaaliyetler={loadingFaaliyetler}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
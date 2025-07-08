import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService, constantsService } from '../../services/api';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiEdit3, FiSave, FiX, FiActivity,
  FiUsers, FiGrid, FiHome, FiBook
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profilim</h1>
          <p className="text-gray-600">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
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
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
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
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">
                    {user.isim?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.isim} {user.soyisim}
                  </h2>
                  <p className="text-gray-600">{user.meslek || 'Meslek belirtilmemiş'}</p>
                  <p className="text-sm text-red-600">{user.gonullu_dernek || 'Dernek belirtilmemiş'}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İsim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="isim"
                      value={formData.isim}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                      {user.isim || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Soyisim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyisim</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="soyisim"
                      value={formData.soyisim}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                      {user.soyisim || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-gray-900">
                    <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                    {user.email}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Değiştirilemez
                    </span>
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="05xxxxxxxxx"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                      {user.telefon || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dogum_tarihi"
                      value={formatDateForInput(formData.dogum_tarihi)}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                      {formatDateForDisplay(user.dogum_tarihi)}
                    </div>
                  )}
                </div>

                {/* Lokasyon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
                  <div className="flex items-center text-gray-900">
                    <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {user.il}{user.ilce && `, ${user.ilce}`} || 'Belirtilmemiş'
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Mesleki Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sektör */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                  {isEditing ? (
                    <select
                      name="sektor"
                      value={formData.sektor}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sektör seçiniz</option>
                      {options.sektorler.map(sektor => (
                        <option key={sektor} value={sektor}>{sektor}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiBriefcase className="mr-2 h-4 w-4 text-gray-400" />
                      {user.sektor || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Meslek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meslek</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="meslek"
                      value={formData.meslek}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mesleğiniz"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiBriefcase className="mr-2 h-4 w-4 text-gray-400" />
                      {user.meslek || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Mezun Okul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mezun Olunan Okul</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mezun_okul"
                      value={formData.mezun_okul}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mezun olduğunuz okul"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiBook className="mr-2 h-4 w-4 text-gray-400" />
                      {user.mezun_okul || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                {/* Çalışma Komisyonu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Komisyonu</label>
                  {isEditing ? (
                    <select
                      name="calisma_komisyon"
                      value={formData.calisma_komisyon}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Komisyon seçiniz</option>
                      {options.komisyonlar.map(komisyon => (
                        <option key={komisyon} value={komisyon}>{komisyon}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                      {user.calisma_komisyon || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Dernek Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gönüllü Olunan Dernek</label>
                <div className="flex items-center text-gray-900">
                  <FiHome className="mr-2 h-4 w-4 text-gray-400" />
                  {user.gonullu_dernek || 'Belirtilmemiş'}
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Değiştirilemez
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Stats */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiActivity className="mr-3 h-5 w-5 text-red-600" />
                  <span className="text-gray-900">Faaliyetlerim</span>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  {myFaaliyetler.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCalendar className="mr-3 h-5 w-5 text-red-600" />
                  <span className="text-gray-900">Üyelik Süresi</span>
                </div>
                <span className="text-sm text-gray-600">
                  {user.created_at ? 
                    Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) + ' gün'
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Son Faaliyetlerim</h3>
              <Link
                to="/faaliyetler/my-posts"
                className="text-sm text-red-600 hover:text-red-500"
              >
                Tümü
              </Link>
            </div>
            
            {loadingFaaliyetler ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : myFaaliyetler.length > 0 ? (
              <div className="space-y-3">
                {myFaaliyetler.slice(0, 3).map(faaliyet => (
                  <div key={faaliyet.id} className="border-l-2 border-red-200 pl-3">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {faaliyet.baslik || 'Başlıksız Faaliyet'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Henüz faaliyet paylaşmadınız
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
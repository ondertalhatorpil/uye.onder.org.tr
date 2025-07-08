import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, faaliyetService, UPLOADS_BASE_URL } from '../../services/api';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
  FiCalendar, FiActivity, FiUsers, FiHome, FiBook,
  FiArrowLeft, FiMessageCircle, FiHeart, FiShare2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UyeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userFaaliyetler, setUserFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(true);

  // Kullanıcı bilgilerini getir
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        
        if (response.success) {
          // Backend'ten gelen format: data.user
          setUser(response.data.user);
          // Faaliyetler de backend'ten geliyor
          setUserFaaliyetler(response.data.faaliyetler || []);
          setLoadingFaaliyetler(false);
        } else {
          toast.error('Kullanıcı bulunamadı');
          navigate('/uyeler');
        }
      } catch (error) {
        console.error('User loading error:', error);
        toast.error('Kullanıcı bilgileri yüklenemedi');
        navigate('/uyeler');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id, navigate]);

  // Kullanıcının faaliyetlerini getir - Backend'ten geliyor, gerek yok
  /* useEffect(() => {
    const loadUserFaaliyetler = async () => {
      if (!user) return;
      
      try {
        setLoadingFaaliyetler(true);
        const response = await faaliyetService.getFaaliyetler({ user_id: user.id });
        
        if (response.success) {
          setUserFaaliyetler(response.data || []);
        }
      } catch (error) {
        console.error('User faaliyetler loading error:', error);
      } finally {
        setLoadingFaaliyetler(false);
      }
    };

    loadUserFaaliyetler();
  }, [user]); */

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

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return formatDateForDisplay(dateString);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Kullanıcı bulunamadı</h2>
        <p className="text-gray-600 mb-4">Aradığınız kullanıcı mevcut değil veya erişiminiz yok.</p>
        <button
          onClick={() => navigate('/uyeler')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Üye Aramaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {user.isim?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.isim} {user.soyisim}
                    </h1>
                    <p className="text-gray-600">{user.meslek || 'Meslek belirtilmemiş'}</p>
                    {user.gonullu_dernek && (
                      <p className="text-sm text-red-600">{user.gonullu_dernek}</p>
                    )}
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex items-center space-x-2">
                  {user.telefon && (
                    <a
                      href={`tel:${user.telefon}`}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiPhone className="mr-2 h-4 w-4" />
                      Ara
                    </a>
                  )}
                  <button className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <FiMessageCircle className="mr-2 h-4 w-4" />
                    Mesaj
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-gray-900">
                    <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                    {user.email}
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <div className="flex items-center text-gray-900">
                    <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                    {user.telefon || 'Belirtilmemiş'}
                  </div>
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                  <div className="flex items-center text-gray-900">
                    <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                    {formatDateForDisplay(user.dogum_tarihi)}
                  </div>
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
                  <div className="flex items-center text-gray-900">
                    <FiBriefcase className="mr-2 h-4 w-4 text-gray-400" />
                    {user.sektor || 'Belirtilmemiş'}
                  </div>
                </div>

                {/* Meslek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meslek</label>
                  <div className="flex items-center text-gray-900">
                    <FiBriefcase className="mr-2 h-4 w-4 text-gray-400" />
                    {user.meslek || 'Belirtilmemiş'}
                  </div>
                </div>

                {/* Mezun Okul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mezun Olunan Okul</label>
                  <div className="flex items-center text-gray-900">
                    <FiBook className="mr-2 h-4 w-4 text-gray-400" />
                    {user.mezun_okul || 'Belirtilmemiş'}
                  </div>
                </div>

                {/* Çalışma Komisyonu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Komisyonu</label>
                  <div className="flex items-center text-gray-900">
                    <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                    {user.calisma_komisyon || 'Belirtilmemiş'}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Dernek Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gönüllü Olunan Dernek</label>
                <div className="flex items-center text-gray-900">
                  <FiHome className="mr-2 h-4 w-4 text-gray-400" />
                  {user.gonullu_dernek || 'Belirtilmemiş'}
                </div>
              </div>
            </div>
          </div>

          {/* User Activities */}
          <div className="bg-white rounded-lg shadow border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.isim}'in Faaliyetleri ({userFaaliyetler.length})
              </h3>
            </div>

            <div className="p-6">
              {loadingFaaliyetler ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Faaliyetler yükleniyor...</p>
                </div>
              ) : userFaaliyetler.length > 0 ? (
                <div className="space-y-6">
                  {userFaaliyetler.map((faaliyet) => (
                    <div key={faaliyet.id} className="border border-gray-200 rounded-lg p-4">
                      {/* Faaliyet Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-500">
                          {formatTimeAgo(faaliyet.created_at)}
                        </div>
                      </div>

                      {/* Faaliyet Content */}
                      {faaliyet.baslik && (
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {faaliyet.baslik}
                        </h4>
                      )}
                      
                      {faaliyet.aciklama && (
                        <p className="text-gray-700 mb-4">
                          {faaliyet.aciklama}
                        </p>
                      )}

                      {/* Faaliyet Images */}
                      {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2 max-w-md">
                            {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`}
                                  alt={`Faaliyet ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
                                  }}
                                />
                                {index === 3 && faaliyet.gorseller.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      +{faaliyet.gorseller.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <button className="flex items-center hover:text-red-500 transition-colors">
                          <FiHeart className="mr-1 h-4 w-4" />
                          Beğen
                        </button>
                        <button className="flex items-center hover:text-blue-500 transition-colors">
                          <FiMessageCircle className="mr-1 h-4 w-4" />
                          Yorum
                        </button>
                        <button className="flex items-center hover:text-green-500 transition-colors">
                          <FiShare2 className="mr-1 h-4 w-4" />
                          Paylaş
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz faaliyet yok
                  </h4>
                  <p className="text-gray-500">
                    {user.isim} henüz herhangi bir faaliyet paylaşmamış.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiActivity className="mr-3 h-5 w-5 text-red-600" />
                  <span className="text-gray-900">Faaliyetler</span>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  {userFaaliyetler.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCalendar className="mr-3 h-5 w-5 text-red-600" />
                  <span className="text-gray-900">Üyelik</span>
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

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
            
            <div className="space-y-3">
              {user.telefon && (
                <a
                  href={`tel:${user.telefon}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiPhone className="mr-3 h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Telefon</p>
                    <p className="text-sm text-gray-600">{user.telefon}</p>
                  </div>
                </a>
              )}
              
              <a
                href={`mailto:${user.email}`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiMail className="mr-3 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UyeProfile;
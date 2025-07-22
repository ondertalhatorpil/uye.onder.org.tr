import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, faaliyetService, UPLOADS_BASE_URL } from '../../services';
import { FiUser, FiActivity, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import ProfileHeader from './components/UyeProfile/ProfileHeader';
import InfoSection from './components/UyeProfile/InfoSection';
import ActivityCard from './components/UyeProfile/ActivityCard';

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
          setUser(response.data.user);
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

  // Helper functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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

  const membershipDays = user?.created_at ? 
    Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0;

  // Event handlers
  const handleBack = () => navigate(-1);
  const handleContact = () => user.telefon && window.open(`tel:${user.telefon}`);
  const handleMessage = () => {
    toast.success('Mesaj özelliği yakında eklenecek!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <FiUser className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Kullanıcı bulunamadı</h2>
          <p className="text-gray-600 mb-8">Aradığınız kullanıcı mevcut değil veya erişiminiz yok.</p>
          <button
            onClick={() => navigate('/uyeler')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md font-medium"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" />
            Üye Aramaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Profile Header */}
      <ProfileHeader 
        user={user}
        onBack={handleBack}
        onContact={handleContact}
        onMessage={handleMessage}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <FiActivity className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{userFaaliyetler.length}</div>
              <div className="text-sm font-medium text-gray-600">Toplam Faaliyet</div>
              <div className="text-xs text-gray-400 mt-1">Paylaşılan faaliyetler</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <FiCalendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{membershipDays}</div>
              <div className="text-sm font-medium text-gray-600">Üyelik Süresi</div>
              <div className="text-xs text-gray-400 mt-1">{membershipDays > 0 ? "gün" : "Yeni üye"}</div>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <FiCalendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatDateForDisplay(user.created_at).split(' ')[2]}
              </div>
              <div className="text-sm font-medium text-gray-600">Katılım Yılı</div>
              <div className="text-xs text-gray-400 mt-1">Üyelik başlangıcı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Info Sections */}
        <InfoSection 
          user={user}
          formatDateForDisplay={formatDateForDisplay}
        />

        {/* User Activities */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <FiActivity className="h-4 w-4 text-red-600" />
              </div>
              {user.isim}'in Faaliyetleri ({userFaaliyetler.length})
            </h3>
          </div>
          
          <div className="p-6">
            {loadingFaaliyetler ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Faaliyetler yükleniyor...</p>
              </div>
            ) : userFaaliyetler.length > 0 ? (
              <div className="space-y-6">
                {userFaaliyetler.map((faaliyet) => (
                  <ActivityCard 
                    key={faaliyet.id} 
                    faaliyet={faaliyet}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <FiActivity className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
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
    </div>
  );
};

export default UyeProfile;
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center"> {/* Arka plan eklendi */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-400 border-t-red-600 mx-auto"></div> {/* Renkler güncellendi */}
          <p className="mt-6 text-lg text-gray-300 font-medium">Profil yükleniyor...</p> {/* Renk güncellendi */}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-16"> {/* Arka plan ve metin rengi */}
        <div className="max-w-xs sm:max-w-md mx-auto p-6 bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-700"> {/* Arka plan, padding, yuvarlatma, gölge, kenarlık */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6"> {/* Boyut, arka plan */}
            <FiUser className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" /> {/* İkon boyutu ve rengi */}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Kullanıcı bulunamadı</h2> {/* Font boyutu ve rengi */}
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">Aradığınız kullanıcı mevcut değil veya erişiminiz yok.</p> {/* Font boyutu ve rengi */}
          <button
            onClick={() => navigate('/uyeler')}
            className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base w-full justify-center" 
          >
            <FiArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {/* İkon boyutu */}
            Üye Aramaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white"> {/* Genel arka plan */}
      <div className="max-w-full sm:max-w-5xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8"> {/* Responsive padding ve boşluk */}
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          onBack={handleBack}
          onContact={handleContact}
          onMessage={handleMessage}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 group"> {/* Arka plan, yuvarlatma, padding, kenarlık, gölge */}
            <div className="flex items-start justify-between"> {/* items-start olarak değiştirildi */}
              <div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-red-800 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 text-white"> {/* Boyut, yuvarlatma, arka plan, ikon rengi */}
                  <FiActivity className="h-5 w-5 sm:h-6 sm:w-6" /> {/* İkon boyutu */}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{userFaaliyetler.length}</div> {/* Font boyutu ve rengi */}
                <div className="text-sm font-medium text-gray-300">Toplam Faaliyet</div> {/* Font boyutu ve rengi */}
                <div className="text-xs text-gray-400 mt-1">Paylaşılan faaliyetler</div> {/* Font boyutu ve rengi */}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 group"> {/* Arka plan, yuvarlatma, padding, kenarlık, gölge */}
            <div className="flex items-start justify-between">
              <div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-blue-800 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 text-white"> {/* Renkler ve boyut */}
                  <FiCalendar className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{membershipDays}</div>
                <div className="text-sm font-medium text-gray-300">Üyelik Süresi</div>
                <div className="text-xs text-gray-400 mt-1">{membershipDays > 0 ? "gün" : "Yeni üye"}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 group"> {/* Arka plan, yuvarlatma, padding, kenarlık, gölge */}
            <div className="flex items-start justify-between">
              <div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-purple-800 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 text-white"> {/* Renkler ve boyut */}
                  <FiCalendar className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                  {formatDateForDisplay(user.created_at).split(' ')[2]}
                </div>
                <div className="text-sm font-medium text-gray-300">Katılım Yılı</div>
                <div className="text-xs text-gray-400 mt-1">Üyelik başlangıcı</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8"> {/* Mobil boşluk */}
          {/* Info Sections */}
          <InfoSection 
            user={user}
            formatDateForDisplay={formatDateForDisplay}
          />

          {/* User Activities */}
          <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Arka plan, yuvarlatma, gölge, kenarlık */}
            <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-700 bg-gray-700"> {/* Padding, kenarlık, arka plan */}
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Font boyutu ve rengi */}
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-800 flex items-center justify-center mr-2 sm:mr-3 text-white"> {/* Boyut, yuvarlatma, arka plan, ikon rengi */}
                  <FiActivity className="h-4 w-4" />
                </div>
                {user.isim}'in Faaliyetleri ({userFaaliyetler.length})
              </h3>
            </div>
            
            <div className="p-4 sm:p-6"> {/* Padding */}
              {loadingFaaliyetler ? (
                <div className="text-center py-10 sm:py-12"> {/* Padding */}
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-red-400 border-t-red-600 mx-auto"></div> {/* Boyut ve renk */}
                  <p className="mt-3 sm:mt-4 text-gray-300 font-medium text-sm sm:text-base">Faaliyetler yükleniyor...</p> {/* Font boyutu ve rengi */}
                </div>
              ) : userFaaliyetler.length > 0 ? (
                <div className="space-y-4 sm:space-y-6"> {/* Mobil boşluk */}
                  {userFaaliyetler.map((faaliyet) => (
                    <ActivityCard 
                      key={faaliyet.id} 
                      faaliyet={faaliyet}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12"> {/* Padding */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6"> {/* Boyut ve arka plan */}
                    <FiActivity className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" /> {/* İkon boyutu ve rengi */}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-2"> {/* Font boyutu ve rengi */}
                    Henüz faaliyet yok
                  </h4>
                  <p className="text-gray-400 text-sm"> {/* Font boyutu ve rengi */}
                    {user.isim} henüz herhangi bir faaliyet paylaşmamış.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UyeProfile;
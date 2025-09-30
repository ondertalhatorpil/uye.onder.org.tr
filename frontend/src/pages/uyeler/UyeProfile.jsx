import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, faaliyetService, UPLOADS_BASE_URL } from '../../services';
import {
  FiUser, FiActivity, FiArrowLeft,
  FiMail, FiPhone, FiMapPin, FiBriefcase, FiZap, FiBookOpen,
  FiClock, FiX, FiInfo, FiChevronDown, FiChevronUp, FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import ProfileHeader from './components/UyeProfile/ProfileHeader';
import ActivityCard from './components/UyeProfile/ActivityCard';
import InfoSection from './components/UyeProfile/InfoSection';



const ProfileAvatar = ({ user, size = 'xl' }) => {
  const sizeClasses = {
    lg: 'h-16 w-16',
    xl: 'h-20 w-20 sm:h-24 sm:w-24',
    xxl: 'h-28 w-28 sm:h-32 sm:w-32',
    full: 'w-full h-full' 
  };

  const textSizeClasses = {
    lg: 'text-xl',
    xl: 'text-xl sm:text-2xl',
    xxl: 'text-2xl sm:text-3xl',
    full: 'text-3xl'
  };

  const roundedClasses = {
    lg: 'rounded-xl',
    xl: 'rounded-xl sm:rounded-2xl',
    xxl: 'rounded-2xl sm:rounded-3xl',
    full: 'rounded-full'
  };

  const getAvatarUrl = useMemo(() => {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;

    if (!user?.profil_fotografi) return fallbackUrl;

    let imageUrl = user.profil_fotografi;
    if (imageUrl.startsWith('http')) return imageUrl;

    const baseUrl = UPLOADS_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin);

    if (!imageUrl.startsWith('uploads/')) {
      imageUrl = `uploads/profile-images/${imageUrl}`;
    }
    return `${baseUrl}/${imageUrl}`;

  }, [user]);

  const currentSize = size === 'full' ? 'xl' : size; 

  return (
    <div className={`${sizeClasses[size]} ${roundedClasses[currentSize]} bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg ring-4 ring-gray-800 flex-shrink-0 overflow-hidden`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.style.backgroundImage = 'none';
            e.target.parentNode.innerHTML = `<span class="${textSizeClasses[currentSize]} font-bold text-white">${user?.isim?.charAt(0)?.toUpperCase() || 'U'}</span>`;
          }}
        />
      ) : (
        <span className={`${textSizeClasses[currentSize]} font-bold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, isLink = false, linkPrefix }) => (
  <div className="flex items-start text-sm sm:text-base py-2 border-b border-gray-700 last:border-b-0">
    <Icon className="h-5 w-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="font-semibold text-gray-300">{label}</span>
      {value ? (
        isLink ? (
          <a href={`${linkPrefix}${value}`} className="text-red-400 hover:text-red-300 transition-colors break-words">
            {value}
          </a>
        ) : (
          <span className="text-gray-400 break-words">{value}</span>
        )
      ) : (
        <span className="text-gray-500 italic">Belirtilmemiş</span>
      )}
    </div>
  </div>
);

const UyeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userFaaliyetler, setUserFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setLoadingFaaliyetler(true);
        const response = await userService.getUserById(id);

        if (response.success) {
          setUser(response.data.user);
          setUserFaaliyetler(response.data.faaliyetler || []);
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
        setLoadingFaaliyetler(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id, navigate]);

  const formatDateForDisplay = useCallback((dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const formatTimeAgo = useCallback((dateString) => {
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
  }, [formatDateForDisplay]);

  const membershipDays = useMemo(() =>
    user?.created_at ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0
    , [user]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const handleContact = useCallback(() => user?.telefon && window.open(`tel:${user.telefon}`), [user]);
  const handleMessage = useCallback(() => toast.success('Mesaj özelliği yakında eklenecek!'), []);
  const openInfoModal = useCallback(() => setIsInfoOpen(true), []);
  const closeInfoModal = useCallback(() => setIsInfoOpen(false), []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-400 border-t-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-300 font-medium">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-16">
        {/* Hata bileşeni */}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-full sm:max-w-5xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">

        <ProfileHeader
          user={user}
          onBack={handleBack}
          onContact={handleContact}
          onMessage={handleMessage}
          onInfoClick={openInfoModal}
          ProfileAvatar={ProfileAvatar}
        />

        <section className="space-y-4 sm:space-y-6">
          <div className="py-3 sm:px-6 sm:py-4 flex items-center">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <div className="h-6 w-6 rounded-md bg-gray-700 flex items-center justify-center mr-3 text-gray-300">
                <FiActivity className="h-4 w-4" />
              </div>
              Faaliyet Geçmişi
              <span className="ml-3 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
                {userFaaliyetler.length}
              </span>
            </h3>
          </div>

          {loadingFaaliyetler ? (
            <div className="text-center py-10 sm:py-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-red-400 border-t-red-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-300 font-medium text-sm sm:text-base">Faaliyetler yükleniyor...</p>
            </div>
          ) : userFaaliyetler.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {userFaaliyetler.map((faaliyet) => (
                <ActivityCard
                  key={faaliyet.id}
                  faaliyet={faaliyet}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-5 sm:py-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <FiActivity className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                Henüz faaliyet yok
              </h4>
              <p className="text-gray-400 text-sm">
                {user.isim} henüz herhangi bir faaliyet paylaşmamış.
              </p>
            </div>
          )}
        </section>

      </div>

      {isInfoOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm overflow-y-auto">
          <div className="relative min-h-screen p-4 sm:p-6">

            <header className="top-0 z-10 max-w-full sm:max-w-5xl mx-auto flex justify-between items-center py-4 sm:py-6">
              <h2 className="text-2xl sm:text-2xl font-extrabold text-white flex items-center">
                {user.isim} {user.soyisim} Detaylı Bilgiler
              </h2>
              <button
                onClick={closeInfoModal}
                className="p-3 bg-red-700 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-xl"
                aria-label="Kapat"
              >
                <FiX className="h-6 w-6" />
              </button>
            </header>

            <div className="max-w-full sm:max-w-5xl mx-auto">
              <InfoSection user={user} formatDateForDisplay={formatDateForDisplay} />

              <div className="mt-8 mb-20 p-6 bg-gray-850 rounded-2xl shadow-xl border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Üyelik Geçmişi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={FiClock}
                    label="Toplam Üyelik Süresi"
                    value={`${membershipDays} gün`}
                  />
                  <InfoItem
                    icon={FiCalendar}
                    label="Kayıt Tarihi"
                    value={formatDateForDisplay(user.created_at)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UyeProfile;
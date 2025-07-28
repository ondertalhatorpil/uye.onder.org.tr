import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiCalendar, FiPhone, FiUsers, 
  FiActivity, FiBriefcase, FiExternalLink, FiHome
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

// Profil Avatar Bileşeni
const ProfileAvatar = ({ user, size = 'md' }) => {
  const sizeData = {
    sm: {
      container: 'h-10 w-10',
      text: 'text-sm',
      rounded: 'rounded-lg'
    },
    md: {
      container: 'h-12 w-12 sm:h-14 sm:w-14',
      text: 'text-lg sm:text-xl',
      rounded: 'rounded-xl sm:rounded-2xl'
    },
    lg: {
      container: 'h-16 w-16 sm:h-20 sm:w-20',
      text: 'text-xl sm:text-2xl',
      rounded: 'rounded-2xl sm:rounded-3xl'
    }
  };

  const config = sizeData[size] || sizeData.md;

  // Profil fotoğrafı URL'ini oluştur
  const getAvatarUrl = () => {
    if (user?.profil_fotografi) {
      let imageUrl;
      
      // Backend'den gelen tam URL mı kontrol et
      if (user.profil_fotografi.startsWith('http')) {
        imageUrl = user.profil_fotografi;
      } else {
        // Development vs Production URL belirleme
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isDevelopment 
          ? 'http://localhost:3001'
          : UPLOADS_BASE_URL || 'https://uye.onder.org.tr';
        
        // Eğer profil_fotografi zaten "uploads/" ile başlıyorsa, tekrar ekleme
        if (user.profil_fotografi.startsWith('uploads/')) {
          imageUrl = `${baseUrl}/${user.profil_fotografi}`;
        } else {
          imageUrl = `${baseUrl}/uploads/profile-images/${user.profil_fotografi}`;
        }
      }
      
      return imageUrl;
    }
    
    // Varsayılan avatar
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
  };

  return (
    <div className={`${config.container} ${config.rounded} bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hata durumunda varsayılan avatar'a geç
            e.target.style.display = 'none';
            e.target.nextSibling?.remove();
            const span = document.createElement('span');
            span.className = `${config.text} font-bold text-white`;
            span.textContent = user?.isim?.charAt(0)?.toUpperCase() || 'U';
            e.target.parentNode.appendChild(span);
          }}
        />
      ) : (
        <span className={`${config.text} font-bold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

// --- Color Maps for consistency and JIT compatibility ---
const colorMapClasses = {
  // Backgrounds for icon containers & hover states
  iconBg: {
    red: "bg-red-900/30",
    blue: "bg-blue-900/30",
    green: "bg-green-900/30",
    purple: "bg-purple-900/30",
    gray: "bg-gray-700",
  },
  // Icon colors
  iconColor: {
    red: "text-red-400",
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    gray: "text-gray-400",
  },
  // Backgrounds for item/stat cards
  cardBg: {
    red: "bg-red-900/10",
    blue: "bg-blue-900/10",
    green: "bg-green-900/10",
    purple: "bg-purple-900/10",
  },
  // Text colors for item/stat cards
  cardText: {
    red: "text-red-300",
    blue: "text-blue-300",
    green: "text-green-300",
    purple: "text-purple-300",
  },
  // Values/Numbers in stat cards
  valueColor: {
    red: "text-red-400",
    blue: "text-blue-400",
  }
};

// --- TabButton Bileşeni ---
const TabButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 py-3 px-4 sm:py-4 sm:px-6 border-b-3 font-semibold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
      active
        ? 'border-red-500 text-red-400 bg-gray-700'
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-750'
    } rounded-t-lg sm:rounded-t-xl`}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-1.5 sm:ml-2 px-2 py-0.5 sm:py-1 rounded-full text-xs ${
        active ? 'bg-red-900/30 text-red-300' : 'bg-gray-700 text-gray-400'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// --- InfoCard Bileşeni ---
const InfoCard = ({ title, children, icon: Icon, color = "red" }) => (
  <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-700 bg-gradient-to-r from-gray-750 to-gray-800">
      <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
        <div className={`h-7 w-7 sm:h-8 w-8 rounded-md sm:rounded-lg ${colorMapClasses.iconBg[color] || colorMapClasses.iconBg.gray} flex items-center justify-center mr-2 sm:mr-3`}>
          <Icon className={`h-3.5 w-3.5 sm:h-4 w-4 ${colorMapClasses.iconColor[color] || colorMapClasses.iconColor.gray}`} />
        </div>
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// --- InfoItem Bileşeni ---
const InfoItem = ({ icon: Icon, label, value, href, color = "gray" }) => {
  const content = (
    <div className={`flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-750 transition-all duration-200 group`}>
      <div className={`h-9 w-9 sm:h-10 w-10 rounded-md sm:rounded-lg ${colorMapClasses.iconBg[color] || colorMapClasses.iconBg.gray} group-hover:bg-gray-700 flex items-center justify-center mr-3 sm:mr-4 transition-colors`}>
        <Icon className={`h-4.5 w-4.5 sm:h-5 w-5 ${colorMapClasses.iconColor[color] || colorMapClasses.iconColor.gray}`} />
      </div>
      <div className="flex-1">
        <div className="text-xs sm:text-sm font-medium text-gray-300">{label}</div>
        <div className="text-sm sm:text-white font-medium">{value || 'Belirtilmemiş'}</div>
      </div>
      {href && (
        <FiExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
      )}
    </div>
  );

  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : content;
};

// --- MemberCard Bileşeni (Profil Fotoğrafı ile) ---
const MemberCard = ({ member }) => (
  <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
    <div className="flex items-center mb-3 sm:mb-4">
      {/* ProfileAvatar bileşenini kullan */}
      <ProfileAvatar 
        user={{
          isim: member.isim,
          soyisim: member.soyisim,
          profil_fotografi: member.profil_fotografi
        }} 
        size="md" 
      />
      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
        <h4 className="font-semibold text-white text-base sm:text-lg truncate">
          {member.isim} {member.soyisim}
        </h4>
        <p className="text-gray-400 text-xs sm:text-sm truncate">
          {member.meslek || 'Meslek belirtilmemiş'}
        </p>
      </div>
    </div>

    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
      {member.sektor && (
        <div className="flex items-center p-2.5 sm:p-3 bg-blue-900/20 rounded-lg">
          <FiBriefcase className="mr-2 h-3.5 w-3.5 sm:h-4 w-4 text-blue-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-blue-300 font-medium truncate">{member.sektor}</span>
        </div>
      )}
      
      {(member.il || member.ilce) && (
        <div className="flex items-center p-2.5 sm:p-3 bg-green-900/20 rounded-lg">
          <FiMapPin className="mr-2 h-3.5 w-3.5 sm:h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-green-300 font-medium truncate">
            {member.il}{member.ilce && `, ${member.ilce}`}
          </span>
        </div>
      )}
    </div>

    <Link
      to={`/uyeler/${member.id}`}
      className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
    >
      Profili Görüntüle
    </Link>
  </div>
);

// --- ActivityCard Bileşeni (Profil Fotoğrafı ile) ---
const ActivityCard = ({ faaliyet }) => {
  // URL oluşturma helper'ı
  const getImageUrl = (imageName) => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDevelopment 
      ? 'http://localhost:3001'
      : UPLOADS_BASE_URL || 'https://uye.onder.org.tr';
    
    return `${baseUrl}/uploads/faaliyet-images/${imageName}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
      {/* User Info */}
      <div className="flex items-center mb-3 sm:mb-4">
        <ProfileAvatar 
          user={{
            isim: faaliyet.isim,
            soyisim: faaliyet.soyisim,
            profil_fotografi: faaliyet.profil_fotografi
          }} 
          size="sm" 
        />
        <div className="ml-3">
          <p className="font-semibold text-white text-sm sm:text-base">
            {faaliyet.isim} {faaliyet.soyisim}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Content */}
      {faaliyet.baslik && (
        <h4 className="font-bold text-white mb-2 sm:mb-3 text-lg sm:text-xl line-clamp-2">
          {faaliyet.baslik}
        </h4>
      )}
      
      {faaliyet.aciklama && (
        <p className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
          {faaliyet.aciklama}
        </p>
      )}

      {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto">
          {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg sm:rounded-xl aspect-w-16 aspect-h-9">
              <img
                src={getImageUrl(gorsel)}
                alt={`Faaliyet ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x200/374151/D1D5DB?text=Resim+Yok';
                }}
              />
               {faaliyet.gorseller.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-base sm:text-lg font-bold rounded-lg sm:rounded-xl">
                    +{faaliyet.gorseller.length - 4}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- DernekTabs Bileşeni ---
const DernekTabs = ({ 
  activeTab, 
  setActiveTab, 
  dernek, 
  members, 
  faaliyetler, 
  loadingMembers, 
  loadingFaaliyetler, 
  socialMedia, 
  formatDate 
}) => {
  return (
    <div className="bg-gray-850 rounded-xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-700 overflow-hidden mt-6 sm:mt-8">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-700 bg-gray-900">
        <nav className="flex flex-nowrap overflow-x-auto justify-start px-2 sm:px-4 md:px-8 custom-scrollbar-hide">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            children="Genel Bilgiler" 
          />
          <TabButton
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            count={members.length}
            children="Üyeler" 
          />
          <TabButton
            active={activeTab === 'activities'}
            onClick={() => setActiveTab('activities')}
            count={faaliyetler.length}
            children="Faaliyetler" 
          />
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 md:p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Dernek Bilgileri */}
            <InfoCard title="Dernek Bilgileri" icon={FiHome} color="red">
              <div className="space-y-2 sm:space-y-3">
                <InfoItem 
                  icon={FiHome} 
                  label="Dernek Adı" 
                  value={dernek.dernek_adi}
                  color="red"
                />
                {dernek.dernek_baskani && (
                  <InfoItem 
                    icon={FiUser} 
                    label="Başkan" 
                    value={dernek.dernek_baskani}
                    color="blue"
                  />
                )}
                {dernek.dernek_kuruluş_tarihi && (
                  <InfoItem 
                    icon={FiCalendar} 
                    label="Kuruluş Tarihi" 
                    value={formatDate ? formatDate(dernek.dernek_kuruluş_tarihi) : new Date(dernek.dernek_kuruluş_tarihi).toLocaleDateString('tr-TR')}
                    color="purple"
                  />
                )}
                {(dernek.il || dernek.ilce) && (
                  <InfoItem 
                    icon={FiMapPin} 
                    label="Lokasyon" 
                    value={`${dernek.il}${dernek.ilce ? `, ${dernek.ilce}` : ''}`}
                    color="green"
                  />
                )}
                {dernek.dernek_telefon && (
                  <InfoItem 
                    icon={FiPhone} 
                    label="Telefon" 
                    value={dernek.dernek_telefon}
                    href={`tel:${dernek.dernek_telefon}`}
                    color="green"
                  />
                )}
              </div>
            </InfoCard>

            {/* İstatistikler ve Sosyal Medya */}
            <div className="space-y-6 sm:space-y-8">
              {/* İstatistikler */}
              <InfoCard title="İstatistikler" icon={FiUsers} color="blue">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center ${colorMapClasses.cardBg.red}`}>
                    <div className={`text-3xl sm:text-4xl font-extrabold mb-1.5 sm:mb-2 ${colorMapClasses.valueColor.red}`}>{members.length}</div>
                    <div className={`text-xs sm:text-sm font-medium ${colorMapClasses.cardText.red}`}>Toplam Üye</div>
                  </div>
                  
                  <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center ${colorMapClasses.cardBg.blue}`}>
                    <div className={`text-3xl sm:text-4xl font-extrabold mb-1.5 sm:mb-2 ${colorMapClasses.valueColor.blue}`}>{faaliyetler.length}</div>
                    <div className={`text-xs sm:text-sm font-medium ${colorMapClasses.cardText.blue}`}>Toplam Faaliyet</div>
                  </div>
                </div>
              </InfoCard>

              {/* Sosyal Medya */}
              {Object.keys(socialMedia).length > 0 && (
                <InfoCard title="Sosyal Medya" icon={FiExternalLink} color="purple">
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(socialMedia).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-colors group ${colorMapClasses.cardBg.purple} hover:bg-purple-900/20`} 
                      >
                        <div className={`h-9 w-9 sm:h-10 w-10 rounded-md sm:rounded-lg ${colorMapClasses.iconBg.purple} group-hover:bg-purple-800 flex items-center justify-center mr-2.5 sm:mr-3`}>
                          <FiExternalLink className={`h-4.5 w-4.5 sm:h-5 w-5 ${colorMapClasses.iconColor.purple}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs sm:text-sm font-medium ${colorMapClasses.cardText.purple}`}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </div>
                          <div className={`text-xs sm:text-sm truncate ${colorMapClasses.iconColor.purple}`}>{url}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {loadingMembers ? (
              <div className="text-center py-12 sm:py-16 bg-gray-800 rounded-xl sm:rounded-2xl">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-400 font-medium">Üyeler yükleniyor...</p>
              </div>
            ) : members.length > 0 ? (
              <div>
                <div className="mb-6 sm:mb-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Dernek Üyeleri
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    {dernek.dernek_adi} bünyesinde {members.length} aktif üye bulunmaktadır
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-gray-800 rounded-xl sm:rounded-2xl">
                <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                  <FiUsers className="h-10 w-10 sm:h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-2.5 sm:mb-3">Henüz üye yok</h4>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-sm sm:max-w-md mx-auto">
                  Bu derneğe henüz üye kaydı yapılmamış. İlk üye olmak için 
                  dernek ile iletişime geçebilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            {loadingFaaliyetler ? (
              <div className="text-center py-12 sm:py-16 bg-gray-800 rounded-xl sm:rounded-2xl">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-400 font-medium">Faaliyetler yükleniyor...</p>
              </div>
            ) : faaliyetler.length > 0 ? (
              <div>
                <div className="mb-6 sm:mb-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                    Dernek Faaliyetleri
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    {dernek.dernek_adi} üyeleri tarafından paylaşılan {faaliyetler.length} faaliyet
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {faaliyetler.map((faaliyet) => (
                    <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-gray-800 rounded-xl sm:rounded-2xl">
                <div className="h-20 w-20 sm:h-24 w-24 rounded-2xl sm:rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                  <FiActivity className="h-10 w-10 sm:h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-2.5 sm:mb-3">Henüz faaliyet yok</h4>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-sm sm:max-w-md mx-auto">
                  Bu dernek henüz herhangi bir faaliyet paylaşmamış. 
                  Yakında harika faaliyetler görebilirsiniz!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DernekTabs;
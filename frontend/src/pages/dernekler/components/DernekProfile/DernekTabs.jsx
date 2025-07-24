import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiCalendar, FiPhone, FiUsers, 
  FiActivity, FiBriefcase, FiExternalLink, FiHome
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

// --- Color Maps for consistency and JIT compatibility ---
const colorMap = {
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
    red: "bg-red-900/10", // Lighter tint for stat cards
    blue: "bg-blue-900/10",
    green: "bg-green-900/10",
    purple: "bg-purple-900/10",
    gray: "bg-gray-700",
  },
  // Text colors for item/stat cards
  cardText: {
    red: "text-red-300",
    blue: "text-blue-300",
    green: "text-green-300",
    purple: "text-purple-300",
    gray: "text-gray-400",
  },
  // Values/Numbers in stat cards
  valueColor: {
    red: "text-red-400",
    blue: "text-blue-400",
  }
};


const TabButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    // Dark theme for active/inactive tabs
    className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
      active
        ? 'border-red-500 text-red-400 bg-gray-700' // Active tab: red border, red text, darker background
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-750' // Inactive: lighter hover effects
    } rounded-t-xl`} // Slightly less rounded for a sharper look
  >
    {children}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
        active ? 'bg-red-900/30 text-red-300' : 'bg-gray-700 text-gray-400' // Count badge colors
      }`}>
        {count}
      </span>
    )}
  </button>
);

const InfoCard = ({ title, children, icon: Icon, color = "red" }) => (
  // Card background: Darker gray, shadow, and border
  <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
    {/* Header: Darker gradient, border */}
    <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-750 to-gray-800">
      <h3 className="text-lg font-bold text-white flex items-center"> {/* White title */}
        {/* Icon container: Uses color map for dynamic dark background */}
        <div className={`h-8 w-8 rounded-lg ${colorMap.iconBg[color] || colorMap.iconBg.gray} flex items-center justify-center mr-3`}>
          {/* Icon color: Uses color map for dynamic text color */}
          <Icon className={`h-4 w-4 ${colorMap.iconColor[color] || colorMap.iconColor.gray}`} />
        </div>
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, href, color = "gray" }) => {
  const content = (
    // Item background: Darker on hover
    <div className={`flex items-center p-4 rounded-xl hover:bg-gray-750 transition-all duration-200 group`}>
      {/* Icon container: Uses color map for dynamic dark background & hover */}
      <div className={`h-10 w-10 rounded-lg ${colorMap.iconBg[color] || colorMap.iconBg.gray} group-hover:bg-gray-700 flex items-center justify-center mr-4 transition-colors`}>
        {/* Icon color: Uses color map for dynamic text color */}
        <Icon className={`h-5 w-5 ${colorMap.iconColor[color] || colorMap.iconColor.gray}`} />
      </div>
      <div className="flex-1">
        {/* Label: Lighter gray */}
        <div className="text-sm font-medium text-gray-300">{label}</div>
        {/* Value: White text */}
        <div className="text-white font-medium">{value || 'Belirtilmemiş'}</div>
      </div>
      {href && ( // Add external link icon for hrefs
        <FiExternalLink className="ml-2 h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
      )}
    </div>
  );

  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : content;
};

const MemberCard = ({ member }) => (
  // Card background: Darker gray, border, and enhanced shadow/hover
  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
    <div className="flex items-center mb-4">
      {/* Avatar: Vibrant gradient, larger for impact */}
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
        <span className="text-xl font-bold text-white"> {/* Larger initial */}
          {member.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="ml-4 flex-1">
        {/* Name: White text */}
        <h4 className="font-semibold text-white text-lg">
          {member.isim} {member.soyisim}
        </h4>
        {/* Profession: Gray text */}
        <p className="text-gray-400">
          {member.meslek || 'Meslek belirtilmemiş'}
        </p>
      </div>
    </div>

    <div className="space-y-3 mb-4"> {/* Increased spacing */}
      {member.sektor && (
        // Info pill: Darker background, blue text
        <div className="flex items-center p-3 bg-blue-900/20 rounded-lg">
          <FiBriefcase className="mr-2 h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">{member.sektor}</span>
        </div>
      )}
      
      {(member.il || member.ilce) && (
        // Info pill: Darker background, green text
        <div className="flex items-center p-3 bg-green-900/20 rounded-lg">
          <FiMapPin className="mr-2 h-4 w-4 text-green-400" />
          <span className="text-sm text-green-300 font-medium">
            {member.il}{member.ilce && `, ${member.ilce}`}
          </span>
        </div>
      )}
    </div>

    <Link
      to={`/uyeler/${member.id}`}
      // Button: Vibrant gradient, consistent hover
      className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
    >
      Profili Görüntüle
    </Link>
  </div>
);

const ActivityCard = ({ faaliyet }) => (
  // Card background: Darker gray, border, and enhanced shadow/hover
  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
    {/* User Info */}
    <div className="flex items-center mb-4">
      {/* Avatar: Vibrant gradient */}
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
        <span className="text-lg font-bold text-white">
          {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="ml-3">
        {/* Name: White text */}
        <p className="font-semibold text-white">
          {faaliyet.isim} {faaliyet.soyisim}
        </p>
        {/* Date: Gray text */}
        <p className="text-sm text-gray-400">
          {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>

    {/* Content */}
    {faaliyet.baslik && (
      // Title: White text
      <h4 className="font-bold text-white mb-3 text-xl"> {/* Larger title */}
        {faaliyet.baslik}
      </h4>
    )}
    
    {faaliyet.aciklama && (
      // Description: Lighter gray text
      <p className="text-gray-300 mb-4 leading-relaxed text-base"> {/* Adjusted text size */}
        {faaliyet.aciklama}
      </p>
    )}

    {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
          <div key={index} className="relative group overflow-hidden rounded-xl"> {/* Rounded image container */}
            <img
              src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`}
              alt={`Faaliyet ${index + 1}`}
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" // Larger image height
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200/374151/D1D5DB?text=Resim+Yok'; // Darker placeholder
              }}
            />
             {faaliyet.gorseller.length > 4 && index === 3 && ( // Add overlay for more images
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-bold rounded-xl">
                  +{faaliyet.gorseller.length - 4}
                </div>
              )}
          </div>
        ))}
      </div>
    )}
  </div>
);

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
    // Main container for the tabs section
    <div className="bg-gray-850 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden mt-8"> {/* Dark background, strong shadow, border */}
      {/* Tabs Navigation */}
      <div className="border-b border-gray-700 bg-gray-900"> {/* Darker background for tab bar */}
        <nav className="flex px-8">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Genel Bilgiler
          </TabButton>
          <TabButton
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            count={members.length}
          >
            Üyeler
          </TabButton>
          <TabButton
            active={activeTab === 'activities'}
            onClick={() => setActiveTab('activities')}
            count={faaliyetler.length}
          >
            Faaliyetler
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dernek Bilgileri */}
            <InfoCard title="Dernek Bilgileri" icon={FiHome} color="red">
              <div className="space-y-3"> {/* Adjusted spacing */}
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
                    value={formatDate(dernek.dernek_kuruluş_tarihi)}
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
            <div className="space-y-8">
              {/* İstatistikler */}
              <InfoCard title="İstatistikler" icon={FiUsers} color="blue">
                <div className="grid grid-cols-2 gap-4">
                  {/* Stat Card 1: Members */}
                  <div className={`rounded-2xl p-6 text-center ${colorMap.cardBg.red}`}>
                    <div className={`text-4xl font-extrabold mb-2 ${colorMap.valueColor.red}`}>{members.length}</div> {/* Larger, vibrant */}
                    <div className={`text-sm font-medium ${colorMap.cardText.red}`}>Toplam Üye</div>
                  </div>
                  
                  {/* Stat Card 2: Activities */}
                  <div className={`rounded-2xl p-6 text-center ${colorMap.cardBg.blue}`}>
                    <div className={`text-4xl font-extrabold mb-2 ${colorMap.valueColor.blue}`}>{faaliyetler.length}</div> {/* Larger, vibrant */}
                    <div className={`text-sm font-medium ${colorMap.cardText.blue}`}>Toplam Faaliyet</div>
                  </div>
                </div>
              </InfoCard>

              {/* Sosyal Medya */}
              {Object.keys(socialMedia).length > 0 && (
                <InfoCard title="Sosyal Medya" icon={FiExternalLink} color="purple">
                  <div className="space-y-3">
                    {Object.entries(socialMedia).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center p-3 rounded-xl transition-colors group ${colorMap.cardBg.purple} hover:bg-purple-900/20`}
                      >
                        <div className={`h-10 w-10 rounded-lg ${colorMap.iconBg.purple} group-hover:bg-purple-800 flex items-center justify-center mr-3`}>
                          <FiExternalLink className={`h-5 w-5 ${colorMap.iconColor.purple}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${colorMap.cardText.purple}`}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </div>
                          <div className={`text-sm truncate ${colorMap.iconColor.purple}`}>{url}</div> {/* URL in vibrant color */}
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
              <div className="text-center py-16 bg-gray-800 rounded-xl"> {/* Darker loading background */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div> {/* Vibrant red loader */}
                <p className="mt-6 text-lg text-gray-400 font-medium">Üyeler yükleniyor...</p> {/* Gray text */}
              </div>
            ) : members.length > 0 ? (
              <div>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2"> {/* White title */}
                    Dernek Üyeleri
                  </h3>
                  <p className="text-gray-300"> {/* Lighter gray text */}
                    {dernek.dernek_adi} bünyesinde {members.length} aktif üye bulunmaktadır
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800 rounded-xl"> {/* Darker empty state background */}
                <div className="h-24 w-24 rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-6"> {/* Darker icon background */}
                  <FiUsers className="h-12 w-12 text-gray-400" /> {/* Gray icon */}
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">Henüz üye yok</h4> {/* White title */}
                <p className="text-gray-400 leading-relaxed max-w-md mx-auto"> {/* Gray text */}
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
              <div className="text-center py-16 bg-gray-800 rounded-xl"> {/* Darker loading background */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-red-700 mx-auto"></div> {/* Vibrant red loader */}
                <p className="mt-6 text-lg text-gray-400 font-medium">Faaliyetler yükleniyor...</p> {/* Gray text */}
              </div>
            ) : faaliyetler.length > 0 ? (
              <div>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2"> {/* White title */}
                    Dernek Faaliyetleri
                  </h3>
                  <p className="text-gray-300"> {/* Lighter gray text */}
                    {dernek.dernek_adi} üyeleri tarafından paylaşılan {faaliyetler.length} faaliyet
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {faaliyetler.map((faaliyet) => (
                    <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800 rounded-xl"> {/* Darker empty state background */}
                <div className="h-24 w-24 rounded-3xl bg-gray-700 flex items-center justify-center mx-auto mb-6"> {/* Darker icon background */}
                  <FiActivity className="h-12 w-12 text-gray-400" /> {/* Gray icon */}
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">Henüz faaliyet yok</h4> {/* White title */}
                <p className="text-gray-400 leading-relaxed max-w-md mx-auto"> {/* Gray text */}
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
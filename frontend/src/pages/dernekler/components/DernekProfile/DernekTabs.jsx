import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMapPin, FiCalendar, FiPhone, FiUsers, 
  FiActivity, FiBriefcase, FiExternalLink, FiHome
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services/api';

const TabButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 ${
      active
        ? 'border-red-500 text-red-600 bg-red-50'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
    } rounded-t-2xl`}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
        active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const InfoCard = ({ title, children, icon: Icon, color = "red" }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <h3 className="text-lg font-bold text-gray-900 flex items-center">
        <div className={`h-8 w-8 rounded-lg bg-${color}-100 flex items-center justify-center mr-3`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, href, color = "gray" }) => {
  const content = (
    <div className={`flex items-center p-4 rounded-xl hover:bg-${color}-50 transition-all duration-200 group`}>
      <div className={`h-10 w-10 rounded-lg bg-${color}-100 group-hover:bg-${color}-200 flex items-center justify-center mr-4 transition-colors`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-gray-900 font-medium">{value || 'Belirtilmemiş'}</div>
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
};

const MemberCard = ({ member }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
    <div className="flex items-center mb-4">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
        <span className="text-lg font-bold text-white">
          {member.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-semibold text-gray-900 text-lg">
          {member.isim} {member.soyisim}
        </h4>
        <p className="text-gray-600">
          {member.meslek || 'Meslek belirtilmemiş'}
        </p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      {member.sektor && (
        <div className="flex items-center p-2 bg-blue-50 rounded-lg">
          <FiBriefcase className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">{member.sektor}</span>
        </div>
      )}
      
      {(member.il || member.ilce) && (
        <div className="flex items-center p-2 bg-green-50 rounded-lg">
          <FiMapPin className="mr-2 h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            {member.il}{member.ilce && `, ${member.ilce}`}
          </span>
        </div>
      )}
    </div>

    <Link
      to={`/uyeler/${member.id}`}
      className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      Profili Görüntüle
    </Link>
  </div>
);

const ActivityCard = ({ faaliyet }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
    {/* User Info */}
    <div className="flex items-center mb-4">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
        <span className="text-sm font-bold text-white">
          {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="ml-3">
        <p className="font-semibold text-gray-900">
          {faaliyet.isim} {faaliyet.soyisim}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>

    {/* Content */}
    {faaliyet.baslik && (
      <h4 className="font-bold text-gray-900 mb-3 text-lg">
        {faaliyet.baslik}
      </h4>
    )}
    
    {faaliyet.aciklama && (
      <p className="text-gray-700 mb-4 leading-relaxed">
        {faaliyet.aciklama}
      </p>
    )}

    {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
          <div key={index} className="relative group">
            <img
              src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`}
              alt={`Faaliyet ${index + 1}`}
              className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
              }}
            />
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
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
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
            <InfoCard title="Dernek Bilgileri" icon={FiHome}>
              <div className="space-y-2">
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
                  <div className="bg-red-50 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{members.length}</div>
                    <div className="text-sm font-medium text-red-800">Toplam Üye</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{faaliyetler.length}</div>
                    <div className="text-sm font-medium text-blue-800">Toplam Faaliyet</div>
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
                        className="flex items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center mr-3">
                          <FiExternalLink className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-700">
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </div>
                          <div className="text-purple-600 text-sm truncate">{url}</div>
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
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                <p className="mt-6 text-lg text-gray-600 font-medium">Üyeler yükleniyor...</p>
              </div>
            ) : members.length > 0 ? (
              <div>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Dernek Üyeleri
                  </h3>
                  <p className="text-gray-600">
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
              <div className="text-center py-16">
                <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Henüz üye yok</h4>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
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
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                <p className="mt-6 text-lg text-gray-600 font-medium">Faaliyetler yükleniyor...</p>
              </div>
            ) : faaliyetler.length > 0 ? (
              <div>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Dernek Faaliyetleri
                  </h3>
                  <p className="text-gray-600">
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
              <div className="text-center py-16">
                <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <FiActivity className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Henüz faaliyet yok</h4>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
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
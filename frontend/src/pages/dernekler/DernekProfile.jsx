import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dernekService, userService, faaliyetService } from '../../services/api';
import { 
  FiUser, FiPhone, FiMapPin, FiCalendar,
  FiUsers, FiActivity, FiArrowLeft, FiGrid,
  FiMail, FiExternalLink, FiHome, FiBriefcase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const DernekProfile = () => {
  const { dernekAdi } = useParams();
  const navigate = useNavigate();
  
  const [dernek, setDernek] = useState(null);
  const [members, setMembers] = useState([]);
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, activities

  // Dernek bilgilerini getir
  useEffect(() => {
    const loadDernek = async () => {
      try {
        setLoading(true);
        const response = await dernekService.getDernekProfile(dernekAdi);
        
        if (response.success) {
          setDernek(response.data);
        } else {
          toast.error('Dernek bulunamadı');
          navigate('/dernekler');
        }
      } catch (error) {
        console.error('Dernek loading error:', error);
        toast.error('Dernek bilgileri yüklenemedi');
        navigate('/dernekler');
      } finally {
        setLoading(false);
      }
    };

    if (dernekAdi) {
      loadDernek();
    }
  }, [dernekAdi, navigate]);

  // Dernek üyelerini getir
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const response = await userService.getUsersByDernek(dernekAdi);
        
        if (response.success) {
          setMembers(response.data || []);
        }
      } catch (error) {
        console.error('Members loading error:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (dernekAdi) {
      loadMembers();
    }
  }, [dernekAdi]);

  // Dernek faaliyetlerini getir
  useEffect(() => {
    const loadFaaliyetler = async () => {
      try {
        setLoadingFaaliyetler(true);
        const response = await faaliyetService.getFaaliyetler({ dernek: dernekAdi });
        
        if (response.success) {
          setFaaliyetler(response.data || []);
        }
      } catch (error) {
        console.error('Faaliyetler loading error:', error);
      } finally {
        setLoadingFaaliyetler(false);
      }
    };

    if (dernekAdi) {
      loadFaaliyetler();
    }
  }, [dernekAdi]);

  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `http://localhost:3001/uploads/dernek-logos/${logoPath}`;
  };

  // Sosyal medya linklerini parse et
  const parseSocialMedia = (socialMediaData) => {
    if (!socialMediaData) return {};
    try {
      return typeof socialMediaData === 'string' 
        ? JSON.parse(socialMediaData) 
        : socialMediaData;
    } catch {
      return {};
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dernek bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!dernek) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dernek bulunamadı</h2>
        <p className="text-gray-600 mb-4">Aradığınız dernek mevcut değil.</p>
        <button
          onClick={() => navigate('/dernekler')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Derneklere Dön
        </button>
      </div>
    );
  }

  const socialMedia = parseSocialMedia(dernek.dernek_sosyal_medya_hesaplari);

  return (
    <div className="space-y-6">
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

      {/* Dernek Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Cover/Banner Area */}
        <div className="h-32 bg-gradient-to-r from-red-600 to-red-700"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            {/* Logo */}
            <div className="relative -mt-16 mb-4 sm:mb-0">
              <div className="h-32 w-32 rounded-lg bg-white border-4 border-white shadow-lg overflow-hidden">
                {dernek.dernek_logosu ? (
                  <img
                    src={getDernekLogoUrl(dernek.dernek_logosu)}
                    alt={dernek.dernek_adi}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${dernek.dernek_logosu ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gray-100`}>
                  <FiHome className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {dernek.dernek_adi}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {dernek.dernek_baskani && (
                  <div className="flex items-center">
                    <FiUser className="mr-1 h-4 w-4" />
                    {dernek.dernek_baskani}
                  </div>
                )}
                
                {(dernek.il || dernek.ilce) && (
                  <div className="flex items-center">
                    <FiMapPin className="mr-1 h-4 w-4" />
                    {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                  </div>
                )}
                
                <div className="flex items-center">
                  <FiUsers className="mr-1 h-4 w-4" />
                  {members.length} üye
                </div>
                
                <div className="flex items-center">
                  <FiActivity className="mr-1 h-4 w-4" />
                  {faaliyetler.length} faaliyet
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {dernek.dernek_telefon && (
                  <a
                    href={`tel:${dernek.dernek_telefon}`}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiPhone className="mr-2 h-4 w-4" />
                    Ara
                  </a>
                )}
                
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiMail className="mr-2 h-4 w-4" />
                  İletişim
                </button>
                
                <Link
                  to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiUsers className="mr-2 h-4 w-4" />
                  Üyeleri Ara
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Genel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Üyeler ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Faaliyetler ({faaliyetler.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Dernek Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernek Bilgileri</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernek Adı</label>
                    <p className="text-gray-900">{dernek.dernek_adi}</p>
                  </div>
                  
                  {dernek.dernek_baskani && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Başkan</label>
                      <div className="flex items-center text-gray-900">
                        <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                        {dernek.dernek_baskani}
                      </div>
                    </div>
                  )}
                  
                  {dernek.dernek_kuruluş_tarihi && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kuruluş Tarihi</label>
                      <div className="flex items-center text-gray-900">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                        {formatDate(dernek.dernek_kuruluş_tarihi)}
                      </div>
                    </div>
                  )}
                  
                  {(dernek.il || dernek.ilce) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
                      <div className="flex items-center text-gray-900">
                        <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {dernek.il}{dernek.ilce && `, ${dernek.ilce}`}
                      </div>
                    </div>
                  )}
                  
                  {dernek.dernek_telefon && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <div className="flex items-center text-gray-900">
                        <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                        <a href={`tel:${dernek.dernek_telefon}`} className="hover:text-blue-600">
                          {dernek.dernek_telefon}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* İstatistikler ve Sosyal Medya */}
              <div className="space-y-8">
                {/* İstatistikler */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{members.length}</div>
                      <div className="text-sm text-red-800">Toplam Üye</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{faaliyetler.length}</div>
                      <div className="text-sm text-red-800">Toplam Faaliyet</div>
                    </div>
                  </div>
                </div>

                {/* Sosyal Medya */}
                {Object.keys(socialMedia).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sosyal Medya</h3>
                    
                    <div className="space-y-2">
                      {Object.entries(socialMedia).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-500"
                        >
                          <FiExternalLink className="mr-2 h-4 w-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Üyeler yükleniyor...</p>
                </div>
              ) : members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.isim?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">
                            {member.isim} {member.soyisim}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {member.meslek || 'Meslek belirtilmemiş'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        {member.sektor && (
                          <div className="flex items-center text-xs text-gray-600">
                            <FiBriefcase className="mr-1 h-3 w-3" />
                            {member.sektor}
                          </div>
                        )}
                        
                        {(member.il || member.ilce) && (
                          <div className="flex items-center text-xs text-gray-600">
                            <FiMapPin className="mr-1 h-3 w-3" />
                            {member.il}{member.ilce && `, ${member.ilce}`}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/uyeler/${member.id}`}
                        className="block w-full text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Profili Görüntüle
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz üye yok</h4>
                  <p className="text-gray-500">Bu derneğe henüz üye kaydı yapılmamış.</p>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div>
              {loadingFaaliyetler ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Faaliyetler yükleniyor...</p>
                </div>
              ) : faaliyetler.length > 0 ? (
                <div className="space-y-6">
                  {faaliyetler.map((faaliyet) => (
                    <div key={faaliyet.id} className="border border-gray-200 rounded-lg p-4">
                      {/* User Info */}
                      <div className="flex items-center mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {faaliyet.isim?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900">
                            {faaliyet.isim} {faaliyet.soyisim}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      {faaliyet.baslik && (
                        <h4 className="font-medium text-gray-900 mb-2">
                          {faaliyet.baslik}
                        </h4>
                      )}
                      
                      {faaliyet.aciklama && (
                        <p className="text-gray-700 mb-3 text-sm">
                          {faaliyet.aciklama}
                        </p>
                      )}

                      {/* Images */}
                      {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 max-w-md">
                          {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`http://localhost:3001/uploads/faaliyet-images/${gorsel}`}
                                alt={`Faaliyet ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz faaliyet yok</h4>
                  <p className="text-gray-500">Bu dernek henüz herhangi bir faaliyet paylaşmamış.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DernekProfile;
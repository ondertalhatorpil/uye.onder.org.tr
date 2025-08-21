import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiMapPin, FiUsers, 
  FiActivity, FiMail, FiHome
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

const DernekHeader = ({ dernek, members, faaliyetler }) => {
  // Fallback logo bileşeni
  const DefaultLogo = () => (
    <div className="w-full h-full bg-gray-900/50 flex items-center justify-center">
      <FiHome className="w-16 h-16 text-gray-600" />
    </div>
  );

  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-logos/${logoPath}`;
  };

  return (
    // Ana konteyner: Daha dinamik ve kart benzeri yapı
    <div className="relative bg-gray-900 rounded-3xl shadow-xl border border-gray-800">

      {/* Kapak Görseli veya Boş Alan */}
      <div className="h-28 bg-gradient-to-r from-red-600/30 to-red-900/30 rounded-t-3xl border-b border-gray-800"></div>
      
      {/* Profil Bilgileri */}
      <div className="flex flex-col items-center -mt-16 px-6">
        
        {/* Logo Konteyneri: Daha yuvarlak ve belirgin */}
        <div className="relative h-32 w-32 rounded-full border-4 border-gray-850 bg-gray-900 shadow-2xl overflow-hidden mb-4">
          {dernek.dernek_logosu ? (
            <>
              <img
                src={getDernekLogoUrl(dernek.dernek_logosu)}
                alt={dernek.dernek_adi}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full hidden">
                <DefaultLogo />
              </div>
            </>
          ) : (
            <DefaultLogo />
          )}
        </div>

        {/* İsim ve Başkan Bilgisi */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1">
            {dernek.dernek_adi}
          </h1>
          {dernek.dernek_baskani && (
            <p className="text-gray-400 font-medium flex items-center justify-center">
              <FiUser className="h-4 w-4 mr-2 text-blue-400" />
              {dernek.dernek_baskani}
            </p>
          )}
        </div>
      </div>

      {/* İstatistikler ve Konum Bilgisi */}
      <div className="flex flex-wrap items-center justify-center gap-6 px-6 pb-6 border-b border-gray-800">
        <div className="flex items-center text-white">
          <FiUsers className="h-5 w-5 mr-2 text-gray-500" />
          <span className="font-bold text-lg">{members.length}</span>
          <span className="text-gray-400 ml-1">Üye</span>
        </div>
        <div className="flex items-center text-white">
          <FiActivity className="h-5 w-5 mr-2 text-gray-500" />
          <span className="font-bold text-lg">{faaliyetler.length}</span>
          <span className="text-gray-400 ml-1">Faaliyet</span>
        </div>
        {(dernek.il || dernek.ilce) && (
          <div className="flex items-center text-gray-400">
            <FiMapPin className="h-5 w-5 mr-2 text-green-400" />
            <span className="text-sm">{dernek.il}{dernek.ilce && `, ${dernek.ilce}`}</span>
          </div>
        )}
      </div>

      {/* Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row p-6 pt-4 gap-3 justify-center">
        {dernek.dernek_telefon && (
          <a
            href={`tel:${dernek.dernek_telefon}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-[#FA2C37] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiPhone className="mr-2 h-4 w-4" />
            Ara
          </a>
        )}
        <button 
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiMail className="mr-2 h-4 w-4" />
          İletişim
        </button>
        <Link
          to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiUsers className="mr-2 h-4 w-4" />
          Üyeleri Ara
        </Link>
      </div>
    </div>
  );
};

export default DernekHeader;
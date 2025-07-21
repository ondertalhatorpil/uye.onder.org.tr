import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiMapPin, FiUsers, 
  FiActivity, FiMail, FiHome
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services/api';

const DernekHeader = ({ dernek, members, faaliyetler }) => {
  // Default logo component
  const DefaultLogo = () => (
    <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
      <img 
        src="https://onder.org.tr/assets/images/statics/onder-logo.svg"
        alt="ÖNDER Logo"
        className="w-16 h-16 object-contain opacity-60"
      />
    </div>
  );

  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-logos/${logoPath}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">      
      {/* Profile Content */}
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
          {/* Logo */}
          <div className="relative -mt-16 mb-6 lg:mb-0">
            <div className="h-32 w-32 rounded-3xl bg-white border-4 border-white shadow-lg overflow-hidden">
              {dernek.dernek_logosu ? (
                <>
                  {/* Gerçek logo */}
                  <img
                    src={getDernekLogoUrl(dernek.dernek_logosu)}
                    alt={dernek.dernek_adi}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Gerçek logo yüklenmezse ÖNDER logosuna geç
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback ÖNDER logosu */}
                  <div className="w-full h-full hidden">
                    <DefaultLogo />
                  </div>
                </>
              ) : (
                // Logo yoksa direkt ÖNDER logosu göster
                <DefaultLogo />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between pt-6">
              <div className="flex-1 mb-6 lg:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {dernek.dernek_adi}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                  {dernek.dernek_baskani && (
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
                        <FiUser className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{dernek.dernek_baskani}</span>
                    </div>
                  )}
                  
                  {(dernek.il || dernek.ilce) && (
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
                        <FiMapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <span>{dernek.il}{dernek.ilce && `, ${dernek.ilce}`}</span>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiUsers className="mr-2 h-4 w-4" />
                    <span className="font-medium text-gray-900">{members.length}</span> üye
                  </div>
                  <div className="flex items-center">
                    <FiActivity className="mr-2 h-4 w-4" />
                    <span className="font-medium text-gray-900">{faaliyetler.length}</span> faaliyet
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {dernek.dernek_telefon && (
                  <a
                    href={`tel:${dernek.dernek_telefon}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiPhone className="mr-2 h-4 w-4" />
                    Ara
                  </a>
                )}
                
                <button className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-all duration-200 font-semibold">
                  <FiMail className="mr-2 h-4 w-4" />
                  İletişim
                </button>
                
                <Link
                  to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                  className="inline-flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-all duration-200 font-semibold"
                >
                  <FiUsers className="mr-2 h-4 w-4" />
                  Üyeleri Ara
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DernekHeader;
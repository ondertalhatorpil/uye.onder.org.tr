import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiMapPin, FiUsers, 
  FiActivity, FiMail, FiHome // FiHome added for fallback
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

const DernekHeader = ({ dernek, members, faaliyetler }) => {
  // Default logo component for when no specific logo is available
  const DefaultLogo = () => (
    // Darker, subtle gradient for the fallback logo background
    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
      {/* A more neutral default icon or a slightly muted ÖNDER logo */}
      <FiHome className="w-16 h-16 text-gray-400 opacity-60" /> 
      {/* If you specifically want ÖNDER logo: */}
      {/* <img 
        src="https://onder.org.tr/assets/images/statics/onder-logo.svg"
        alt="ÖNDER Logo"
        className="w-16 h-16 object-contain opacity-60"
      /> */}
    </div>
  );

  // Dernek logosu URL'i
  const getDernekLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${UPLOADS_BASE_URL}/uploads/dernek-logos/${logoPath}`;
  };

  return (
    // Main container: Darker background, more rounded, pronounced shadow, subtle border
    <div className="bg-gray-850 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative">
      {/* Optional: Add a subtle decorative top border/gradient like in MyDernek */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 to-red-600"></div>
      
      {/* Profile Content */}
      <div className="p-8 relative"> {/* Adjusted padding */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8">
          {/* Logo */}
          <div className="relative -mt-16 mb-6 lg:mb-0">
            {/* Logo container: Darker border, increased size for impact, softer shadow */}
            <div className="h-36 w-36 rounded-3xl bg-gray-900 border-4 border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center">
              {dernek.dernek_logosu ? (
                <>
                  {/* Gerçek logo */}
                  <img
                    src={getDernekLogoUrl(dernek.dernek_logosu)}
                    alt={dernek.dernek_adi}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Gerçek logo yüklenmezse fallback'e geç
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback component for hidden image */}
                  <div className="w-full h-full hidden">
                    <DefaultLogo />
                  </div>
                </>
              ) : (
                // Logo yoksa direkt fallback göster
                <DefaultLogo />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between pt-2">
              <div className="flex-1 mb-6 lg:mb-0">
                {/* Dernek Adı: White text, larger font, more prominent */}
                <h1 className="text-3xl font-extrabold text-white mb-3">
                  {dernek.dernek_adi}
                </h1>
                
                {/* Info blocks: Darker backgrounds for icons, adjusted text color */}
                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
                  {dernek.dernek_baskani && (
                    <div className="flex items-center">
                      {/* Icon background: Darker blue, slightly larger */}
                      <div className="h-9 w-9 rounded-lg bg-blue-900/30 flex items-center justify-center mr-2">
                        <FiUser className="h-5 w-5 text-blue-400" /> {/* Icon color */}
                      </div>
                      <span className="font-semibold text-gray-100">{dernek.dernek_baskani}</span> {/* More prominent text */}
                    </div>
                  )}
                  
                  {(dernek.il || dernek.ilce) && (
                    <div className="flex items-center">
                      {/* Icon background: Darker green, slightly larger */}
                      <div className="h-9 w-9 rounded-lg bg-green-900/30 flex items-center justify-center mr-2">
                        <FiMapPin className="h-5 w-5 text-green-400" /> {/* Icon color */}
                      </div>
                      <span className="text-gray-100">{dernek.il}{dernek.ilce && `, ${dernek.ilce}`}</span>
                    </div>
                  )}
                </div>

                {/* Quick Stats: Adjusted text colors for dark theme */}
                <div className="flex items-center gap-6 text-base text-gray-400"> {/* Larger text */}
                  <div className="flex items-center">
                    <FiUsers className="mr-2 h-5 w-5 text-gray-500" /> {/* Icon size/color */}
                    <span className="font-semibold text-white">{members.length}</span> üye
                  </div>
                  <div className="flex items-center">
                    <FiActivity className="mr-2 h-5 w-5 text-gray-500" /> {/* Icon size/color */}
                    <span className="font-semibold text-white">{faaliyetler.length}</span> faaliyet
                  </div>
                </div>
              </div>

              {/* Action Buttons: Darker, semi-transparent backgrounds with vibrant text. Consistent hover effects. */}
              <div className="flex flex-wrap items-center gap-4"> {/* Increased gap */}
                {dernek.dernek_telefon && (
                  <a
                    href={`tel:${dernek.dernek_telefon}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105" // Retained vibrant gradient, improved hover
                  >
                    <FiPhone className="mr-2 h-5 w-5" /> {/* Larger icon */}
                    Ara
                  </a>
                )}
                
                <button 
                  className="inline-flex items-center px-6 py-3 bg-blue-900/30 text-blue-400 rounded-2xl hover:bg-blue-900/50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105" // Darker background, vibrant text
                >
                  <FiMail className="mr-2 h-5 w-5" /> {/* Larger icon */}
                  İletişim
                </button>
                
                <Link
                  to={`/uyeler?dernek=${encodeURIComponent(dernek.dernek_adi)}`}
                  className="inline-flex items-center px-6 py-3 bg-purple-900/30 text-purple-400 rounded-2xl hover:bg-purple-900/50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105" // Darker background, vibrant text
                >
                  <FiUsers className="mr-2 h-5 w-5" /> {/* Larger icon */}
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
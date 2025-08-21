import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiPhone, FiMail, FiUsers, FiNavigation, FiExternalLink } from 'react-icons/fi';

// Leaflet marker ikonları düzeltmesi
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Özel kırmızı marker ikonu
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px; 
        height: 30px; 
        background: #DC2626; 
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <div style="
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #DC2626;
          margin-top: -3px;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Harita merkezleme komponenti
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  return null;
};

const DernekLocationMap = ({ dernek, showPopup = true, height = '400px' }) => {
  // Harita merkezi
  const center = dernek?.dernek_latitude && dernek?.dernek_longitude 
    ? [parseFloat(dernek.dernek_latitude), parseFloat(dernek.dernek_longitude)]
    : [41.0082, 28.9784]; // Default: İstanbul

  const zoom = dernek?.dernek_latitude && dernek?.dernek_longitude ? 15 : 10;

  // Google Directions'a yönlendir
  const openInGoogleMaps = () => {
    if (dernek?.dernek_latitude && dernek?.dernek_longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${dernek.dernek_latitude},${dernek.dernek_longitude}`;
      window.open(url, '_blank');
    }
  };

  // Konum bilgisi yok
  if (!dernek?.dernek_latitude || !dernek?.dernek_longitude) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <FiMapPin className="mr-2 h-5 w-5 text-[#FA2C37]" />
          <h3 className="text-lg font-semibold text-[#FA2C37]">Konum</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center" style={{ height }}>
          <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Konum Bilgisi Yok</h3>
          <p className="text-gray-600">Bu dernek için henüz konum bilgisi eklenmemiş.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Harita Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FiMapPin className="mr-2 h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-100">Konum</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={openInGoogleMaps}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FiNavigation className="mr-1 h-4 w-4" />
            Google Maps
          </button>
        </div>
      </div>

      <div 
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* Harita katmanı - OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Alternatif güzel harita stilleri */}
          {/* 
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          */}

          {/* Dernek Marker */}
          <Marker 
            position={center} 
            icon={createCustomIcon()}
          >
            {showPopup && (
              <Popup 
                closeButton={false}
                className="custom-popup"
              >
                <div className="p-3 min-w-[280px]">
                  <h4 className="font-semibold text-gray-900 mb-3 text-base">
                    {dernek.dernek_adi}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    {dernek.dernek_baskani && (
                      <div className="flex items-center text-gray-600">
                        <FiUsers className="mr-2 h-4 w-4 text-red-500" />
                        <span className="font-medium">Başkan:</span>
                        <span className="ml-1">{dernek.dernek_baskani}</span>
                      </div>
                    )}
                    
                    {dernek.dernek_telefon && (
                      <div className="flex items-center text-gray-600">
                        <FiPhone className="mr-2 h-4 w-4 text-green-500" />
                        <a 
                          href={`tel:${dernek.dernek_telefon}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {dernek.dernek_telefon}
                        </a>
                      </div>
                    )}
                    
                    {dernek.dernek_email && (
                      <div className="flex items-center text-gray-600">
                        <FiMail className="mr-2 h-4 w-4 text-blue-500" />
                        <a 
                          href={`mailto:${dernek.dernek_email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium break-all"
                        >
                          {dernek.dernek_email}
                        </a>
                      </div>
                    )}
                    
                    {dernek.uye_sayisi && (
                      <div className="flex items-center text-red-600 font-medium mt-3 pt-2 border-t border-gray-200">
                        <FiUsers className="mr-2 h-4 w-4" />
                        {dernek.uye_sayisi} aktif üye
                      </div>
                    )}
                  </div>
                  
                  {/* Popup içinde yol tarifi */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={openInGoogleMaps}
                      className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FiNavigation className="mr-2 h-4 w-4" />
                      Yol Tarifi Al
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>

          {/* Harita kontrolcüsü */}
          <MapController center={center} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
};

export default DernekLocationMap;
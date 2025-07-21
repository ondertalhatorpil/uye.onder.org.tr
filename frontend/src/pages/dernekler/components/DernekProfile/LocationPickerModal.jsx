import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiSave, FiX, FiTarget, FiNavigation } from 'react-icons/fi';

// Leaflet marker düzeltmesi
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Kırmızı marker ikonu
const createRedMarker = () => {
  return L.divIcon({
    className: 'custom-red-marker',
    html: `
      <div style="
        width: 30px; 
        height: 30px; 
        background: #DC2626; 
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: bounce 0.3s ease-out;
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Harita tıklama dinleyicisi
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat: lat, lng: lng });
    }
  });
  return null;
};

// Harita kontrolcüsü
const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [map, center]);
  
  return null;
};

const LocationPickerModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  dernek,
  saving = false 
}) => {
  // Başlangıç konumu (mevcut konum veya İstanbul)
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');

  // Modal açıldığında başlangıç konumunu ayarla
  useEffect(() => {
    if (isOpen) {
      if (dernek?.dernek_latitude && dernek?.dernek_longitude) {
        // Mevcut konum varsa onu kullan
        setSelectedLocation({
          lat: parseFloat(dernek.dernek_latitude),
          lng: parseFloat(dernek.dernek_longitude)
        });
        setAddress(dernek.dernek_adres || '');
      } else {
        // Yoksa İstanbul'u göster
        setSelectedLocation({ lat: 41.0082, lng: 28.9784 });
        setAddress('');
      }
    }
  }, [isOpen, dernek]);

  // Konum seçildiğinde
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
  };

  // Kaydet
  const handleSave = () => {
    if (selectedLocation && onSave) {
      onSave({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        adres: address
      });
    }
  };

  // Modal kapalıysa render etme
  if (!isOpen) return null;

  // Harita merkezi
  const mapCenter = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [41.0082, 28.9784];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[96vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dernek Konumu Belirle
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Haritada derneğinizin bulunduğu yere tıklayın
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Harita ve İçerik */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Talimat */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FiTarget className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <strong>Nasıl Kullanılır:</strong> Haritada derneğinizin bulunduğu yere tıklayın. Kırmızı işaretçi o noktaya yerleşecektir.
              </p>
            </div>
          </div>

          {/* Harita */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4" style={{ height: '300px' }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Tıklama dinleyicisi */}
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              
              {/* Seçili konum marker'ı */}
              {selectedLocation && (
                <Marker 
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={createRedMarker()}
                />
              )}
              
              {/* Harita kontrolcüsü */}
              <MapController center={selectedLocation} />
            </MapContainer>
          </div>

          {/* Seçili Konum Bilgisi */}
          {selectedLocation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <FiMapPin className="mr-2 h-4 w-4 text-red-600" />
                Seçili Konum
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Enlem:</span> {selectedLocation.lat.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Boylam:</span> {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
              
              {/* Adres girişi */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Örn: Palandöken, Erzurum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Seçim yapılmadıysa uyarı */}
          {!selectedLocation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FiTarget className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Lütfen haritada bir konum seçin
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedLocation ? (
              <span className="flex items-center text-green-600">
                <FiMapPin className="mr-1 h-4 w-4" />
                Konum seçildi
              </span>
            ) : (
              'Haritada bir noktaya tıklayın'
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedLocation || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  Konumu Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
const { Client } = require('@googlemaps/google-maps-services-js');

class GeocodingService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  // Adres → Koordinat dönüşümü
  async geocodeAddress(address) {
    try {
      if (!address || address.trim() === '') {
        throw new Error('Adres bilgisi gerekli');
      }

      console.log('Geocoding address:', address);

      const response = await this.client.geocode({
        params: {
          address: address,
          key: this.apiKey,
          language: 'tr', // Türkçe sonuçlar
          region: 'tr'    // Türkiye bölgesi
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Adres bulunamadı');
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        success: true,
        data: {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          address_components: result.address_components
        }
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Geocoding işlemi başarısız'
      };
    }
  }

  // Koordinat → Adres dönüşümü
  async reverseGeocode(latitude, longitude) {
    try {
      if (!latitude || !longitude) {
        throw new Error('Enlem ve boylam bilgisi gerekli');
      }

      console.log('Reverse geocoding:', latitude, longitude);

      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
          key: this.apiKey,
          language: 'tr',
          region: 'tr'
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Bu koordinatlarda adres bulunamadı');
      }

      const result = response.data.results[0];

      return {
        success: true,
        data: {
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          address_components: result.address_components,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      };

    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Reverse geocoding işlemi başarısız'
      };
    }
  }

  // Adres önerileri (Places Autocomplete)
  async getPlaceSuggestions(input) {
    try {
      if (!input || input.trim().length < 3) {
        return {
          success: false,
          error: 'En az 3 karakter girin'
        };
      }

      console.log('Getting place suggestions for:', input);

      const response = await this.client.placeAutocomplete({
        params: {
          input: input,
          key: this.apiKey,
          language: 'tr',
          components: 'country:tr', // Sadece Türkiye
          types: 'establishment|geocode' // Kurumlar ve adresler
        }
      });

      const suggestions = response.data.predictions.map(prediction => ({
        place_id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text
      }));

      return {
        success: true,
        data: suggestions
      };

    } catch (error) {
      console.error('Place suggestions error:', error);
      return {
        success: false,
        error: error.message || 'Adres önerileri alınamadı'
      };
    }
  }

  // Place ID'den detay bilgi alma
  async getPlaceDetails(placeId) {
    try {
      if (!placeId) {
        throw new Error('Place ID gerekli');
      }

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          language: 'tr',
          fields: ['geometry', 'formatted_address', 'name', 'address_components']
        }
      });

      const place = response.data.result;
      
      return {
        success: true,
        data: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          formatted_address: place.formatted_address,
          name: place.name,
          place_id: placeId
        }
      };

    } catch (error) {
      console.error('Place details error:', error);
      return {
        success: false,
        error: error.message || 'Yer detayları alınamadı'
      };
    }
  }
}

module.exports = new GeocodingService();
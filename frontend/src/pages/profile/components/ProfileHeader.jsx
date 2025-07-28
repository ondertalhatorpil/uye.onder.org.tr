import React from 'react';
import { FiEdit3, FiSave, FiX, FiCamera, FiTrash2 } from 'react-icons/fi';
import { authService } from '../../../services';

const ProfileHeader = ({ 
  user, 
  isEditing, 
  loading, 
  onEdit, 
  onSave, 
  onCancel, 
  onImageSelect, 
  onDeleteImage,
  imagePreview,
  selectedImage 
}) => {
  
  // Profil fotoğrafı URL'ini oluştur
  const getProfileImageUrl = () => {
    // Debug logları
    console.log('ProfileHeader Debug:');
    console.log('- imagePreview:', !!imagePreview);
    console.log('- user.profil_fotografi:', user.profil_fotografi);
    console.log('- selectedImage:', !!selectedImage);
    
    // Önce preview varsa onu göster
    if (imagePreview) {
      console.log('- Using imagePreview');
      return imagePreview;
    }
    
    // Sonra mevcut profil fotoğrafını kontrol et
    if (user.profil_fotografi) {
      const imageUrl = authService.getProfileImageUrl(user.profil_fotografi);
      console.log('- Using actual profile image:', imageUrl);
      return imageUrl;
    }
    
    // Son olarak varsayılan avatar
    const defaultAvatar = `https://ui-avatars.com/api/?name=${user.isim || 'U'}+${user.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
    console.log('- Using default avatar:', defaultAvatar);
    return defaultAvatar;
  };

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
          <div className="relative mb-4 sm:mb-0 mx-auto sm:mx-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-gray-700 p-1 shadow-lg border-2 border-red-600">
              <img
                src={getProfileImageUrl()}
                alt={`${user.isim} ${user.soyisim}`}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  // Resim yüklenemezse varsayılan avatar'a geç
                  e.target.src = `https://ui-avatars.com/api/?name=${user.isim || 'U'}+${user.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
                }}
              />
            </div>
            
            {/* Kamera butonu - sadece editing modunda göster */}
            {isEditing && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button 
                  onClick={onImageSelect}
                  className="p-2 bg-red-600 rounded-full shadow-md border border-red-500 hover:bg-red-700 transition-colors z-10"
                  title="Profil fotoğrafını değiştir"
                  type="button"
                >
                  <FiCamera className="h-3 w-3 text-white" />
                </button>
                
                {/* Silme butonu - sadece profil fotoğrafı varsa göster */}
                {(user.profil_fotografi || selectedImage) && (
                  <button 
                    onClick={onDeleteImage}
                    className="p-2 bg-gray-600 rounded-full shadow-md border border-gray-500 hover:bg-gray-700 transition-colors z-10"
                    title="Profil fotoğrafını sil"
                    type="button"
                  >
                    <FiTrash2 className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            )}
            
            {/* Yeni fotoğraf seçildi göstergesi */}
            {selectedImage && (
              <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                Yeni
              </div>
            )}
          </div>
          
          <div className="sm:ml-6 text-center sm:text-left mt-3 sm:mt-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
              {user.isim} {user.soyisim}
            </h1>
            <p className="text-gray-400 font-medium text-sm sm:text-base">
              {user.meslek || 'Meslek belirtilmemiş'}
            </p>
            <div className="flex items-center justify-center sm:justify-start mt-2">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
              <p className="text-sm text-red-400 font-medium">
                {user.gonullu_dernek || 'Dernek belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-gray-600 rounded-xl text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="mr-2 h-4 w-4" />
                İptal
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiEdit3 className="mr-2 h-4 w-4" />
              Profili Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Image Selection Info - sadece editing modunda ve fotoğraf seçilince göster */}
      {isEditing && selectedImage && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <p className="text-sm text-green-400 font-medium">
              Yeni profil fotoğrafı seçildi: {selectedImage.name}
            </p>
          </div>
          <p className="text-xs text-green-300 mt-1">
            Değişiklikleri kaydetmeyi unutmayın.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">
              {user.created_at ? 
                Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
                : '0'
              }
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Günlük Üye</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">
              {user.il || 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Şehir</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">
              {user.sektor ? (user.sektor.length > 15 ? user.sektor.substring(0, 12) + '...' : user.sektor) : 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Sektör</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
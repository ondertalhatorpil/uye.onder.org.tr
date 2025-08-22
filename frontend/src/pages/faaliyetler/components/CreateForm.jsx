import React from 'react';
import { 
  FiCamera, FiX, FiCheck, FiUser, FiSend
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../services';

// Profil Avatar Bileşeni (DernekTabs'den kopyalandı)
const ProfileAvatar = ({ user, size = 'md' }) => {
  const sizeData = {
    sm: {
      container: 'h-10 w-10',
      text: 'text-sm',
      rounded: 'rounded-lg'
    },
    md: {
      container: 'h-12 w-12 sm:h-14 sm:w-14',
      text: 'text-lg sm:text-xl',
      rounded: 'rounded-xl sm:rounded-2xl'
    },
    lg: {
      container: 'h-16 w-16 sm:h-20 sm:w-20',
      text: 'text-xl sm:text-2xl',
      rounded: 'rounded-2xl sm:rounded-3xl'
    }
  };

  const config = sizeData[size] || sizeData.md;

  // Profil fotoğrafı URL'ini oluştur
  const getAvatarUrl = () => {
    if (user?.profil_fotografi) {
      let imageUrl;
      
      // Backend'den gelen tam URL mı kontrol et
      if (user.profil_fotografi.startsWith('http')) {
        imageUrl = user.profil_fotografi;
      } else {
        // Development vs Production URL belirleme
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isDevelopment 
          ? 'http://localhost:3001'
          : UPLOADS_BASE_URL || 'https://uye.onder.org.tr';
        
        // Eğer profil_fotografi zaten "uploads/" ile başlıyorsa, tekrar ekleme
        if (user.profil_fotografi.startsWith('uploads/')) {
          imageUrl = `${baseUrl}/${user.profil_fotografi}`;
        } else {
          imageUrl = `${baseUrl}/uploads/profile-images/${user.profil_fotografi}`;
        }
      }
      
      return imageUrl;
    }
    
    // Varsayılan avatar
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
  };

  return (
    <div className={`${config.container} ${config.rounded} bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hata durumunda varsayılan avatar'a geç
            e.target.style.display = 'none';
            e.target.nextSibling?.remove();
            const span = document.createElement('span');
            span.className = `${config.text} font-bold text-white`;
            span.textContent = user?.isim?.charAt(0)?.toUpperCase() || 'U';
            e.target.parentNode.appendChild(span);
          }}
        />
      ) : (
        <span className={`${config.text} font-bold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

const CreateForm = ({
  user,
  formData,
  handleChange,
  selectedImages,
  imagePreview,
  fileInputRef,
  handleImageSelect,
  removeImage,
  handleSubmit,
  isSubmitting,
  uploadingImages,
}) => {

  const ImagePreviewGrid = () => {
    if (imagePreview.length === 0) return null;

    const getGridClass = () => {
      if (imagePreview.length === 1) return "grid-cols-1"; 
      if (imagePreview.length === 2) return "grid-cols-2"; 
      return "grid-cols-2"; 
    };

    return (
      <div className={`grid ${getGridClass()} gap-3 mt-4`}>
        {imagePreview.map((preview, index) => (
          <div 
            key={preview.id} 
            className="relative group overflow-hidden rounded-xl h-32 sm:h-40" // Yükseklik azaltıldı
          >
            <img
              src={preview.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-gray-900 bg-opacity-70 text-white rounded-full hover:bg-red-600 transition-all duration-300"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const UploadArea = () => {
    if (selectedImages.length >= 4) return null;

    return (
      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl py-3 px-4 transition-colors duration-300"
        >
          <FiCamera className="h-5 w-5" />
          <span className="text-sm font-semibold">
            Fotoğraf Ekle ({selectedImages.length}/4)
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      
      {/* Kullanıcı Profili ve Açıklama Alanı */}
      <div className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4 border-b border-gray-700">
        {/* ProfileAvatar komponenti kullanıldı */}
        <ProfileAvatar 
          user={user} 
          size="md" 
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">{user?.isim} {user?.soyisim}</h2>
          </div>
          <textarea
            id="aciklama"
            name="aciklama"
            value={formData.aciklama}
            onChange={handleChange}
            rows={4}
            className="w-full text-sm sm:text-base border-none outline-none resize-none bg-transparent placeholder-gray-500 text-white mt-2"
            placeholder="Ne yaptınız, nasıl hissettiniz? Paylaşın..."
            maxLength={1000}
          />
        </div>
      </div>
      
      {/* Görsel Alanı */}
      <div className="p-4 sm:p-6">
        <ImagePreviewGrid />
        <UploadArea />
      </div>

      {/* Footer Butonu */}
      <div className="p-4 sm:p-6 flex justify-end">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || uploadingImages || (!formData.aciklama.trim() && selectedImages.length === 0)}
          className="inline-flex items-center justify-center px-6 py-3 bg-[#FA2C37] text-white rounded-xl hover:bg-[#d62731] transition-all duration-200 font-semibold shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {uploadingImages ? 'Yükleniyor...' : 'Paylaşılıyor...'}
            </>
          ) : (
            <>
              <FiSend className="mr-2 h-5 w-5" />
              Paylaş
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateForm;
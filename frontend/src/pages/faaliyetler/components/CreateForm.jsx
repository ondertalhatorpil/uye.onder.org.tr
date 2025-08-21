import React from 'react';
import { 
  FiCamera, FiX, FiCheck, FiUser, FiSend
} from 'react-icons/fi';

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
      // 1 resim tam boyut, 2 resim 2 sütun, 3 veya 4 resim 2x2 grid
      if (imagePreview.length === 1) return "grid-cols-1"; 
      if (imagePreview.length === 2) return "grid-cols-2"; 
      return "grid-cols-2"; 
    };

    return (
      <div className={`grid ${getGridClass()} gap-3 mt-4`}>
        {imagePreview.map((preview, index) => (
          <div 
            key={preview.id} 
            className="relative group overflow-hidden rounded-xl"
            style={{
              // Dinamik yükseklik ayarı
              paddingBottom: imagePreview.length === 1 ? '100%' : '50%',
              height: 0
            }}
          >
            <img
              src={preview.url}
              alt={`Preview ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
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
          className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white rounded-xl py-3 px-4 hover:bg-gray-700 transition-colors duration-300"
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
      <div className="p-6 flex items-start gap-4 border-b border-gray-700">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#FA2C37] flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {user?.isim?.charAt(0)?.toUpperCase() || <FiUser className="h-6 w-6" />}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{user?.isim} {user?.soyisim}</h2>
            <span className="text-xs text-gray-500">• Dernek Üyesi</span>
          </div>
          <textarea
            id="aciklama"
            name="aciklama"
            value={formData.aciklama}
            onChange={handleChange}
            rows={4}
            className="w-full text-base border-none outline-none resize-none bg-transparent placeholder-gray-500 text-white mt-2"
            placeholder="Ne yaptınız, nasıl hissettiniz? Paylaşın..."
            maxLength={1000}
          />
        </div>
      </div>
      
      {/* Görsel Alanı */}
      <div className="p-6">
        <ImagePreviewGrid />
        <UploadArea />
      </div>

      {/* Footer Butonu */}
      <div className="p-6 flex justify-end">
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
import React from 'react';
import { 
  FiCamera, FiX, FiImage, FiCheck, FiUser,
  FiMapPin, FiEdit3, FiUpload
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
  navigate
}) => {

  const ImagePreviewGrid = () => {
    if (imagePreview.length === 0) return null;

    const getGridClass = () => {
      switch (imagePreview.length) {
        case 1:
          return "grid-cols-1";
        case 2:
          return "grid-cols-2";
        case 3:
          return "grid-cols-2";
        case 4:
          return "grid-cols-2";
        default:
          return "grid-cols-2";
      }
    };

    return (
      <div className={`grid ${getGridClass()} gap-4 mb-6`}>
        {imagePreview.map((preview, index) => (
          <div 
            key={preview.id} 
            className={`relative group ${
              imagePreview.length === 3 && index === 0 ? 'col-span-2' : ''
            }`}
          >
            <img
              src={preview.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-2xl flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            {/* Image number badge */}
            <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white text-sm font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const UploadArea = () => {
    if (selectedImages.length >= 4) return null;

    return (
      <div className="mb-6">
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
          className="w-full border-3 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-red-400 hover:bg-red-50 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center mb-4 transition-colors duration-300">
              <FiCamera className="h-8 w-8 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fotoğraf Ekle
            </h3>
            <p className="text-gray-600 mb-2">
              Faaliyetinizin fotoğraflarını buraya yükleyin
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF • Maksimum 5MB • En fazla 4 fotoğraf
            </p>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* User Info Header */}
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">
                {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.isim} {user?.soyisim}
            </h2>
            <div className="flex items-center text-gray-600 mt-1">
              <FiMapPin className="mr-2 h-4 w-4" />
              <span>{user?.gonullu_dernek || 'Dernek Üyesi'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiEdit3 className="h-4 w-4" />
            Faaliyet paylaşıyor
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Başlık */}
          <div>
            <label htmlFor="baslik" className="block text-lg font-semibold text-gray-900 mb-3">
              Başlık
              <span className="text-gray-500 font-normal text-sm ml-2">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              id="baslik"
              name="baslik"
              value={formData.baslik}
              onChange={handleChange}
              className="block w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Faaliyetinize çekici bir başlık verin..."
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Başlık faaliyetinizi öne çıkarır
              </p>
              <p className="text-xs text-gray-400">
                {formData.baslik.length}/100
              </p>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="aciklama" className="block text-lg font-semibold text-gray-900 mb-3">
              Faaliyet Açıklaması
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              rows={6}
              className="block w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder-gray-400 resize-none"
              placeholder="Faaliyetinizi detaylı bir şekilde anlatın... Ne yaptınız? Nasıl geçti? Deneyimlerinizi paylaşın!"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Deneyimlerinizi toplulukla paylaşın
              </p>
              <p className="text-xs text-gray-400">
                {formData.aciklama.length}/1000
              </p>
            </div>
          </div>

          {/* Resim Yükleme */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Fotoğraflar
              {selectedImages.length > 0 && (
                <span className="text-red-600 ml-2">({selectedImages.length}/4)</span>
              )}
            </h3>
            
            {/* Image Preview Grid */}
            <ImagePreviewGrid />
            
            {/* Upload Area */}
            <UploadArea />

            {selectedImages.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center">
                  <FiImage className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">
                    {selectedImages.length} fotoğraf seçildi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                disabled={selectedImages.length >= 4}
              >
                <FiCamera className="mr-2 h-4 w-4" />
                Fotoğraf Ekle
              </button>
              
              <div className="text-sm text-gray-500">
                • En az açıklama veya fotoğraf ekleyin
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                İptal
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    {uploadingImages ? 'Fotoğraflar yükleniyor...' : 'Paylaşılıyor...'}
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2 h-5 w-5" />
                    Faaliyeti Paylaş
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateForm;
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
      // Mobil cihazlarda 1 veya 2 sütun
      // Daha büyük ekranlarda 2 sütun kalmaya devam edebilir
      if (imagePreview.length === 1) return "grid-cols-1 sm:grid-cols-1"; 
      return "grid-cols-2"; 
    };

    return (
      <div className={`grid ${getGridClass()} gap-3 sm:gap-4 mb-5 sm:mb-6`}> {/* Mobil boşluk */}
        {imagePreview.map((preview, index) => (
          <div 
            key={preview.id} 
            className={`relative group overflow-hidden rounded-xl sm:rounded-2xl ${ // Rounded köşeler
              imagePreview.length === 3 && index === 0 ? 'col-span-2' : ''
            }`}
          >
            <img
              src={preview.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-40 sm:h-48 object-cover rounded-xl sm:rounded-2xl border-2 border-gray-600 shadow-lg" // Yükseklik ve kenarlık rengi
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 sm:p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transform hover:scale-110" // Renk ve boyut
              >
                <FiX className="h-4 w-4 sm:h-5 sm:w-5" /> {/* İkon boyutu */}
              </button>
            </div>
            {/* Image number badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black bg-opacity-60 text-white text-xs sm:text-sm font-semibold px-2 py-0.5 sm:py-1 rounded-lg backdrop-blur-sm"> {/* Boyut ve padding */}
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
      <div className="mb-5 sm:mb-6"> {/* Mobil boşluk */}
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
          className="w-full border-2 border-dashed border-gray-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:border-red-500 hover:bg-gray-700 transition-all duration-300 group" // Kenarlık rengi, arka plan
        >
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gray-700 group-hover:bg-red-800 flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-300"> {/* Renk ve boyut */}
              <FiCamera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-red-200 transition-colors duration-300" /> {/* İkon rengi ve boyutu */}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2"> {/* Font rengi ve boyutu */}
              Fotoğraf Ekle
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-1 sm:mb-2"> {/* Font rengi ve boyutu */}
              Faaliyetinizin fotoğraflarını buraya yükleyin
            </p>
            <p className="text-xs sm:text-sm text-gray-500"> {/* Font rengi ve boyutu */}
              PNG, JPG, GIF • Maksimum 5MB • En fazla 4 fotoğraf
            </p>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 overflow-hidden"> {/* Arka plan, kenarlık, gölge */}
      {/* User Info Header */}
      <div className="p-5 sm:p-8 border-b border-gray-700 bg-gray-700"> {/* Padding ve arka plan */}
        <div className="flex items-center gap-3 sm:gap-4"> {/* Boşluk */}
          <div className="relative">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg"> {/* Boyut ve yuvarlatma */}
              <span className="text-lg sm:text-xl font-bold text-white">
                {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-green-500 rounded-full border-2 border-gray-800"></div> {/* Boyut ve kenarlık rengi */}
          </div>
          <div className="flex-1 min-w-0"> {/* min-w-0 eklendi */}
            <h2 className="text-lg sm:text-xl font-bold text-white truncate"> {/* Font rengi ve boyutu, truncate */}
              {user?.isim} {user?.soyisim}
            </h2>
            <div className="flex items-center text-gray-400 mt-0.5 sm:mt-1 text-sm"> {/* Font rengi ve boyutu */}
              <FiMapPin className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {/* İkon boyutu */}
              <span className="truncate">{user?.gonullu_dernek || 'Dernek Üyesi'}</span> {/* truncate eklendi */}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap"> {/* Mobil gizle, daha büyük ekranlarda göster */}
            <FiEdit3 className="h-4 w-4" />
            Faaliyet paylaşıyor
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form Content */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8"> {/* Padding ve boşluk */}
          {/* Başlık */}
          <div>
            <label htmlFor="baslik" className="block text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3"> {/* Font boyutu ve rengi */}
              Başlık
              <span className="text-gray-400 font-normal text-xs sm:text-sm ml-2">(Opsiyonel)</span> {/* Font boyutu ve rengi */}
            </label>
            <input
              type="text"
              id="baslik"
              name="baslik"
              value={formData.baslik}
              onChange={handleChange}
              className="block w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg border-2 border-gray-600 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder-gray-500 bg-gray-700 text-white" // Stil değiştirildi
              placeholder="Faaliyetinize çekici bir başlık verin..."
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1.5 sm:mt-2"> {/* Boşluk */}
              <p className="text-xs sm:text-sm text-gray-400"> {/* Font boyutu ve rengi */}
                Başlık faaliyetinizi öne çıkarır
              </p>
              <p className="text-xs text-gray-500">
                {formData.baslik.length}/100
              </p>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="aciklama" className="block text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3"> {/* Font boyutu ve rengi */}
              Faaliyet Açıklaması
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              rows={5} // Mobil için satır sayısı azaltıldı
              className="block w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg border-2 border-gray-600 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 placeholder-gray-500 bg-gray-700 text-white resize-none" // Stil değiştirildi
              placeholder="Faaliyetinizi detaylı bir şekilde anlatın... Ne yaptınız? Nasıl geçti? Deneyimlerinizi paylaşın!"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1.5 sm:mt-2"> {/* Boşluk */}
              <p className="text-xs sm:text-sm text-gray-400"> {/* Font boyutu ve rengi */}
                Deneyimlerinizi toplulukla paylaşın
              </p>
              <p className="text-xs text-gray-500">
                {formData.aciklama.length}/1000
              </p>
            </div>
          </div>

          {/* Resim Yükleme */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3"> {/* Font boyutu ve rengi */}
              Fotoğraflar
              {selectedImages.length > 0 && (
                <span className="text-red-400 ml-2">({selectedImages.length}/4)</span> 
              )}
            </h3>
            
            {/* Image Preview Grid */}
            <ImagePreviewGrid />
            
            {/* Upload Area */}
            <UploadArea />

            {selectedImages.length > 0 && (
              <div className="bg-blue-900 border border-blue-700 rounded-xl sm:rounded-2xl p-3 sm:p-4"> {/* Renk ve padding */}
                <div className="flex items-center">
                  <FiImage className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2" /> {/* İkon boyutu ve rengi */}
                  <span className="text-blue-200 font-medium text-sm"> {/* Font rengi ve boyutu */}
                    {selectedImages.length} fotoğraf seçildi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 bg-gray-700 border-t border-gray-600"> {/* Padding ve arka plan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"> {/* Boşluk */}
            {/* Quick Actions */}
            <div className="flex items-center gap-3"> {/* Boşluk */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-600 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm" // Stil ve font
                disabled={selectedImages.length >= 4}
              >
                <FiCamera className="mr-1.5 h-3.5 w-3.5" /> {/* İkon boyutu */}
                Fotoğraf Ekle
              </button>
              
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left"> {/* Font ve hizalama */}
                • En az başlık, açıklama veya fotoğraf ekleyin
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full sm:w-auto"> {/* Mobil ters dikey, sm sonrası yatay */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-300 bg-gray-600 border-2 border-gray-500 rounded-xl hover:bg-gray-500 hover:border-gray-400 transition-all duration-200 font-semibold text-sm" // Stil ve font
              >
                İptal
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none text-sm" // Stil ve font
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> {/* Boyut */}
                    {uploadingImages ? 'Fotoğraflar yükleniyor...' : 'Paylaşılıyor...'}
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2 h-4 w-4" /> {/* İkon boyutu */}
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
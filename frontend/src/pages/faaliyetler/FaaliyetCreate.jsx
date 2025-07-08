import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService } from '../../services/api';
import { 
  FiCamera, FiX, FiImage, FiPlus, 
  FiUpload, FiCheck, FiArrowLeft 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FaaliyetCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: ''
  });

  // Image state
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Resim seçimi handle et
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Maximum 4 resim
    if (selectedImages.length + files.length > 4) {
      toast.error('En fazla 4 resim yükleyebilirsiniz');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} dosyası çok büyük (Max: 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} dosyası resim formatında değil`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Resim preview'ları oluştur
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreview(prev => [...prev, ...newPreviews]);

    // Input'u temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Resim silme
  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreview(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      // URL'leri temizle
      if (prev[indexToRemove]) {
        URL.revokeObjectURL(prev[indexToRemove].url);
      }
      return newPreviews;
    });
  };

  // Resimleri upload et
  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await faaliyetService.uploadImages(formData);
      
      if (response.success) {
        return response.imageUrls || [];
      } else {
        throw new Error(response.error || 'Resim yükleme başarısız');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.baslik.trim() && !formData.aciklama.trim() && selectedImages.length === 0) {
      toast.error('En az başlık, açıklama veya resim eklemelisiniz');
      return false;
    }
    return true;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Önce resimleri yükle
      let imageUrls = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      // Faaliyet oluştur
      const faaliyetData = {
        baslik: formData.baslik.trim(),
        aciklama: formData.aciklama.trim(),
        gorseller: imageUrls // Backend'den gelen dosya isimleri
      };

      const response = await faaliyetService.createFaaliyet(faaliyetData);
      
      if (response.success) {
        toast.success('Faaliyet başarıyla paylaşıldı!');
        
        // Preview URL'leri temizle
        imagePreview.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
        // Ana sayfaya yönlendir
        navigate('/', { replace: true });
      } else {
        throw new Error(response.error || 'Faaliyet paylaşılamadı');
      }
    } catch (error) {
      console.error('Faaliyet create error:', error);
      toast.error(error.message || 'Faaliyet paylaşılırken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
            >
              <FiArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faaliyet Paylaş</h1>
              <p className="text-gray-600">Yaptığınız faaliyeti topluluğa paylaşın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-lg font-medium text-white">
                {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">
                {user?.isim} {user?.soyisim}
              </p>
              <p className="text-sm text-gray-500">
                {user?.gonullu_dernek || 'Dernek Üyesi'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Başlık */}
            <div>
              <label htmlFor="baslik" className="block text-sm font-medium text-gray-700 mb-2">
                Başlık (Opsiyonel)
              </label>
              <input
                type="text"
                id="baslik"
                name="baslik"
                value={formData.baslik}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Faaliyetinize bir başlık verin..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.baslik.length}/100 karakter
              </p>
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="aciklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Faaliyetinizi detaylı bir şekilde anlatın..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.aciklama.length}/1000 karakter
              </p>
            </div>

            {/* Resim Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraflar (En fazla 4 adet)
              </label>
              
              {/* Image Preview Grid */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {imagePreview.map((preview, index) => (
                    <div key={preview.id} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {selectedImages.length < 4 && (
                <div>
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
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <FiCamera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Fotoğraf Ekle
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (Max: 5MB)
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {selectedImages.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedImages.length}/4 fotoğraf seçildi
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={selectedImages.length >= 4}
                >
                  <FiImage className="mr-1.5 h-4 w-4" />
                  Fotoğraf
                </button>
                
                <span className="text-xs text-gray-500">
                  • En az başlık, açıklama veya fotoğraf ekleyin
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImages}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploadingImages ? 'Fotoğraflar yükleniyor...' : 'Paylaşılıyor...'}
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2 h-4 w-4" />
                      Paylaş
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaaliyetCreate;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetService } from '../../services';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import CreateForm from './components/CreateForm';

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
    <div className="min-h-screen bg-gray-900 text-white"> {/* Arka plan rengi değiştirildi */}
      <div className="max-w-full sm:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"> {/* Responsive padding */}
        {/* Header */}
        <div className="mb-6 sm:mb-8"> {/* Mobil boşluk */}
          <div className="flex items-center gap-3 sm:gap-4"> {/* Mobil boşluk */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-800 shadow-lg hover:shadow-xl border border-gray-700 transition-all duration-200 hover:scale-105" 
            >
              <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" /> {/* İkon rengi ve boyutu değiştirildi */}
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-red-500">Faaliyet Paylaş</h1> {/* Başlık rengi ve boyutu */}
              <p className="text-gray-400 text-sm sm:text-lg">Yaptığınız faaliyeti topluluğa paylaşın</p> {/* Alt başlık rengi ve boyutu */}
            </div>
          </div>
        </div>

        {/* Form Component */}
        <CreateForm
          user={user}
          formData={formData}
          handleChange={handleChange}
          selectedImages={selectedImages}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          handleImageSelect={handleImageSelect}
          removeImage={removeImage}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          uploadingImages={uploadingImages}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default FaaliyetCreate;
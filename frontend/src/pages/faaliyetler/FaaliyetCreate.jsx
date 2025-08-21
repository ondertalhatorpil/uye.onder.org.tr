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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > 4) {
      toast.error('En fazla 4 resim yükleyebilirsiniz');
      return;
    }

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

    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreview(prev => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreview(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      if (prev[indexToRemove]) {
        URL.revokeObjectURL(prev[indexToRemove].url);
      }
      return newPreviews;
    });
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((file) => {
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

  const validateForm = () => {
    if (!formData.aciklama.trim() && selectedImages.length === 0) {
      toast.error('En az açıklama veya resim eklemelisiniz');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let imageUrls = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      const faaliyetData = {
        baslik: formData.baslik.trim(),
        aciklama: formData.aciklama.trim(),
        gorseller: imageUrls
      };

      const response = await faaliyetService.createFaaliyet(faaliyetData);
      
      if (response.success) {
        toast.success('Faaliyet yönetici onayına gönderildi!');
        
        imagePreview.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
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
    <div className="min-h-screen text-white flex justify-center items-center py-4 px-4 sm:px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-gray-800 shadow-xl hover:shadow-2xl border border-gray-700 transition-all duration-200" 
          >
            <FiArrowLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FA2C37]">Faaliyet Paylaş</h1>
            <p className="text-gray-400 text-sm sm:text-base">Yaptığınız faaliyeti topluluğa paylaşın</p>
          </div>
        </div>
        
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
        />
      </div>
    </div>
  );
};

export default FaaliyetCreate;
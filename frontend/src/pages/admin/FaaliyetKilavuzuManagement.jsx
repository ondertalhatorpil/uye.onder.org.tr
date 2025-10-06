// src/pages/admin/FaaliyetKilavuzuManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { faaliyetKilavuzuService } from '../../services/faaliyetKilavuzuService';
import {
  FiPlus, FiEdit2, FiTrash2, FiCalendar, FiBook, FiActivity,
  FiSearch, FiRefreshCw, FiEye, FiX, FiSave, FiImage,
  FiChevronLeft, FiChevronRight, FiUsers, FiClock, FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FaaliyetKilavuzuManagement = () => {
  const { user } = useAuth();
  
  // States
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingFaaliyet, setEditingFaaliyet] = useState(null);
  const [deletingFaaliyet, setDeletingFaaliyet] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    tarih: '',
    etkinlik_adi: '',
    icerik: '',
    gorsel: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFaaliyetler();
  }, []);

  const loadFaaliyetler = async () => {
    try {
      setLoading(true);
      const response = await faaliyetKilavuzuService.getAll();
      
      if (response.success) {
        setFaaliyetler(response.data || []);
      } else {
        toast.error('Faaliyetler yüklenemedi');
      }
    } catch (error) {
      console.error('Faaliyetler yükleme hatası:', error);
      toast.error('Faaliyetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadFaaliyetler();
    toast.success('Faaliyetler güncellendi');
  };

  // Görsel yükleme
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Görsel boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece görsel dosyaları yüklenebilir');
        return;
      }

      setFormData(prev => ({ ...prev, gorsel: file }));
      
      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setRemoveImage(false);
    }
  };

  // Görseli kaldır
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, gorsel: null }));
    setImagePreview(null);
    setRemoveImage(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.tarih) {
      errors.tarih = 'Tarih gerekli';
    }
    
    if (!formData.etkinlik_adi || formData.etkinlik_adi.trim().length < 2) {
      errors.etkinlik_adi = 'Etkinlik adı en az 2 karakter olmalı';
    }
    
    // İçerik veya görsel en az birisi olmalı
    if (!formData.icerik && !formData.gorsel && !imagePreview) {
      errors.icerik = 'En az içerik veya görsel eklemelisiniz';
    }

    return errors;
  };

  // Create faaliyet
  const handleCreate = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setSubmitting(true);
      const response = await faaliyetKilavuzuService.create(formData);
      
      if (response.success) {
        toast.success('Faaliyet başarıyla oluşturuldu');
        setShowCreateModal(false);
        resetForm();
        loadFaaliyetler();
      } else {
        toast.error(response.error || 'Faaliyet oluşturulamadı');
      }
    } catch (error) {
      console.error('Faaliyet oluşturma hatası:', error);
      toast.error(error.error || 'Faaliyet oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Update faaliyet
  const handleUpdate = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setSubmitting(true);
      
      const updateData = {
        ...formData,
        remove_image: removeImage
      };
      
      const response = await faaliyetKilavuzuService.update(editingFaaliyet.id, updateData);
      
      if (response.success) {
        toast.success('Faaliyet başarıyla güncellendi');
        setShowEditModal(false);
        setEditingFaaliyet(null);
        resetForm();
        loadFaaliyetler();
      } else {
        toast.error(response.error || 'Faaliyet güncellenemedi');
      }
    } catch (error) {
      console.error('Faaliyet güncelleme hatası:', error);
      toast.error(error.error || 'Faaliyet güncellenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete faaliyet
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const response = await faaliyetKilavuzuService.delete(deletingFaaliyet.id);
      
      if (response.success) {
        toast.success('Faaliyet başarıyla silindi');
        setShowDeleteModal(false);
        setDeletingFaaliyet(null);
        loadFaaliyetler();
      } else {
        toast.error(response.error || 'Faaliyet silinemedi');
      }
    } catch (error) {
      console.error('Faaliyet silme hatası:', error);
      toast.error(error.error || 'Faaliyet silinirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tarih: '',
      etkinlik_adi: '',
      icerik: '',
      gorsel: null
    });
    setImagePreview(null);
    setRemoveImage(false);
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (faaliyet) => {
    setFormData({
      tarih: faaliyet.tarih,
      etkinlik_adi: faaliyet.etkinlik_adi,
      icerik: faaliyet.icerik || '',
      gorsel: null
    });
    
    // Mevcut görseli önizleme olarak ayarla
    if (faaliyet.gorsel_path) {
      setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${faaliyet.gorsel_path}`);
    } else {
      setImagePreview(null);
    }
    
    setRemoveImage(false);
    setFormErrors({});
    setEditingFaaliyet(faaliyet);
    setShowEditModal(true);
  };

  const openDeleteModal = (faaliyet) => {
    setDeletingFaaliyet(faaliyet);
    setShowDeleteModal(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Filter faaliyetler
  const filteredFaaliyetler = faaliyetler.filter(faaliyet => {
    const matchesSearch = !searchTerm || 
      faaliyet.etkinlik_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faaliyet.icerik && faaliyet.icerik.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMonth = !selectedMonth || 
      faaliyet.tarih.startsWith(selectedMonth);

    return matchesSearch && matchesMonth;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-400">Faaliyet kılavuzu yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FiBook className="h-8 w-8" />
                Faaliyet Kılavuzu Yönetimi
              </h1>
              <div className="flex items-center space-x-4 text-sm text-red-100">
                <span>Toplam {faaliyetler.length} faaliyet</span>
                <span>•</span>
                <span>{filteredFaaliyetler.length} gösteriliyor</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreateModal}
                className="flex items-center px-4 py-2 bg-white text-[#FA2C37] rounded-lg font-medium hover:bg-gray-100 transition-all"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Yeni Faaliyet
              </button>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </button>

              <Link
                to="/faaliyet-kilavuzu"
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all"
              >
                <FiEye className="mr-2 h-4 w-4" />
                Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Arama</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Etkinlik veya içerik ara..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                />
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ay Filtresi</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('');
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiX className="h-4 w-4" />
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Faaliyetler Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hafta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Etkinlik
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İçerik/Görsel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Oluşturan
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredFaaliyetler.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <FiBook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Faaliyet bulunamadı</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFaaliyetler.map((faaliyet) => (
                    <tr key={faaliyet.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-100">
                              {formatShortDate(faaliyet.tarih)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(faaliyet.tarih).toLocaleDateString('tr-TR', { weekday: 'short' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {faaliyet.hafta_no ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FA2C37]/20 text-[#FA2C37]">
                            {faaliyet.hafta_no}. Hafta
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiActivity className="h-4 w-4 text-[#FA2C37]" />
                          <span className="text-sm font-medium text-gray-100">
                            {faaliyet.etkinlik_adi}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {faaliyet.gorsel_path && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              <FiImage className="h-3 w-3 mr-1" />
                              Görsel
                            </span>
                          )}
                          {faaliyet.icerik && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                              <FiBook className="h-3 w-3 mr-1" />
                              Metin
                            </span>
                          )}
                          {!faaliyet.gorsel_path && !faaliyet.icerik && (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {faaliyet.created_by_name ? (
                          <div className="flex items-center gap-1">
                            <FiUsers className="h-3 w-3 text-gray-400" />
                            {faaliyet.created_by_name} {faaliyet.created_by_surname}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(faaliyet)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                            title="Düzenle"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(faaliyet)}
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            title="Sil"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-100">
                  {showCreateModal ? 'Yeni Faaliyet Oluştur' : 'Faaliyet Düzenle'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingFaaliyet(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Tarih */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    value={formData.tarih}
                    onChange={(e) => setFormData(prev => ({ ...prev, tarih: e.target.value }))}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent ${
                      formErrors.tarih ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {formErrors.tarih && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.tarih}</p>
                  )}
                </div>

                {/* Etkinlik Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Etkinlik Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.etkinlik_adi}
                    onChange={(e) => setFormData(prev => ({ ...prev, etkinlik_adi: e.target.value }))}
                    placeholder="Örn: Sohbet, Kitap, Spor..."
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent ${
                      formErrors.etkinlik_adi ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {formErrors.etkinlik_adi && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.etkinlik_adi}</p>
                  )}
                </div>

                {/* Görsel Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Görsel (Opsiyonel)
                  </label>
                  
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Önizleme" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-600"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                          title="Görseli Kaldır"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Tıklayın</span> veya sürükleyin
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Görsel yüklerseniz, bu görsel faaliyet içeriği olarak kullanılır
                  </p>
                </div>

                {/* İçerik */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İçerik (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.icerik}
                    onChange={(e) => setFormData(prev => ({ ...prev, icerik: e.target.value }))}
                    rows={5}
                    placeholder="Faaliyetin detaylı açıklaması... (Görsel yoksa zorunlu)"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent resize-none ${
                      formErrors.icerik ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {formErrors.icerik && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.icerik}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.icerik.length} karakter
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    <strong>Not:</strong> En az içerik veya görsel eklemelisiniz. Her ikisini de ekleyebilirsiniz.
                  </p>
                </div>

              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingFaaliyet(null);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave className="h-4 w-4" />
                  )}
                  {submitting ? 'Kaydediliyor...' : (showCreateModal ? 'Oluştur' : 'Güncelle')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && deletingFaaliyet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Faaliyeti Sil
              </h3>
              <p className="text-gray-300 mb-6">
                <strong className="text-[#FA2C37]">{deletingFaaliyet.etkinlik_adi}</strong> faaliyetini silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingFaaliyet(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FaaliyetKilavuzuManagement;
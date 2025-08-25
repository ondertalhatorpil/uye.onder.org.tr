import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
// React Icons'tan gerekli ikonlar içe aktarılıyor
import { 
  FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaBell,
  FaBullhorn, FaExclamationTriangle, FaInfoCircle, FaUsers, 
  FaUserFriends, FaSearch, FaTimes, FaCheck 
} from 'react-icons/fa';

const SendNotification = () => {
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
    tip: 'genel',
    hedef_kullanici_ids: null, // null = tüm kullanıcılar
    bitis_tarihi: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' veya 'specific'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Tüm kullanıcıları yükle
  const loadUsers = async () => {
    try {
      const response = await userService.searchUsers({ name: '', limit: 100 });
      if (response.success) {
        setAllUsers(response.data || []);
      }
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error);
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const notificationData = {
        ...formData,
        hedef_kullanici_ids: targetType === 'specific' ? selectedUsers.map(u => u.id) : null
      };

      const response = await notificationService.sendNotification(notificationData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          baslik: '',
          icerik: '',
          tip: 'genel',
          hedef_kullanici_ids: null,
          bitis_tarihi: ''
        });
        setTargetType('all');
        setSelectedUsers([]);
        
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      setError(error.error || 'Bildirim gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı seçme
  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.find(u => u.id === user.id);
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Filtrelenmiş kullanıcılar
  const filteredUsers = allUsers.filter(user =>
    user.isim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.soyisim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sayfa yüklendiğinde kullanıcıları yükle
  useEffect(() => {
    loadUsers();
  }, []);

  // Bildirim tiplerini tanımla
  const notificationTypes = {
    'genel': { icon: FaBell, color: 'indigo', label: 'Genel' },
    'duyuru': { icon: FaBullhorn, color: 'green', label: 'Duyuru' },
    'uyari': { icon: FaExclamationTriangle, color: 'orange', label: 'Uyarı' },
    'bilgi': { icon: FaInfoCircle, color: 'cyan', label: 'Bilgi' }
  };

  const getTypeConfig = (tip) => {
    return notificationTypes[tip] || notificationTypes['genel'];
  };
  
  const IconComponent = getTypeConfig(formData.tip).icon;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-700/50 rounded-lg flex items-center justify-center">
              <FaPaperPlane className="text-red-400 text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-100">Bildirim Gönder</h1>
          </div>
          <p className="text-gray-400">
            Kullanıcılara bildirim gönderin. Tüm kullanıcılara veya belirli kişilere gönderilebilir.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-800/50 border border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span className="text-green-200 font-medium">Bildirim başarıyla gönderildi!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-800/50 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <FaExclamationCircle className="text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Bildirim Detayları */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Bildirim Detayları</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Başlık */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.baslik}
                  onChange={(e) => setFormData({...formData, baslik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Bildirim başlığını girin"
                  required
                  maxLength={255}
                />
              </div>

              {/* Tip */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bildirim Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(notificationTypes).map(([key, config]) => {
                    const TypeIcon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({...formData, tip: key})}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                          formData.tip === key
                            ? `border-red-700 bg-red-700/30 text-red-300`
                            : 'border-gray-700 bg-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <TypeIcon className="inline mr-2" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bitiş Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bitiş Tarihi (Opsiyonel)
                </label>
                <input
                  type="datetime-local"
                  value={formData.bitis_tarihi}
                  onChange={(e) => setFormData({...formData, bitis_tarihi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Belirtilmezse bildirim süresiz olarak görüntülenir
                </p>
              </div>
            </div>

            {/* İçerik */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                İçerik <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.icerik}
                onChange={(e) => setFormData({...formData, icerik: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors duration-200"
                placeholder="Bildirim içeriğini detaylı olarak yazın..."
                required
                maxLength={1000}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {formData.icerik.length}/1000 karakter
              </div>
            </div>
          </div>

          {/* Hedef Kullanıcılar */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Hedef Kullanıcılar</h2>
            
            <div className="space-y-4">
              {/* Hedef Tip Seçimi */}
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors duration-200 min-w-40 ${
                    targetType === 'all'
                      ? 'border-red-700 bg-red-700/30 text-red-200'
                      : 'border-gray-700 bg-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-xl" />
                    <div>
                      <h3 className="font-medium">Tüm Kullanıcılar</h3>
                      <p className="text-sm opacity-75">Sisteme kayıtlı tüm kullanıcılara gönder</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('specific')}
                  className={`flex-1 p-4 rounded-lg border-2 text-left transition-colors duration-200 min-w-40 ${
                    targetType === 'specific'
                      ? 'border-red-700 bg-red-700/30 text-red-200'
                      : 'border-gray-700 bg-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaUserFriends className="text-xl" />
                    <div>
                      <h3 className="font-medium">Belirli Kullanıcılar</h3>
                      <p className="text-sm opacity-75">Seçtiğiniz kullanıcılara gönder</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Kullanıcı Seçimi */}
              {targetType === 'specific' && (
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-200">
                      Kullanıcı Seçin ({selectedUsers.length} seçili)
                    </h4>
                    
                    {selectedUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedUsers([])}
                        className="text-red-400 hover:text-red-500 text-sm font-medium"
                      >
                        Tümünü Kaldır
                      </button>
                    )}
                  </div>

                  {/* Arama */}
                  <div className="mb-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Kullanıcı ara..."
                      />
                    </div>
                  </div>

                  {/* Seçili Kullanıcılar */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Seçili Kullanıcılar:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                          <span
                            key={user.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-700/50 text-indigo-200 rounded-full text-sm"
                          >
                            {user.isim} {user.soyisim}
                            <button
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="ml-1 text-indigo-400 hover:text-indigo-200"
                            >
                              <FaTimes />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Kullanıcı Listesi */}
                  <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg bg-gray-800">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Kullanıcı bulunamadı
                      </div>
                    ) : (
                      filteredUsers.map(user => {
                        const isSelected = selectedUsers.find(u => u.id === user.id);
                        return (
                          <div
                            key={user.id}
                            className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                              isSelected ? 'bg-indigo-700/30' : ''
                            }`}
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="font-medium text-gray-200">
                                  {user.isim} {user.soyisim}
                                </h6>
                                <p className="text-sm text-gray-400">{user.email}</p>
                                {user.gonullu_dernek && (
                                  <p className="text-xs text-gray-500">{user.gonullu_dernek}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                {isSelected && (
                                  <FaCheck className="text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Önizleme */}
          {formData.baslik && formData.icerik && (
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Önizleme</h2>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-${getTypeConfig(formData.tip).color}-700/30 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`text-${getTypeConfig(formData.tip).color}-400 text-sm`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-100">{formData.baslik}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getTypeConfig(formData.tip).color}-700/30 text-${getTypeConfig(formData.tip).color}-300`}>
                        {getTypeConfig(formData.tip).label}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.icerik}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Hedef: {targetType === 'all' ? 'Tüm kullanıcılar' : `${selectedUsers.length} seçili kullanıcı`}
                      {formData.bitis_tarihi && (
                        <span className="ml-3">
                          Bitiş: {new Date(formData.bitis_tarihi).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  baslik: '',
                  icerik: '',
                  tip: 'genel',
                  hedef_kullanici_ids: null,
                  bitis_tarihi: ''
                });
                setTargetType('all');
                setSelectedUsers([]);
              }}
              className="px-6 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
            >
              Temizle
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.baslik || !formData.icerik}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? 'Gönderiliyor...' : 'Bildirim Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;
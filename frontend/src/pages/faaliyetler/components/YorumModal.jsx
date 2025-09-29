import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { faaliyetService, UPLOADS_BASE_URL } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

// Profil Avatar Bileşeni
const ProfileAvatar = ({ user, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Avatar URL'ini oluştur
  const getAvatarUrl = () => {
    if (!user?.profil_fotografi) {
      // Varsayılan avatar
      return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`;
    }

    const foto = user.profil_fotografi;

    // Tam URL ise direkt kullan
    if (foto.startsWith('http')) {
      return foto;
    }

    // 'uploads/' ile başlıyorsa direkt ekle
    if (foto.startsWith('uploads/')) {
      return `${UPLOADS_BASE_URL}/${foto}`;
    }

    // Sadece dosya adı ise tam path oluştur
    return `${UPLOADS_BASE_URL}/uploads/profile-images/${foto}`;
  };

  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 border-2 border-red-700/30`}>
      {user?.profil_fotografi && !imageError ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`${textSizeClasses[size]} font-bold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

// Yorum Item Bileşeni
const YorumItem = ({ yorum, onDelete, currentUserId, isAdmin }) => {
  const [deleting, setDeleting] = useState(false);

  const canDelete = currentUserId === yorum.user_id || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await faaliyetService.deleteYorum(yorum.id);
      
      if (response.success) {
        toast.success('Yorum silindi');
        onDelete(yorum.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Yorum silinemedi');
    } finally {
      setDeleting(false);
    }
  };

  // Zaman farkını hesapla
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g`;

    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="group flex space-x-3 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200 border border-gray-800/30">
      <ProfileAvatar 
        user={{
          isim: yorum.isim,
          soyisim: yorum.soyisim,
          profil_fotografi: yorum.profil_fotografi
        }} 
        size="md" 
      />
      
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col space-y-0.5">
            <span className="font-bold text-white text-sm">
              {yorum.isim} {yorum.soyisim}
            </span>
            {yorum.gonullu_dernek && (
              <span className="text-xs text-gray-500">
                {yorum.gonullu_dernek}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(yorum.created_at)}
            </span>
            
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-500/10"
                title="Yorumu sil"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                ) : (
                  <FiTrash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Yorum içeriği */}
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {yorum.yorum}
        </p>
      </div>
    </div>
  );
};

// Ana Yorum Modal
const YorumModal = ({ faaliyet, isOpen, onClose, onCommentAdded }) => {
  const { user } = useAuth();
  const [yorumlar, setYorumlar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [yeniYorum, setYeniYorum] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const yorumInputRef = useRef(null);

  // Modal açıldığında yorumları yükle
  useEffect(() => {
    if (isOpen) {
      setYorumlar([]);
      setPage(1);
      loadYorumlar(1);
      setTimeout(() => yorumInputRef.current?.focus(), 100);
    }
  }, [isOpen, faaliyet.id]);

  // Yorumları yükle
  const loadYorumlar = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await faaliyetService.getYorumlar(faaliyet.id, pageNum, 20);
      
      if (response.success) {
        if (pageNum === 1) {
          setYorumlar(response.data);
        } else {
          setYorumlar(prev => [...prev, ...response.data]);
        }
        setHasMore(response.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Yorum gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!yeniYorum.trim()) {
      toast.error('Yorum boş olamaz');
      return;
    }

    if (yeniYorum.length > 1000) {
      toast.error('Yorum çok uzun (maksimum 1000 karakter)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await faaliyetService.createYorum(faaliyet.id, yeniYorum.trim());
      
      if (response.success) {
        toast.success('Yorum eklendi');
        setYorumlar(prev => [response.data, ...prev]);
        setYeniYorum('');
        onCommentAdded && onCommentAdded();
      }
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
      toast.error(error.response?.data?.error || 'Yorum eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  // Yorum sil callback
  const handleDeleteYorum = (yorumId) => {
    setYorumlar(prev => prev.filter(y => y.id !== yorumId));
    onCommentAdded && onCommentAdded();
  };

  // Daha fazla yükle
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadYorumlar(page + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div 
          className="relative bg-gray-900 w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh] border border-gray-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sm:rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-[#FA2C37] rounded-full"></div>
              <h2 className="text-xl font-bold text-white">Yorumlar</h2>
              {yorumlar.length > 0 && (
                <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
                  {yorumlar.length}
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Yorumlar Listesi */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {loading && yorumlar.length === 0 ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-700 border-t-[#FA2C37] mb-4"></div>
                <p className="text-sm font-medium">Yorumlar yükleniyor...</p>
              </div>
            ) : yorumlar.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FiAlertCircle className="h-16 w-16 text-gray-700 mb-4" />
                <p className="text-lg font-semibold text-gray-400">Henüz yorum yok</p>
                <p className="text-sm mt-2 text-gray-600">İlk yorumu siz yapın!</p>
              </div>
            ) : (
              // Yorumlar
              <>
                {yorumlar.map((yorum) => (
                  <YorumItem
                    key={yorum.id}
                    yorum={yorum}
                    onDelete={handleDeleteYorum}
                    currentUserId={user?.id}
                    isAdmin={user?.role === 'super_admin'}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-2.5 bg-gray-800 hover:bg-gray-750 text-[#FA2C37] rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-200 border border-gray-700 hover:border-[#FA2C37]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FA2C37] border-t-transparent mr-2"></div>
                          Yükleniyor...
                        </>
                      ) : (
                        'Daha fazla göster'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Yorum Ekleme Formu */}
          <div className="border-t border-gray-800 p-4 bg-gray-900/95 backdrop-blur-sm sm:rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex items-start space-x-3">
              <div className="pt-1">
                <ProfileAvatar user={user} size="sm" />
              </div>
              
              <div className="flex-1">
                <textarea
                  ref={yorumInputRef}
                  value={yeniYorum}
                  onChange={(e) => setYeniYorum(e.target.value)}
                  placeholder="Düşüncelerinizi paylaşın..."
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FA2C37] resize-none transition-all duration-200 placeholder-gray-500 border border-gray-700 focus:border-[#FA2C37]"
                  rows="2"
                  maxLength={1000}
                  disabled={submitting}
                />
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs ${yeniYorum.length > 900 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {yeniYorum.length}/1000
                  </span>
                  
                  <button
                    type="submit"
                    disabled={submitting || !yeniYorum.trim()}
                    className="inline-flex items-center px-6 py-2.5 bg-[#FA2C37] text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2 h-4 w-4" />
                        Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YorumModal;
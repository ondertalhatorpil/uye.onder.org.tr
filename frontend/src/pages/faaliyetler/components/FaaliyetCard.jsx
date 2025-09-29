import React, { useState, useEffect } from 'react';
import {
  FiMoreHorizontal, FiChevronLeft, FiChevronRight,
  FiHeart, FiMessageCircle, FiShare2
} from 'react-icons/fi';
import { UPLOADS_BASE_URL, faaliyetService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import YorumModal from './YorumModal'; 

// --- Yardımcı Fonksiyonlar (Aynı Kalabilir) ---
const getImageUrl = (imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  return `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageName}`;
};

// --- ProfileAvatar Bileşeni (Kırmızı Tema) ---
const ProfileAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const getAvatarUrl = () => {
    if (user?.profil_fotografi) {
      if (user.profil_fotografi.startsWith('http')) {
        return user.profil_fotografi;
      }
      if (user.profil_fotografi.startsWith('uploads/')) {
        return `${UPLOADS_BASE_URL}/${user.profil_fotografi}`;
      }
      return `${UPLOADS_BASE_URL}/uploads/profile-images/${user.profil_fotografi}`;
    }
    return `https://ui-avatars.com/api/?name=${user?.isim || 'U'}+${user?.soyisim || ''}&background=dc2626&color=fff&size=128&rounded=true`; 
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 border-2 border-gray-700/50`}>
      {user?.profil_fotografi ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            const span = document.createElement('span');
            span.className = `${textSizeClasses[size]} font-extrabold text-white`;
            span.textContent = user?.isim?.charAt(0)?.toUpperCase() || 'U';
            e.target.parentNode.appendChild(span);
          }}
        />
      ) : (
        <span className={`${textSizeClasses[size]} font-extrabold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

// --- Instagram Style Image Carousel (Aynı Kalabilir) ---
const InstagramImageCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => setCurrentIndex(index);

  return (
    <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-700/50">
      <div className="relative w-full bg-gray-900" style={{ aspectRatio: '16/9' }}>
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`Görsel ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-opacity duration-300"
          onClick={() => onImageClick && onImageClick(getImageUrl(images[currentIndex]))}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x450/1f2937/9ca3af?text=Görsel+Yüklenemedi'; 
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm z-10 hidden sm:block shadow-md"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm z-10 hidden sm:block shadow-md"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-3 right-3 flex space-x-1.5 z-10 p-1 bg-black/30 rounded-full">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Ana Twitter Style Faaliyet Kartı ---
const TwitterFaaliyetCard = ({ faaliyet }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showYorumModal, setShowYorumModal] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // Etkileşim yükleme (Aynı Kaldı)
  useEffect(() => {
    const loadInteractions = async () => {
        try {
            const response = await faaliyetService.getFaaliyetInteractions(faaliyet.id);
            if (response.success) {
                setLikeCount(response.data.begeni_sayisi);
                setCommentCount(response.data.yorum_sayisi);
                setIsLiked(response.data.user_begendi);
            }
        } catch (error) {
            console.error('Etkileşimler yüklenemedi:', error);
        }
    };
    loadInteractions();
  }, [faaliyet.id]);

  // Beğeni toggle (Aynı Kaldı)
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Beğenmek için giriş yapmalısınız');
      return;
    }

    if (isLoadingLike) return;

    try {
      setIsLoadingLike(true);
      
      const newIsLiked = !isLiked;
      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      const response = await faaliyetService.toggleBegeni(faaliyet.id);
      
      if (response.success) {
        setLikeCount(response.begeni_sayisi);
        setIsLiked(response.action === 'added');
      }
    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast.error('Beğeni işlemi başarısız');
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Yorum modalını aç (Aynı Kaldı)
  const handleComment = () => {
    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız');
      return;
    }
    setShowYorumModal(true);
  };

  // Paylaş (Aynı Kaldı)
  const handleShare = () => {
    const url = `${window.location.origin}/faaliyetler/${faaliyet.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${faaliyet.isim} ${faaliyet.soyisim} - Faaliyet`,
        text: faaliyet.aciklama || '',
        url: url
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link kopyalandı!');
    }
  };

  // Tarih formatla (Aynı Kaldı)
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

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <article className="bg-gray-900 border-b border-gray-800 ">
        <div className="flex p-3 sm:p-4">
          {/* Avatar */}
          <div className="flex-shrink-0 mr-3">
            <ProfileAvatar 
              user={{
                isim: faaliyet.isim,
                soyisim: faaliyet.soyisim,
                profil_fotografi: faaliyet.profil_fotografi
              }} 
              size="md" 
            />
          </div>

          {/* İçerik Alanı */}
          <div className="flex-1 min-w-0">
            {/* Header: İsim, Zaman ve Menü */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center min-w-0 pr-4">
                {/* İsim Alanı: flex-shrink-0 ve max-w-[140px] sınıfları ile taşmayı engelledik */}
                <h3 className="font-bold text-white text-base sm:text-lg hover:underline cursor-pointer truncate max-w-[140px] sm:max-w-[200px] flex-shrink-0">
                  {faaliyet.isim} {faaliyet.soyisim}
                </h3>
                
                <span className="text-gray-500 text-sm sm:text-base mx-2 flex-shrink-0">·</span>
                <span className="text-gray-500 text-sm sm:text-base hover:underline cursor-pointer flex-shrink-0">
                  {formatTimeAgo(faaliyet.created_at)}
                </span>
              </div>
              
              {/* Daha Fazla Butonu */}
              <div className="ml-auto flex-shrink-0">
                <button className="p-2 -mr-1 rounded-full hover:bg-gray-700/50 text-gray-500 hover:text-white transition-colors">
                  <FiMoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" /> 
                </button>
              </div>
            </div>

            {/* BAŞLIK */}
            {faaliyet.baslik && (
              <div className="mb-2">
                <h2 className="text-white text-base sm:text-lg font-bold leading-5 sm:leading-6">
                  {faaliyet.baslik}
                </h2>
              </div>
            )}
            
            {/* ETİKET 1: Şehir Hashtag (Açıklamanın Üzerinde) */}
            {faaliyet.il && (
              <div className="mb-2">
                <span className="text-red-500 text-sm font-medium transition-colors hover:text-red-400">
                  # {faaliyet.il?.replace(/\s+/g, '')}{faaliyet.ilce && faaliyet.ilce.replace(/\s+/g, '')}
                </span>
              </div>
            )}
            
            {/* AÇIKLAMA (Görselin Üzerinde) */}
            {faaliyet.aciklama && (
              <div className="mb-3">
                <p className="text-gray-200 text-sm sm:text-[15px] leading-snug whitespace-pre-wrap">
                  {faaliyet.aciklama}
                </p>
              </div>
            )}
            
            {/* ETİKET 2: Dernek (Açıklamanın Altında) */}
            {faaliyet.gonullu_dernek && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-red-600/20 text-red-400 rounded-full transition-colors hover:bg-red-600/30">
                  <span className="mr-1">🤝</span>
                  <span className="truncate max-w-[150px] sm:max-w-[250px]">{faaliyet.gonullu_dernek}</span>
                </span>
              </div>
            )}

            {/* GÖRSELLER */}
            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
              <div className="mb-3">
                <InstagramImageCarousel images={faaliyet.gorseller} />
              </div>
            )}
            
            {/* Etkileşim Butonları (SOLA HİZALI, YAN YANA) */}
            <div className="flex items-center space-x-6 pt-2 mt-2">
              
              {/* Yorum butonu */}
              <button
                onClick={handleComment}
                aria-label="Yorum yap"
                className="flex items-center space-x-1.5 text-gray-500 hover:text-red-500 transition-colors group text-sm"
              >
                <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <FiMessageCircle className="h-5 w-5" />
                </div>
                <span className="font-medium min-w-[1rem] text-left">{commentCount > 0 ? commentCount : ''}</span>
              </button>

              {/* Beğeni butonu */}
              <button
                onClick={handleLike}
                disabled={isLoadingLike}
                aria-label="Beğen"
                className={`flex items-center space-x-1.5 transition-colors group text-sm ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${
                  isLiked 
                    ? 'bg-red-500/10' 
                    : 'group-hover:bg-red-500/10'
                } ${isLoadingLike ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <FiHeart 
                    className={`h-5 w-5 transition-transform duration-200 ${isLiked ? 'fill-red-500 scale-105' : 'group-hover:scale-105'}`} 
                  />
                </div>
                <span className="font-medium min-w-[1rem] text-left">{likeCount > 0 ? likeCount : ''}</span>
              </button>

              {/* Paylaş butonu */}
              <button
                onClick={handleShare}
                aria-label="Paylaş"
                className="flex items-center space-x-1.5 text-gray-500 hover:text-red-500 transition-colors group text-sm"
              >
                <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <FiShare2 className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Yorum Modal */}
      {showYorumModal && (
        <YorumModal
          faaliyet={faaliyet}
          isOpen={showYorumModal}
          onClose={() => setShowYorumModal(false)}
          onCommentAdded={() => {
            setCommentCount(prev => prev + 1);
          }}
        />
      )}
    </>
  );
};

export default TwitterFaaliyetCard;
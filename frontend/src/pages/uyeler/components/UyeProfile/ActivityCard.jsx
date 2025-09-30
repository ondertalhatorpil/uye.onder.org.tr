import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { UPLOADS_BASE_URL, faaliyetService } from '../../../../services';
import { useAuth } from '../../../../context/AuthContext';
import YorumModal from '../../../faaliyetler/components/YorumModal';


// Görsel URL Oluşturucu (Kompakt)
const getImageUrl = (imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  if (imageName.startsWith('uploads/')) return `${UPLOADS_BASE_URL}/${imageName}`;
  return `${UPLOADS_BASE_URL}/uploads/faaliyet-images/${imageName}`;
};

// Profil Avatarı (Kırmızı/Gri Tema)
const ProfileAvatar = ({ user, size = 'md' }) => {
  const sizeMap = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-lg',
    lg: 'h-12 w-12 sm:h-14 sm:w-14 sm:text-xl',
  };

  const { h, w, t } = sizeMap[size].split(' ').reduce((acc, curr) => {
    if (curr.startsWith('h-')) acc.h = curr;
    else if (curr.startsWith('w-')) acc.w = curr;
    else if (curr.startsWith('text-')) acc.t = curr;
    return acc;
  }, { h: '', w: '', t: '' });
  
  const [imageError, setImageError] = useState(false);

  const avatarUrl = useMemo(() => {
    const nameInitial = (user?.isim?.charAt(0) || 'U') + (user?.soyisim?.charAt(0) || '');
    return `https://ui-avatars.com/api/?name=${nameInitial}&background=DC2626&color=ffffff&size=128&rounded=true`;
  }, [user]);

  return (
    <div className={`${h} ${w} rounded-full overflow-hidden bg-red-700 flex items-center justify-center flex-shrink-0 border-2 border-red-900/50`}>
      {user?.profil_fotografi && !imageError ? (
        <img
          src={getImageUrl(user.profil_fotografi)}
          alt={`${user?.isim} ${user?.soyisim}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`${t} font-semibold text-white`}>
          {user?.isim?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

// SVG İkonları (Kompakt)
const Icons = {
  More: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
  Heart: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Comment: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
  Share: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  User: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  ChevronLeft: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ChevronRight: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

// Görsel Carousel (Minimalist)
const ImageCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = useCallback(() => setCurrentIndex((prev) => (prev + 1) % images.length), [images.length]);
  const prevImage = useCallback(() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);
  const goToImage = useCallback((index) => setCurrentIndex(index), []);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700 bg-gray-900 shadow-md">
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}> 
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`Görsel ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-opacity duration-300"
          onClick={() => onImageClick && onImageClick(getImageUrl(images[currentIndex]))}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%231F2937" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EG%C3%B6rsel Yok%3C/text%3E%3C/svg%3E';
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all duration-300 z-10 hidden sm:block"
            >
              <Icons.ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all duration-300 z-10 hidden sm:block"
            >
              <Icons.ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-10 p-1 bg-black/30 rounded-full">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
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

// --- Ana Activity Card Bileşeni ---
const ActivityCard = ({ faaliyet, formatTimeAgo }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showYorumModal, setShowYorumModal] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // Veri çekme (Sadeleştirildi)
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

  // Beğeni/Beğeni Kaldırma İşlemi (Optimistic Update)
  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Giriş yapmalısınız.');
      return;
    }
    if (isLoadingLike) return;

    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLoadingLike(true);
    
    try {
      const response = await faaliyetService.toggleBegeni(faaliyet.id);
      if (response.success) {
        setLikeCount(response.begeni_sayisi);
        setIsLiked(response.action === 'added');
      } else {
        setIsLiked(prev => !prev);
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        toast.error('Beğeni işlemi başarısız.');
      }
    } catch (error) {
      setIsLiked(prev => !prev);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast.error('Sunucu hatası.');
    } finally {
      setIsLoadingLike(false);
    }
  }, [faaliyet.id, isAuthenticated, isLiked, isLoadingLike]);

  // Yorum ve Paylaşım işlemleri (Sadeleştirildi)
  const handleComment = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız.');
      return;
    }
    setShowYorumModal(true);
  }, [isAuthenticated]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/faaliyetler/${faaliyet.id}`;
    const shareData = {
      title: `${faaliyet.isim} ${faaliyet.soyisim} - Faaliyet`,
      text: faaliyet.aciklama || 'Bu faaliyete göz atın!',
      url: url
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        if (err.name !== 'AbortError') console.log('Share error:', err);
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Bağlantı kopyalandı!');
      }).catch(err => {
        console.error('Kopyalama hatası:', err);
        toast.error('Bağlantı kopyalanamadı.');
      });
    }
  }, [faaliyet.id, faaliyet.isim, faaliyet.soyisim, faaliyet.aciklama]);

  return (
    <>
      <article className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 hover:border-red-600/70 transition-all duration-300 p-4 mb-5 sm:mb-7">
      <div className="flex flex-col">
        {/* Kullanıcı Başlık Alanı */}
        <div className="flex items-start mb-3">
          {/* Avatar - Daha belirgin */}
          <ProfileAvatar 
            user={{
              isim: faaliyet.isim,
              soyisim: faaliyet.soyisim,
              profil_fotografi: faaliyet.profil_fotografi
            }} 
            size="md"
          />

          <div className="flex-1 min-w-0 ml-3">
            <div className="flex justify-between items-center h-full">
              <div className="min-w-0 pr-2 flex flex-col justify-center">
                <p className="font-bold text-white text-sm sm:text-base hover:text-red-500 transition truncate">
                  {faaliyet.isim} {faaliyet.soyisim}
                </p>
                
                <span className="text-gray-400 text-xs sm:text-sm">
                  {formatTimeAgo(faaliyet.created_at)}
                </span>
              </div>
              
              <button 
                className="p-1.5 -mr-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
                aria-label="Diğer seçenekler"
              >
                <Icons.More className="h-5 w-5" /> 
              </button>
            </div>
          </div>
        </div>
        
        <div className="min-w-0">
          
          {faaliyet.baslik && (
            <h2 className="text-white text-lg sm:text-xl font-extrabold mb-3 leading-snug">
              {faaliyet.baslik}
            </h2>
          )}
                      
          {faaliyet.aciklama && (
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap mb-4">
              {faaliyet.aciklama}
            </p>
          )}

            {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
              <ImageCarousel images={faaliyet.gorseller} />
            </div>
          )}

          {/* Etkileşim Butonları - Daha belirgin, ikonlar büyütüldü */}
          <div className="flex items-center space-x-6 border-t border-gray-700 pt-3">
            {/* Beğeni Butonu - Yorumdan önce gelmesi sosyal medyada daha yaygındır */}
            <button
              onClick={handleLike}
              disabled={isLoadingLike}
              className={`flex items-center space-x-1.5 transition-colors group text-sm font-semibold ${
                isLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-red-500'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <Icons.Heart 
                className={`h-5 w-5 ${isLiked ? 'fill-red-500' : 'group-hover:fill-red-500'}`} 
              />
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>
              
            {/* Yorum Butonu */}
            <button
              onClick={handleComment}
              className="flex items-center space-x-1.5 text-gray-400 hover:text-blue-400 transition-colors group text-sm font-semibold"
            >
              <Icons.Comment className="h-5 w-5" />
              <span>{commentCount > 0 ? commentCount : ''}</span>
            </button>

            {/* Paylaş Butonu - Daha az kullanılanlar sona */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 text-gray-400 hover:text-green-400 transition-colors group text-sm font-semibold"
            >
              <Icons.Share className="h-5 w-5" />
              {/* Küçük ekranlarda sadece ikon, büyüklerde metin */}
              <span className="hidden sm:inline">Paylaş</span>
            </button>
          </div>
        </div>
      </div>
    </article> 

      {showYorumModal && (
        <YorumModal
          faaliyet={faaliyet}
          isOpen={showYorumModal}
          onClose={() => setShowYorumModal(false)}
          onCommentAdded={() => setCommentCount(prev => prev + 1)}
        />
      )}
    </>
  );
};

export default ActivityCard;
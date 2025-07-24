import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiActivity, FiCalendar, FiArrowRight, FiClock, FiEye, FiTrendingUp, FiAward
} from 'react-icons/fi';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const StatCard = ({ icon: Icon, title, value, subtitle, color = "red" }) => {
  const colorClasses = {
    red: { bg: 'bg-red-800', iconBg: 'bg-red-700', iconText: 'text-red-200', text: 'text-red-300', border: 'border-red-700' }, // Koyu temaya uygun renkler
    blue: { bg: 'bg-blue-800', iconBg: 'bg-blue-700', iconText: 'text-blue-200', text: 'text-blue-300', border: 'border-blue-700' },
    green: { bg: 'bg-green-800', iconBg: 'bg-green-700', iconText: 'text-green-200', text: 'text-green-300', border: 'border-green-700' },
  };
  const classes = colorClasses[color] || colorClasses.red;

  return (
    <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${classes.border} ${classes.bg} shadow-md hover:shadow-lg transition-all duration-300 group`}> {/* Koyu tema arka planı, yuvarlatma, padding, kenarlık, gölge */}
      <div className="flex items-start justify-between"> {/* items-start olarak değiştirildi */}
        <div>
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${classes.iconBg} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200`}> {/* Boyut, yuvarlatma, arka plan */}
            <Icon className={`h-5 w-5 sm:h-6 w-6 ${classes.iconText}`} /> {/* İkon boyutu ve rengi */}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</div> {/* Metin rengi ve boyutu */}
          <div className="text-sm font-medium text-gray-300">{title}</div> {/* Metin rengi ve boyutu */}
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>} {/* Metin rengi */}
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ faaliyet }) => (
  <Link to={`/faaliyetler/${faaliyet.id}`} className="group cursor-pointer block"> {/* Link olarak değiştirildi, block eklendi */}
    <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-xl hover:bg-gray-700 transition-all duration-200"> {/* Responsive padding, hover arka plan */}
      <div className="h-9 w-9 sm:h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0"> {/* Boyut, yuvarlatma, renk */}
        <FiActivity className="h-4 w-4 sm:h-5 w-5 text-white" /> {/* İkon boyutu */}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm sm:text-base group-hover:text-red-400 transition-colors line-clamp-2"> {/* Metin rengi, boyutu, hover rengi */}
          {faaliyet.baslik || 'Başlıksız Faaliyet'}
        </h4>
        <div className="flex flex-wrap items-center mt-1.5 space-x-2 text-xs text-gray-400"> {/* Responsive boşluk, metin rengi */}
          <div className="flex items-center">
            <FiClock className="h-3 w-3 mr-1" />
            {new Date(faaliyet.created_at).toLocaleDateString('tr-TR')}
          </div>
          {faaliyet.views && (
            <div className="flex items-center">
              <FiEye className="h-3 w-3 mr-1" />
              {faaliyet.views}
            </div>
          )}
        </div>
      </div>
      <FiArrowRight className="h-4 w-4 text-gray-500 group-hover:text-red-400 transition-colors flex-shrink-0" /> {/* İkon rengi ve hover rengi */}
    </div>
  </Link>
);

const ProfileSidebar = ({ user, myFaaliyetler, loadingFaaliyetler }) => {
  // İstatistikler için hesaplamalar
  const membershipDays = user.created_at ? 
    Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0;
  
  const memberSince = user.created_at ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: tr }) : 'Bilinmiyor';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8"> {/* Responsive grid: Mobil 1, md 2, lg 1 kolon */}
      {/* İstatistikler */}
      <div className="space-y-4 sm:space-y-6"> {/* Mobil boşluk */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Genel İstatistikler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"> {/* İstatistik kartları için responsive grid */}
          <StatCard
            icon={FiActivity}
            title="Toplam Faaliyet"
            value={myFaaliyetler.length}
            subtitle="Paylaştığınız faaliyetler"
            color="red"
          />
          
          <StatCard
            icon={FiCalendar}
            title="Üyelik Süresi"
            value={membershipDays}
            subtitle={membershipDays > 0 ? "gün" : "Yeni üye"}
            color="blue"
          />
          {/* Ek istatistik kartı: Katılım Yılı */}
          <StatCard
            icon={FiAward} // Ödül veya yıl ikonu
            title="Katılım Yılı"
            value={user.created_at ? format(new Date(user.created_at), 'yyyy', { locale: tr }) : 'N/A'}
            subtitle="Üyelik başlangıcı"
            color="green"
          />
        </div>
      </div>

      {/* Son Faaliyetler */}
      <div className="bg-gray-800 rounded-xl sm:rounded-3xl shadow-lg border border-gray-700 overflow-hidden"> {/* Koyu tema arka planı */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700"> {/* Responsive padding, kenarlık rengi */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center"> {/* Metin rengi ve boyutu */}
              <div className="h-7 w-7 sm:h-8 w-8 rounded-lg bg-red-700 flex items-center justify-center mr-3"> {/* Koyu kırmızı arka plan */}
                <FiActivity className="h-4 w-4 text-white" /> {/* İkon rengi */}
              </div>
              Son Faaliyetlerim
            </h3>
            <Link
              to="/faaliyetler/my-posts"
              className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center group" // Metin rengi ve hover rengi
            >
              Tümü
              <FiArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto divide-y divide-gray-700"> {/* Responsive max-height, kaydırma, bölücü çizgi rengi */}
          {loadingFaaliyetler ? (
            <div className="flex items-center justify-center py-6 sm:py-12"> {/* Responsive padding */}
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-red-500 border-t-red-700 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-400 font-medium">Faaliyetler yükleniyor...</p> {/* Metin rengi */}
              </div>
            </div>
          ) : myFaaliyetler.length > 0 ? (
            <div> {/* divide-y artık burada */}
              {myFaaliyetler.slice(0, 5).map(faaliyet => ( // Sadece son 5 faaliyeti göster
                <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-12 px-4"> {/* Responsive padding */}
              <div className="h-14 w-14 sm:h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4"> {/* Boyut, arka plan */}
                <FiActivity className="h-7 w-7 sm:h-8 w-8 text-gray-400" /> {/* İkon boyutu */}
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Henüz faaliyet yok</h4> {/* Metin rengi ve boyutu */}
              <p className="text-sm text-gray-400 mb-4">İlk faaliyetinizi paylaşarak başlayın!</p> {/* Metin rengi */}
              <Link
                to="/faaliyetler/create"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Faaliyet Oluştur
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiActivity, FiCalendar, FiArrowRight, FiClock, FiEye, FiTrendingUp, FiAward
} from 'react-icons/fi';

const ProfileSidebar = ({ user, myFaaliyetler, loadingFaaliyetler }) => {
  // İstatistikler için hesaplamalar
  const membershipDays = user.created_at ? 
    Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "red" }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <div className={`h-12 w-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ faaliyet }) => (
    <div className="group cursor-pointer">
      <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
          <FiActivity className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2">
            {faaliyet.baslik || 'Başlıksız Faaliyet'}
          </h4>
          <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
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
        <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* İstatistikler */}
      <div className="lg:col-span-1">
        <div className="grid grid-cols-1 gap-4">
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
        </div>
      </div>

      {/* Son Faaliyetler */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                  <FiActivity className="h-4 w-4 text-red-600" />
                </div>
                Son Faaliyetlerim
              </h3>
              <Link
                to="/faaliyetler/my-posts"
                className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center group"
              >
                Tümü
                <FiArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loadingFaaliyetler ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-200 border-t-red-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500 font-medium">Faaliyetler yükleniyor...</p>
                </div>
              </div>
            ) : myFaaliyetler.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {myFaaliyetler.slice(0, 5).map(faaliyet => (
                  <ActivityCard key={faaliyet.id} faaliyet={faaliyet} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Henüz faaliyet yok</h4>
                <p className="text-sm text-gray-500 mb-4">İlk faaliyetinizi paylaşarak başlayın!</p>
                <Link
                  to="/faaliyetler/create"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Faaliyet Oluştur
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
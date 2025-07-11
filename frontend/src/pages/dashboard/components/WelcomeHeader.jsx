import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUser, FiMapPin, FiStar } from 'react-icons/fi';

const WelcomeHeader = ({ user, greeting, roleTitle }) => {
  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  const getRoleIcon = () => {
    if (roleTitle === 'Sistem Yöneticisi') return '👑';
    if (roleTitle === 'Dernek Yöneticisi') return '🛡️';
    return '👤';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Welcome Content */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <span className="text-2xl">{getEmoji()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {greeting}, {user?.isim}!
                </h1>
                <p className="text-red-100 text-lg">
                  {getRoleIcon()} {roleTitle} olarak sisteme hoş geldiniz
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-gray-600">
            <span>Hoş geldin! Bugün ne paylaşacaksın?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
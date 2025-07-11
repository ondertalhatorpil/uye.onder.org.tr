import React from 'react';
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi';

const ProfileHeader = ({ user, onBack, onContact, onMessage }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-6 pt-2 overflow-hidden">
    {/* Profile Content */}
    <div className="px-6 pb-6 relative">     
      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg ring-4 ring-white mb-4 sm:mb-0">
            <span className="text-2xl font-bold text-white">
              {user.isim?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          {/* User Info */}
          <div className="sm:ml-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user.isim} {user.soyisim}
            </h1>
            <p className="text-gray-600 mb-1">{user.meslek || 'Meslek belirtilmemiş'}</p>
            {user.gonullu_dernek && (
              <p className="text-sm text-red-600 font-medium">{user.gonullu_dernek}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <FiMapPin className="mr-1 h-4 w-4" />
              {user.il}{user.ilce && `, ${user.ilce}`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {user.telefon && (
            <button
              onClick={onContact}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 font-medium"
            >
              <FiPhone className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ara</span>
            </button>
          )}
          <button
            onClick={() => window.open(`mailto:${user.email}`)}
            className="w-full flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-200 font-medium"
          >
            <FiMail className="mr-3 h-5 w-5" />
            Email Gönder
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
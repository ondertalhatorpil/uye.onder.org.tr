import React from 'react';
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi';

const ProfileHeader = ({ user, onBack, onContact, onMessage }) => (
  <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-700 mt-4 sm:mt-6 pt-2 overflow-hidden"> {/* Arka plan, yuvarlatma, gölge, kenarlık, üst boşluk */}
    {/* Profile Content */}
    <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative">     
      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-end w-full sm:w-auto"> {/* w-full eklendi */}
          {/* Avatar */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg ring-4 ring-gray-800 mb-4 sm:mb-0 flex-shrink-0 mx-auto sm:mx-0"> {/* Boyut, yuvarlatma, renk, ring, merkezleme */}
            <span className="text-xl sm:text-2xl font-bold text-white">
              {user.isim?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          {/* User Info */}
          <div className="sm:ml-6 text-center sm:text-left mt-3 sm:mt-0"> {/* Merkezleme ve üst boşluk */}
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5"> {/* Font boyutu ve rengi */}
              {user.isim} {user.soyisim}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mb-0.5">{user.meslek || 'Meslek belirtilmemiş'}</p> {/* Font boyutu ve rengi */}
            {user.gonullu_dernek && (
              <p className="text-sm text-red-400 font-medium mb-0.5 sm:mb-1">{user.gonullu_dernek}</p> 
            )}
            <div className="flex items-center justify-center sm:justify-start mt-1 text-xs sm:text-sm text-gray-400"> {/* Merkezleme ve font boyutu */}
              <FiMapPin className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {/* İkon boyutu */}
              {user.il}{user.ilce && `, ${user.ilce}`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-5 sm:mt-0 w-full sm:w-auto"> {/* Mobil dikey, sm sonrası yatay, boşluk, tam genişlik */}
          {user.telefon && (
            <button
              onClick={onContact}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-700 text-green-200 rounded-xl hover:bg-green-600 transition-all duration-200 font-medium text-sm" 
            >
              <FiPhone className="mr-2 h-4 w-4" />
              <span className="">Ara</span> {/* sm:hidden kaldırıldı */}
            </button>
          )}
          <button
            onClick={() => window.open(`mailto:${user.email}`)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-700 hover:bg-blue-600 text-blue-200 rounded-xl transition-all duration-200 font-medium text-sm"
          >
            <FiMail className="mr-2 h-4 w-4" /> {/* İkon boyutu */}
            <span>Email Gönder</span> {/* sm:hidden kaldırıldı */}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
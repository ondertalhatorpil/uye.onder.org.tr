import React from 'react';
import { FiEdit3, FiSave, FiX, FiCamera } from 'react-icons/fi';

const ProfileHeader = ({ user, isEditing, loading, onEdit, onSave, onCancel }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Profile Info */}
      <div className="px-6 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="relative mb-4 sm:mb-0">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-bold text-white">
                    {user.isim?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <button className="absolute bottom-1 right-1 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <FiCamera className="h-3 w-3 text-gray-600" />
              </button>
            </div>
            
            <div className="sm:ml-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.isim} {user.soyisim}
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                {user.meslek || 'Meslek belirtilmemiş'}
              </p>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                <p className="text-sm text-red-600 font-medium">
                  {user.gonullu_dernek || 'Dernek belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-0 flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  İptal
                </button>
                <button
                  onClick={onSave}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FiEdit3 className="mr-2 h-4 w-4" />
                Profili Düzenle
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.created_at ? 
                  Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
                  : '0'
                }
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Günlük Üye</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.il || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Şehir</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.sektor ? user.sektor.substring(0, 10) + '...' : 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Sektör</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
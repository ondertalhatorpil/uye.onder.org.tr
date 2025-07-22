import React from 'react';
import { 
  FiClock, FiMoreHorizontal, FiHeart, FiMessageCircle, 
  FiShare2, FiEye 
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services';

const ActivityCard = ({ faaliyet, formatTimeAgo }) => (
  <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-200">
    {/* Activity Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center text-sm text-gray-500">
        <FiClock className="mr-2 h-4 w-4" />
        {formatTimeAgo(faaliyet.created_at)}
      </div>
      <button className="p-1 hover:bg-white rounded-lg transition-colors">
        <FiMoreHorizontal className="h-4 w-4 text-gray-400" />
      </button>
    </div>

    {/* Activity Content */}
    {faaliyet.baslik && (
      <h4 className="font-semibold text-gray-900 mb-3 text-lg">
        {faaliyet.baslik}
      </h4>
    )}
    
    {faaliyet.aciklama && (
      <p className="text-gray-700 mb-4 leading-relaxed">
        {faaliyet.aciklama}
      </p>
    )}

    {/* Activity Images */}
    {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
            <div key={index} className="relative group">
              <img
                src={`${UPLOADS_BASE_URL}/uploads/faaliyet-images/${gorsel}`}
                alt={`Faaliyet ${index + 1}`}
                className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
                }}
              />
              {index === 3 && faaliyet.gorseller.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{faaliyet.gorseller.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default ActivityCard;
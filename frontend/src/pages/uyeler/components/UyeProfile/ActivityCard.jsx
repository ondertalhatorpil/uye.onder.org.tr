import React from 'react';
import { 
  FiClock, FiMoreHorizontal, FiHeart, FiMessageCircle, 
  FiShare2, FiEye 
} from 'react-icons/fi';
import { UPLOADS_BASE_URL } from '../../../../services'; // Path'i kontrol edin

const ActivityCard = ({ faaliyet, formatTimeAgo }) => (
  <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-gray-700 transition-all duration-200 border border-gray-700"> {/* Arka plan, yuvarlatma, padding, hover, kenarlık */}
    {/* Activity Header */}
    <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Mobil boşluk */}
      <div className="flex items-center text-xs sm:text-sm text-gray-400"> {/* Font boyutu ve rengi */}
        <FiClock className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" /> {/* İkon boyutu ve rengi */}
        {formatTimeAgo(faaliyet.created_at)}
      </div>
      <button className="p-1 sm:p-1.5 hover:bg-gray-700 rounded-lg transition-colors"> {/* Padding, hover arka plan */}
        <FiMoreHorizontal className="h-4 w-4 text-gray-400" /> {/* İkon rengi */}
      </button>
    </div>

    {faaliyet.aciklama && (
      <p className="text-gray-300 mb-3 sm:mb-4 leading-normal text-sm sm:text-base"> 
        {faaliyet.aciklama}
      </p>
    )}

    {/* Activity Images */}
    {faaliyet.gorseller && faaliyet.gorseller.length > 0 && (
      <div className="mb-4 sm:mb-6"> {/* Mobil boşluk */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3"> {/* Mobil boşluk */}
          {faaliyet.gorseller.slice(0, 4).map((gorsel, index) => (
            <div 
              key={index} 
              className={`relative group overflow-hidden rounded-lg sm:rounded-xl ${ // Yuvarlatma
                faaliyet.gorseller.length === 1 ? 'col-span-2' : '' // Tek resim mobil için de 2 kolon kaplasın
              }`}
            >
              <img
                src={`${UPLOADS_BASE_URL}api/uploads/faaliyet-images/${gorsel}`}
                alt={`Faaliyet ${index + 1}`}
                className={`w-full object-cover rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform duration-200 border border-gray-700 ${ // Kenarlık
                    faaliyet.gorseller.length === 1 ? 'h-48 sm:h-64' : 'h-28 sm:h-36' // Yükseklik mobil için ayarlandı
                }`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x200?text=Resim+Yok';
                  e.target.className += ' bg-gray-700 text-gray-400 flex items-center justify-center'; // Placeholder için stil
                }}
              />
              {index === 3 && faaliyet.gorseller.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg sm:rounded-xl flex items-center justify-center"> {/* Yuvarlatma */}
                  <span className="text-white font-semibold text-base sm:text-lg"> {/* Font boyutu */}
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
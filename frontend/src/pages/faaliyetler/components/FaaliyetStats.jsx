import React from 'react';
import { FiBarChart2, FiCalendar, FiUsers } from 'react-icons/fi';

const FaaliyetStats = ({ pagination }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-6"> {/* Daha fazla boşluk için mb-8, mt-6 */}
      {/* Toplam Faaliyet Sayısı */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-700"> {/* Koyu arka plan, gölge, kenarlık */}
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-700 flex items-center justify-center mr-4"> {/* Koyu mavi arka plan */}
            <FiBarChart2 className="h-6 w-6 text-blue-200" /> {/* Açık mavi ikon */}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Toplam Faaliyet</p> {/* Açık gri metin */}
            <p className="text-2xl font-bold text-white">{pagination.total}</p> {/* Beyaz sayı */}
          </div>
        </div>
      </div>

      {/* Toplam Sayfa Sayısı */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-700"> {/* Koyu arka plan, gölge, kenarlık */}
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-700 flex items-center justify-center mr-4"> {/* Koyu mor arka plan */}
            <FiUsers className="h-6 w-6 text-purple-200" /> {/* Açık mor ikon */}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Toplam Sayfa</p> {/* Açık gri metin */}
            <p className="text-2xl font-bold text-white">{pagination.totalPages}</p> {/* Beyaz sayı */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaaliyetStats;
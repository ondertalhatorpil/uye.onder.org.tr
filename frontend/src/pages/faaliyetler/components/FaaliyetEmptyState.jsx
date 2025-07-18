import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const FaaliyetEmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz faaliyet yok</h3>
      <p className="text-gray-500 mb-6">Topluluğa ilk faaliyeti sen paylaş!</p>
      <Link
        to="/faaliyetler/create"
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Faaliyet Paylaş
      </Link>
    </div>
  );
};

export default FaaliyetEmptyState;
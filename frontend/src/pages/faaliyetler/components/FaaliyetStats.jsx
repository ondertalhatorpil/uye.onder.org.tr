import React from 'react';

const FaaliyetStats = ({ pagination }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{pagination.total}</span> faaliyet bulundu
        </div>
        <div className="text-sm text-gray-500">
          Sayfa {pagination.page} / {pagination.totalPages}
        </div>
      </div>
    </div>
  );
};

export default FaaliyetStats;
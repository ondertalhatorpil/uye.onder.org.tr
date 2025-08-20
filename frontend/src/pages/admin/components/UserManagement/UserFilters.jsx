// src/pages/admin/components/UserFilters.jsx
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const UserFilters = ({
  showFilters,
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  filters,
  setFilters,
  selectedUsers,
  onSearch,
  onBulkDelete,
  onClearSelection,
  onClearFilters
}) => {
  return (
    <div className="bg-red-600 rounded-lg shadow p-6 mb-12">
      {/* Search Bar */}
      <form onSubmit={onSearch}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim, email, dernek ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-white"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white"
          >
            <option value="all">Tüm Roller</option>
            <option value="super_admin">Süper Admin</option>
            <option value="dernek_admin">Dernek Admin</option>
            <option value="uye">Üye</option>
          </select>
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Ara
          </button>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
              <input
                type="text"
                value={filters.il}
                onChange={(e) => setFilters(prev => ({ ...prev, il: e.target.value }))}
                placeholder="İl seçin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dernek</label>
              <input
                type="text"
                value={filters.dernek}
                onChange={(e) => setFilters(prev => ({ ...prev, dernek: e.target.value }))}
                placeholder="Dernek adı"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClearFilters}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <FiX className="mr-2 h-4 w-4" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} kullanıcı seçildi
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Seçilenleri Sil
              </button>
              <button
                onClick={onClearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;
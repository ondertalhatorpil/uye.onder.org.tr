// src/pages/admin/components/DernekFilters.jsx
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const DernekFilters = ({
    showFilters,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    applyFilters
}) => {
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        setFilters({ il: '', ilce: '', hasAdmin: '', memberCount: '' });
        setSearchTerm('');
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Dernek adı, başkan, şehir ara..."
                        className="w-full pl-12 pr-32 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                    >
                        Ara
                    </button>
                </div>
            </form>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="border-t pt-6 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                            <input
                                type="text"
                                value={filters.il}
                                onChange={(e) => setFilters(prev => ({ ...prev, il: e.target.value }))}
                                placeholder="İl adı girin..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                            <input
                                type="text"
                                value={filters.ilce}
                                onChange={(e) => setFilters(prev => ({ ...prev, ilce: e.target.value }))}
                                placeholder="İlçe adı girin..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Durumu</label>
                            <select
                                value={filters.hasAdmin}
                                onChange={(e) => setFilters(prev => ({ ...prev, hasAdmin: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tümü</option>
                                <option value="true">Admin Var</option>
                                <option value="false">Admin Yok</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Üye Sayısı</label>
                            <select
                                value={filters.memberCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, memberCount: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tümü</option>
                                <option value="0">0 Üye</option>
                                <option value="1-10">1-10 Üye</option>
                                <option value="11-50">11-50 Üye</option>
                                <option value="50+">50+ Üye</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            <FiX className="mr-2 h-4 w-4" />
                            Filtreleri Temizle
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DernekFilters;
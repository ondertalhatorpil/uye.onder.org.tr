// src/pages/admin/DernekManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dernekService, adminApi } from '../../services';
import {
    FiFilter, FiDownload, FiUpload, FiGrid, FiUsers, FiRefreshCw,
    FiSearch, FiMapPin, FiUser, FiEdit2, FiUserPlus, FiX,
    FiShield, FiCalendar, FiPhone, FiGlobe, FiArrowRight,
    FiCheck, FiAlertCircle, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const DernekManagement = () => {
    const { user } = useAuth();

    // State Management
    const [dernekler, setDernekler] = useState([]);
    const [filteredDernekler, setFilteredDernekler] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Editing States
    const [editingDernek, setEditingDernek] = useState(null);
    const [editingDernekInfo, setEditingDernekInfo] = useState(null);
    const [viewingDernek, setViewingDernek] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        il: '',
        ilce: '',
        hasAdmin: '',
        memberCount: ''
    });

    // Edit Form
    const [editForm, setEditForm] = useState({
        dernek_adi: '',
        dernek_baskani: '',
        dernek_telefon: '',
        dernek_sosyal_medya_hesaplari: ''
    });

    // Load Data
    useEffect(() => {
        loadDernekler();
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [dernekler, searchTerm, filters]);

    // Data Loading Functions
    const loadDernekler = async () => {
        try {
            setLoading(true);
            const response = await dernekService.getDernekler();

            if (response.success) {
                setDernekler(response.data || []);
            }
        } catch (error) {
            console.error('Load dernekler error:', error);
            toast.error('Dernekler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await adminApi.getAllUsers({ limit: 1000 });
            if (response.success) {
                setUsers(response.data || []);
            }
        } catch (error) {
            console.error('Load users error:', error);
        }
    };

    // Filter Functions
    const applyFilters = () => {
        let filtered = dernekler;

        if (searchTerm) {
            filtered = filtered.filter(dernek =>
                dernek.dernek_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.dernek_baskani?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.il?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.ilce?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.il) {
            filtered = filtered.filter(dernek =>
                dernek.il?.toLowerCase().includes(filters.il.toLowerCase())
            );
        }

        if (filters.ilce) {
            filtered = filtered.filter(dernek =>
                dernek.ilce?.toLowerCase().includes(filters.ilce.toLowerCase())
            );
        }

        if (filters.hasAdmin) {
            filtered = filtered.filter(dernek => {
                const hasAdmin = dernek.admin_user_id ? true : false;
                return filters.hasAdmin === 'true' ? hasAdmin : !hasAdmin;
            });
        }

        if (filters.memberCount) {
            filtered = filtered.filter(dernek => {
                const memberCount = getDernekUyeCount(dernek.dernek_adi);
                switch (filters.memberCount) {
                    case '0':
                        return memberCount === 0;
                    case '1-10':
                        return memberCount >= 1 && memberCount <= 10;
                    case '11-50':
                        return memberCount >= 11 && memberCount <= 50;
                    case '50+':
                        return memberCount > 50;
                    default:
                        return true;
                }
            });
        }

        setFilteredDernekler(filtered);
    };

    // Action Functions
    const handleAssignAdmin = async (dernekId, adminUserId) => {
        try {
            const response = await adminApi.assignDernekAdmin({
                userId: adminUserId,
                dernekId: dernekId
            });

            if (response.success) {
                toast.success('Dernek admini atandı');
                loadDernekler();
                loadUsers();
                setShowAdminModal(false);
                setEditingDernek(null);
            }
        } catch (error) {
            console.error('Assign admin error:', error);
            toast.error('Admin ataması başarısız');
        }
    };

    const handleEditDernek = async (e) => {
        e.preventDefault();
        try {
            const response = await dernekService.updateMyDernek(editForm);

            if (response.success) {
                toast.success('Dernek bilgileri güncellendi');
                loadDernekler();
                setShowEditModal(false);
                setEditingDernekInfo(null);
            }
        } catch (error) {
            console.error('Edit dernek error:', error);
            toast.error('Dernek güncellenemedi');
        }
    };

    const handleUploadExcel = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error('Lütfen bir Excel dosyası seçin');
            return;
        }

        const formData = new FormData();
        formData.append('excel', uploadFile);

        try {
            const response = await adminApi.uploadDernekExcel(formData);

            if (response.success) {
                toast.success('Dernekler Excel\'den başarıyla eklendi');
                setShowUploadModal(false);
                setUploadFile(null);
                loadDernekler();
            }
        } catch (error) {
            console.error('Upload excel error:', error);
            toast.error('Excel yükleme başarısız');
        }
    };

    const handleExportDernekler = async () => {
        try {
            const exportData = {
                dernekler: filteredDernekler,
                filters,
                totalCount: filteredDernekler.length,
                exportDate: new Date().toISOString(),
                exportedBy: user.email
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dernekler_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Dernekler dosyasına aktarıldı');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export işlemi başarısız');
        }
    };

    // Helper Functions
    const getDernekUyeCount = (dernekAdi) => {
        return users.filter(user => user.gonullu_dernek === dernekAdi).length;
    };

    const getDernekAdmin = (dernekId) => {
        return users.find(user => user.role === 'dernek_admin' && user.id === dernekId);
    };

    const getAvailableUsers = () => {
        return users.filter(user =>
            user.gonullu_dernek === editingDernek?.dernek_adi &&
            (user.role === 'uye' || user.role === 'dernek_admin')
        );
    };

    const openEditModal = (dernek) => {
        setEditingDernekInfo(dernek);
        setEditForm({
            dernek_adi: dernek.dernek_adi || '',
            dernek_baskani: dernek.dernek_baskani || '',
            dernek_telefon: dernek.dernek_telefon || '',
            dernek_sosyal_medya_hesaplari: typeof dernek.dernek_sosyal_medya_hesaplari === 'string'
                ? dernek.dernek_sosyal_medya_hesaplari
                : JSON.stringify(dernek.dernek_sosyal_medya_hesaplari || {})
        });
        setShowEditModal(true);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            il: '',
            ilce: '',
            hasAdmin: '',
            memberCount: ''
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-400">Dernekler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Modern Header */}
                <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <FiGrid className="h-8 w-8" />
                                Dernek Yönetimi
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-red-100">
                                <div className="flex items-center">
                                    <FiGrid className="mr-2 h-4 w-4" />
                                    <span>Toplam {filteredDernekler.length} dernek</span>
                                </div>
                                <div className="flex items-center">
                                    <FiUsers className="mr-2 h-4 w-4" />
                                    <span>{users.length} toplam üye</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${showFilters
                                    ? 'bg-white text-[#FA2C37] border-2 border-white'
                                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
                                    }`}
                            >
                                <FiFilter className="mr-2 h-4 w-4" />
                                Filtrele
                            </button>

                            <button
                                onClick={handleExportDernekler}
                                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
                            >
                                <FiDownload className="mr-2 h-4 w-4" />
                                Dışa Aktar
                            </button>

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
                            >
                                <FiUpload className="mr-2 h-4 w-4" />
                                Excel Yükle
                            </button>

                            <button
                                onClick={loadDernekler}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all disabled:opacity-50 border-2 border-transparent"
                            >
                                <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-100">Filtreler</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-200 p-1"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Search */}
                            <div className="col-span-full md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Arama</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Dernek adı, başkan, il veya ilçe ile ara..."
                                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* İl Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">İl</label>
                                <input
                                    type="text"
                                    value={filters.il}
                                    onChange={(e) => setFilters(prev => ({ ...prev, il: e.target.value }))}
                                    placeholder="İl seçin..."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                                />
                            </div>

                            {/* Admin Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Durumu</label>
                                <select
                                    value={filters.hasAdmin}
                                    onChange={(e) => setFilters(prev => ({ ...prev, hasAdmin: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                                >
                                    <option value="">Tümü</option>
                                    <option value="true">Admin Var</option>
                                    <option value="false">Admin Yok</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={clearFilters}
                                className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-2"
                            >
                                <FiX className="h-4 w-4" />
                                Filtreleri Temizle
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Toplam Dernek</p>
                                <p className="text-2xl font-bold text-gray-100">{filteredDernekler.length}</p>
                            </div>
                            <div className="p-3 bg-blue-600/20 rounded-lg">
                                <FiGrid className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Admin Atanmış</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {filteredDernekler.filter(d => d.admin_user_id).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-600/20 rounded-lg">
                                <FiShield className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Admin Gerekli</p>
                                <p className="text-2xl font-bold text-orange-400">
                                    {filteredDernekler.filter(d => !d.admin_user_id).length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-600/20 rounded-lg">
                                <FiAlertCircle className="h-6 w-6 text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Toplam Üye</p>
                                <p className="text-2xl font-bold text-purple-400">{users.length}</p>
                            </div>
                            <div className="p-3 bg-purple-600/20 rounded-lg">
                                <FiUsers className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dernekler Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredDernekler.map((dernek) => (
                        <DernekCard
                            key={dernek.id}
                            dernek={dernek}
                            uyeCount={getDernekUyeCount(dernek.dernek_adi)}
                            admin={getDernekAdmin(dernek.admin_user_id)}
                            onEditAdmin={(dernek) => {
                                setEditingDernek(dernek);
                                setShowAdminModal(true);
                            }}
                            onEdit={openEditModal}
                            onViewDetail={(dernek) => {
                                setViewingDernek(dernek);
                                setShowDetailModal(true);
                            }}
                        />
                    ))}
                </div>

                {/* No Results State */}
                {filteredDernekler.length === 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                        <FiGrid className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Dernek bulunamadı</h3>
                        <p className="text-gray-400 mb-6">
                            Arama kriterlerinizi değiştirin veya yeni dernek ekleyin
                        </p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg font-medium transition-all hover:scale-105"
                        >
                            <FiUpload className="mr-2 h-5 w-5" />
                            Excel'den Dernek Ekle
                        </button>
                    </div>
                )}

                {/* Admin Assignment Modal */}
                {showAdminModal && editingDernek && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-100 mb-4">
                                Admin Ata: {editingDernek.dernek_adi}
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {getAvailableUsers().length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">
                                        Bu dernekte uygun kullanıcı bulunamadı
                                    </p>
                                ) : (
                                    getAvailableUsers().map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleAssignAdmin(editingDernek.id, user.id)}
                                            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors flex items-center gap-3"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-white">
                                                    {user.isim?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-gray-100 font-medium">
                                                    {user.isim} {user.soyisim}
                                                </p>
                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAdminModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Excel Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-100 mb-4">
                                Excel Dosyası Yükle
                            </h3>
                            <form onSubmit={handleUploadExcel}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Excel Dosyası Seçin
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#FA2C37] file:text-white hover:file:bg-[#FA2C37]/80"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg transition-colors"
                                    >
                                        Yükle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Dernek Card Component
const DernekCard = ({ dernek, uyeCount, admin, onEditAdmin, onEdit, onViewDetail }) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                        {dernek.dernek_adi}
                    </h3>
                    <div className="space-y-2">
                        {dernek.dernek_baskani && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FiUser className="h-4 w-4" />
                                <span>{dernek.dernek_baskani}</span>
                            </div>
                        )}
                        {(dernek.il || dernek.ilce) && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FiMapPin className="h-4 w-4" />
                                <span>{dernek.il}{dernek.ilce ? `, ${dernek.ilce}` : ''}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FiUsers className="h-4 w-4" />
                            <span>{uyeCount} üye</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Status */}
            <div className="mb-4">
                {admin ? (
                    <div className="flex items-center gap-2 p-3 bg-green-600/20 rounded-lg border border-green-600/30">
                        <FiShield className="h-4 w-4 text-green-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-300">Admin Atanmış</p>
                            <p className="text-xs text-green-400">{admin.isim} {admin.soyisim}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 bg-orange-600/20 rounded-lg border border-orange-600/30">
                        <FiAlertCircle className="h-4 w-4 text-orange-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-300">Admin Gerekli</p>
                            <p className="text-xs text-orange-400">Bir admin ataması yapın</p>
                        </div>
                    </div>
                )}
            </div>  
        </div>
    );
};
export default DernekManagement;
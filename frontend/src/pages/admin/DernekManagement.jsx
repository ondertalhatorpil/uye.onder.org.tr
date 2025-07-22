// src/pages/admin/DernekManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dernekService , adminApi} from '../../services';
import {
    FiFilter, FiDownload, FiUpload, FiGrid, FiUsers, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DernekCard from './components/DernekManagement/DernekCard';
import DernekFilters from './components/DernekManagement/DernekFilters';
import DernekModals from './components/DernekManagement/DernekModals';

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

    // Editing States
    const [editingDernek, setEditingDernek] = useState(null);
    const [editingDernekInfo, setEditingDernekInfo] = useState(null);
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

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(dernek =>
                dernek.dernek_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.dernek_baskani?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.il?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dernek.ilce?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // İl filter
        if (filters.il) {
            filtered = filtered.filter(dernek =>
                dernek.il?.toLowerCase().includes(filters.il.toLowerCase())
            );
        }

        // İlçe filter
        if (filters.ilce) {
            filtered = filtered.filter(dernek =>
                dernek.ilce?.toLowerCase().includes(filters.ilce.toLowerCase())
            );
        }

        // Admin filter
        if (filters.hasAdmin) {
            filtered = filtered.filter(dernek => {
                const hasAdmin = dernek.admin_user_id ? true : false;
                return filters.hasAdmin === 'true' ? hasAdmin : !hasAdmin;
            });
        }

        // Member count filter
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
            const response = await adminApi.exportDernekler(filters);
            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            adminApi.downloadFile(blob, `dernekler_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Dernekler Excel dosyasına aktarıldı');
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

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Dernekler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Modern Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Dernek Yönetimi
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FiFilter className="mr-2 h-4 w-4" />
                                Filtrele
                            </button>
                           
                            <button
                                onClick={loadDernekler}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
                            >
                                <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Component */}
                <DernekFilters
                    showFilters={showFilters}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    applyFilters={applyFilters}
                />

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
                        />
                    ))}
                </div>

                {/* No Results State */}
                {filteredDernekler.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FiGrid className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Dernek bulunamadı</h3>
                        <p className="text-gray-600 mb-6">
                            Arama kriterlerinizi değiştirin veya yeni dernek ekleyin
                        </p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                        >
                            <FiUpload className="mr-2 h-5 w-5" />
                            Excel'den Dernek Ekle
                        </button>
                    </div>
                )}

                {/* Modals Component */}
                <DernekModals
                    showAdminModal={showAdminModal}
                    setShowAdminModal={setShowAdminModal}
                    showEditModal={showEditModal}
                    setShowEditModal={setShowEditModal}
                    showUploadModal={showUploadModal}
                    setShowUploadModal={setShowUploadModal}
                    editingDernek={editingDernek}
                    setEditingDernek={setEditingDernek}
                    editingDernekInfo={editingDernekInfo}
                    setEditingDernekInfo={setEditingDernekInfo}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    uploadFile={uploadFile}
                    setUploadFile={setUploadFile}
                    availableUsers={getAvailableUsers()}
                    onAssignAdmin={handleAssignAdmin}
                    onEditDernek={handleEditDernek}
                    onUploadExcel={handleUploadExcel}
                />

            </div>
        </div>
    );
};

export default DernekManagement;
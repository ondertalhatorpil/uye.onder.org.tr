// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import {
  FiDownload, FiRefreshCw, FiFilter, FiX, FiUsers, FiSearch, FiTrash2,
  FiEdit2, FiMoreVertical, FiChevronLeft, FiChevronRight, FiUser,
  FiShield, FiGrid, FiCheck, FiEye, FiMail, FiPhone, FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const { user } = useAuth();
  
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    il: '',
    ilce: '',
    dernek: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load users on component mount and when dependencies change
  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit]);

  // Debounced search and filter
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedRole, filters]);

  // Load users function
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm && searchTerm.trim()) {
        queryParams.name = searchTerm.trim();
      }

      if (filters.il && filters.il.trim()) {
        queryParams.il = filters.il.trim();
      }

      if (filters.ilce && filters.ilce.trim()) {
        queryParams.ilce = filters.ilce.trim();
      }

      if (filters.dernek && filters.dernek.trim()) {
        queryParams.dernek = filters.dernek.trim();
      }

      let response;
      try {
        response = await adminApi.searchUsers(queryParams);
      } catch (error) {
        console.log('searchUsers not available, using getAllUsers');
        response = await adminApi.getAllUsers(queryParams);
      }
      
      if (response.success) {
        let users = response.data || [];
        
        if (selectedRole !== 'all') {
          users = users.filter(user => user.role === selectedRole);
        }
        
        setUsers(users);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || users.length,
          pages: response.pagination?.totalPages || Math.ceil(users.length / prev.limit)
        }));
      } else {
        toast.error('Kullanıcılar yüklenemedi');
      }
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Role change handler
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await adminApi.updateUserRole(userId, { role: newRole });
      
      if (response.success) {
        toast.success('Kullanıcı rolü güncellendi');
        loadUsers();
        setShowRoleModal(false);
        setEditingUser(null);
      } else {
        toast.error('Rol güncellenemedi');
      }
    } catch (error) {
      console.error('Role update error:', error);
      toast.error('Rol güncellenirken hata oluştu');
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    try {
      const response = await adminApi.deleteUser(userId);
      
      if (response.success) {
        toast.success('Kullanıcı silindi');
        loadUsers();
        setShowDeleteModal(false);
        setDeletingUser(null);
      } else {
        toast.error('Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  // Export users handler
  const handleExportUsers = async () => {
    try {
      const exportData = {
        users,
        filters,
        totalCount: pagination.total,
        exportDate: new Date().toISOString(),
        exportedBy: user.email
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Kullanıcılar dosyasına aktarıldı');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export işlemi başarısız');
    }
  };

  // User selection handlers
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Clear filters handler
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setFilters({
      il: '',
      ilce: '',
      dernek: '',
      dateFrom: '',
      dateTo: ''
    });
    setSelectedUsers([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <FiShield className="h-4 w-4" />;
      case 'dernek_admin': return <FiGrid className="h-4 w-4" />;
      default: return <FiUser className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600/20 text-red-300 border-red-600/30';
      case 'dernek_admin': return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
      default: return 'bg-green-600/20 text-green-300 border-green-600/30';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'dernek_admin': return 'Dernek Admin';
      default: return 'Üye';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FA2C37] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-400">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FA2C37] to-[#FA2C37]/80 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FiUsers className="h-8 w-8" />
                Kullanıcı Yönetimi
              </h1>
              <div className="flex items-center space-x-4 text-sm text-red-100">
                <span>Toplam {pagination.total} kullanıcı</span>
                {selectedUsers.length > 0 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                    {selectedUsers.length} seçili
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters 
                    ? 'bg-white text-[#FA2C37] border-2 border-white' 
                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-transparent'
                }`}
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Filtrele
              </button>

              <button
                onClick={handleExportUsers}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all border-2 border-transparent"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Dışa Aktar
              </button>

              <button
                onClick={loadUsers}
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
                    placeholder="Ad, soyad veya email ile ara..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-[#FA2C37] focus:border-transparent"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="dernek_admin">Dernek Admin</option>
                  <option value="uye">Üye</option>
                </select>
              </div>

              {/* City Filter */}
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
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-200 text-sm flex items-center gap-2"
              >
                <FiX className="h-4 w-4" />
                Filtreleri Temizle
              </button>

              {selectedUsers.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`${selectedUsers.length} kullanıcı silinecek. Emin misiniz?`)) {
                      // handleBulkDelete();
                      toast.error('Toplu silme özelliği geliştiriliyor');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Seçilenleri Sil ({selectedUsers.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleAllUsers}
                      className="w-4 h-4 text-[#FA2C37] bg-gray-600 border-gray-500 rounded focus:ring-[#FA2C37] focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Konum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dernek
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA2C37]"></div>
                        <span className="ml-3 text-gray-400">Yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <FiUsers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Kullanıcı bulunamadı</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-[#FA2C37] bg-gray-600 border-gray-500 rounded focus:ring-[#FA2C37] focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FA2C37] to-[#FA2C37]/60 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                              {user.isim?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">
                              {user.isim} {user.soyisim}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <FiMail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {getRoleText(user.role)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.il && user.ilce ? (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="h-3 w-3 text-gray-400" />
                            {user.il}, {user.ilce}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.gonullu_dernek ? (
                          <div className="flex items-center gap-1">
                            <FiGrid className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-32">{user.gonullu_dernek}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="h-3 w-3 text-gray-400" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setViewingUser(user);
                              setShowUserDetail(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                            title="Detay Görüntüle"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowRoleModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                            title="Rol Düzenle"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            title="Kullanıcıyı Sil"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Sayfa {pagination.page} / {pagination.pages} 
                  <span className="ml-2">
                    (Toplam {pagination.total} kullanıcı)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Edit Modal */}
        {showRoleModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Rol Düzenle: {editingUser.isim} {editingUser.soyisim}
              </h3>
              <div className="space-y-3">
                {['super_admin', 'dernek_admin', 'uye'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(editingUser.id, role)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      editingUser.role === role
                        ? 'bg-[#FA2C37]/20 border-[#FA2C37] text-[#FA2C37]'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    } border-2`}
                  >
                    {getRoleIcon(role)}
                    {getRoleText(role)}
                    {editingUser.role === role && <FiCheck className="ml-auto h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && deletingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Kullanıcıyı Sil
              </h3>
              <p className="text-gray-300 mb-6">
                <strong>{deletingUser.isim} {deletingUser.soyisim}</strong> kullanıcısını silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteUser(deletingUser.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetail && viewingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-100">
                  Kullanıcı Detayları
                </h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Ad Soyad</label>
                    <p className="text-gray-200">{viewingUser.isim} {viewingUser.soyisim}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Email</label>
                    <p className="text-gray-200 flex items-center gap-2">
                      <FiMail className="h-4 w-4" />
                      {viewingUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Telefon</label>
                    <p className="text-gray-200 flex items-center gap-2">
                      <FiPhone className="h-4 w-4" />
                      {viewingUser.telefon || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Rol</label>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(viewingUser.role)}`}>
                      {getRoleIcon(viewingUser.role)}
                      {getRoleText(viewingUser.role)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Konum</label>
                    <p className="text-gray-200 flex items-center gap-2">
                      <FiMapPin className="h-4 w-4" />
                      {viewingUser.il && viewingUser.ilce ? `${viewingUser.il}, ${viewingUser.ilce}` : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Dernek</label>
                    <p className="text-gray-200 flex items-center gap-2">
                      <FiGrid className="h-4 w-4" />
                      {viewingUser.gonullu_dernek || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Meslek</label>
                    <p className="text-gray-200">{viewingUser.meslek || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1">Kayıt Tarihi</label>
                    <p className="text-gray-200 flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDate(viewingUser.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUserDetail(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(viewingUser);
                      setShowUserDetail(false);
                      setShowRoleModal(true);
                    }}
                    className="px-4 py-2 bg-[#FA2C37] hover:bg-[#FA2C37]/80 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Rol Düzenle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;
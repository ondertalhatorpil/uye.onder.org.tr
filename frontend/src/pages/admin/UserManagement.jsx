// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import {
  FiDownload, FiRefreshCw, FiFilter, FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import UserTable from './components/UserManagement/UserTable';
import UserFilters from './components/UserManagement/UserFilters';
import UserModals from './components/UserManagement/UserModals';

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
      
      // Prepare query parameters for backend
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add search term if exists
      if (searchTerm && searchTerm.trim()) {
        queryParams.name = searchTerm.trim();
      }

      // Add filters if they exist
      if (filters.il && filters.il.trim()) {
        queryParams.il = filters.il.trim();
      }

      if (filters.ilce && filters.ilce.trim()) {
        queryParams.ilce = filters.ilce.trim();
      }

      if (filters.dernek && filters.dernek.trim()) {
        queryParams.dernek = filters.dernek.trim();
      }

      console.log('Loading users with params:', queryParams);

      // Call API - use searchUsers if it exists, otherwise getAllUsers
      let response;
      try {
        response = await adminApi.searchUsers(queryParams);
      } catch (error) {
        console.log('searchUsers not available, using getAllUsers');
        response = await adminApi.getAllUsers(queryParams);
      }
      
      if (response.success) {
        let users = response.data || [];
        
        // Client-side role filter if needed
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

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
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

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`${selectedUsers.length} kullanıcı silinecek. Emin misiniz?`)) {
      try {
        const response = await adminApi.bulkDeleteUsers(selectedUsers);
        
        if (response.success) {
          toast.success(`${selectedUsers.length} kullanıcı silindi`);
          setSelectedUsers([]);
          loadUsers();
        } else {
          toast.error('Toplu silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Bulk delete error:', error);
        toast.error('Toplu silme işleminde hata oluştu');
      }
    }
  };

  // Export users handler
  const handleExportUsers = async () => {
    try {
      // Create export data
      const exportData = {
        users,
        filters,
        totalCount: pagination.total,
        exportDate: new Date().toISOString(),
        exportedBy: user.email
      };
      
      // Create and download file
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

  // Modal handlers
  const openRoleModal = (user) => {
    setEditingUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setEditingUser(null);
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  // Loading state for initial load
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                Kullanıcı Yönetimi
              </h1>
              <div className="flex items-center space-x-4 text-sm text-white">
                <span>Toplam {pagination.total} kullanıcı</span>
                {selectedUsers.length > 0 && (
                  <span className="text-white font-medium">
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
                    ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Filtrele
              </button>

              <button
                onClick={loadUsers}
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
        <UserFilters
          showFilters={showFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          filters={filters}
          setFilters={setFilters}
          selectedUsers={selectedUsers}
          onSearch={handleSearch}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedUsers([])}
          onClearFilters={clearFilters}
        />

        {/* Users Table Component */}
        <UserTable
          users={users}
          loading={loading}
          selectedUsers={selectedUsers}
          pagination={pagination}
          setPagination={setPagination}
          onToggleUser={toggleUserSelection}
          onToggleAll={toggleAllUsers}
          onEditRole={openRoleModal}
          onDeleteUser={openDeleteModal}
        />

        {/* Modals Component */}
        <UserModals
          showRoleModal={showRoleModal}
          setShowRoleModal={setShowRoleModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          deletingUser={deletingUser}
          setDeletingUser={setDeletingUser}
          onRoleChange={handleRoleChange}
          onDeleteUser={handleDeleteUser}
          onCloseRoleModal={closeRoleModal}
          onCloseDeleteModal={closeDeleteModal}
        />

      </div>
    </div>
  );
};

export default UserManagement;
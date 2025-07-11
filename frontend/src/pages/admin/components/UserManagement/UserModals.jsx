// src/pages/admin/components/UserModals.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

const UserModals = ({
  showRoleModal,
  setShowRoleModal,
  showDeleteModal,
  setShowDeleteModal,
  editingUser,
  setEditingUser,
  deletingUser,
  setDeletingUser,
  onRoleChange,
  onDeleteUser
}) => {
  const getRoleText = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Süper Admin';
      case 'dernek_admin':
        return 'Dernek Admin';
      case 'uye':
        return 'Üye';
      default:
        return 'Bilinmeyen';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'uye':
        return 'Temel kullanıcı yetkilerine sahip';
      case 'dernek_admin':
        return 'Dernek yönetim yetkilerine sahip';
      case 'super_admin':
        return 'Tüm sistem yetkilerine sahip';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Role Edit Modal */}
      {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Rol Düzenle
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                <strong>{editingUser.isim} {editingUser.soyisim}</strong> kullanıcısının rolünü değiştirin
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {['uye', 'dernek_admin', 'super_admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => onRoleChange(editingUser.id, role)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all hover:scale-105 ${
                      editingUser.role === role
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{getRoleText(role)}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getRoleDescription(role)}
                        </div>
                      </div>
                      {editingUser.role === role && (
                        <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingUser(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Kullanıcı Sil
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-medium text-red-600">
                    {deletingUser.isim?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {deletingUser.isim} {deletingUser.soyisim}
                  </h4>
                  <p className="text-sm text-gray-500">{deletingUser.email}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Dikkat:</strong> Bu kullanıcıyı silmek istediğinizden emin misiniz?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Bu işlem geri alınamaz ve kullanıcının tüm verileri kalıcı olarak silinecektir.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingUser(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => onDeleteUser(deletingUser.id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                >
                  Kullanıcıyı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserModals;
import React from 'react';
import { FiX, FiUsers } from 'react-icons/fi';

const DernekModals = ({
    showAdminModal,
    setShowAdminModal,
    showEditModal,
    setShowEditModal,
    showUploadModal,
    setShowUploadModal,
    editingDernek,
    setEditingDernek,
    editingDernekInfo,
    setEditingDernekInfo,
    editForm,
    setEditForm,
    setUploadFile,
    availableUsers,
    onAssignAdmin,
    onEditDernek,
    onUploadExcel
}) => {
    return (
        <>
            {/* Admin Assignment Modal */}
            {showAdminModal && editingDernek && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Admin Ata
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAdminModal(false);
                                        setEditingDernek(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                <strong>{editingDernek.dernek_adi}</strong> derneği için admin seçin
                            </p>
                        </div>

                        <div className="p-6 max-h-96 overflow-y-auto">
                            {availableUsers.length > 0 ? (
                                <div className="space-y-3">
                                    {availableUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => onAssignAdmin(editingDernek.id, user.id)}
                                            className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group"
                                        >
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-white">
                                                        {user.isim?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="font-medium text-gray-900 group-hover:text-red-700">
                                                        {user.isim} {user.soyisim}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {user.role === 'dernek_admin' ? 'Dernek Admin' : 'Üye'}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p className="font-medium">Bu derneğe üye olan kullanıcı bulunamadı</p>
                                    <p className="text-sm mt-1">Önce kullanıcıları bu derneğe kaydedin</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Dernek Modal */}
            {showEditModal && editingDernekInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Dernek Bilgilerini Düzenle
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingDernekInfo(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                <strong>{editingDernekInfo.dernek_adi}</strong> derneği bilgilerini güncelleyin
                            </p>
                        </div>

                        <form onSubmit={onEditDernek} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dernek Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.dernek_adi}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dernek_adi: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dernek Başkanı
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.dernek_baskani}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dernek_baskani: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dernek Telefonu
                                    </label>
                                    <input
                                        type="tel"
                                        value={editForm.dernek_telefon}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dernek_telefon: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sosyal Medya Hesapları
                                    </label>
                                    <textarea
                                        value={editForm.dernek_sosyal_medya_hesaplari}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dernek_sosyal_medya_hesaplari: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        rows="3"
                                        placeholder="JSON formatında sosyal medya hesapları"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingDernekInfo(null);
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                                >
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Excel Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Excel Dosyası Yükle
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFile(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Dernekleri Excel dosyasından toplu olarak yükleyin
                            </p>
                        </div>

                        <form onSubmit={onUploadExcel} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Excel Dosyası Seçin
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Dosya Formatı:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Excel formatında (.xlsx, .xls)</li>
                                        <li>• İlk satır başlık olmalı</li>
                                        <li>• Gerekli kolonlar: dernek_adi, il, ilce</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFile(null);
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all hover:scale-105"
                                >
                                    Yükle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default DernekModals;
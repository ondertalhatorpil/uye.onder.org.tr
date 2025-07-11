// src/pages/admin/components/DernekCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UPLOADS_BASE_URL } from '../../../../services/api';
import {
    FiUser, FiEdit3, FiEye, FiMapPin, FiUsers, 
    FiCalendar, FiPhone
} from 'react-icons/fi';

const DernekCard = ({ 
    dernek, 
    uyeCount, 
    admin, 
    onEditAdmin, 
    onEdit 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Default logo URL'i
    const defaultLogoUrl = "https://onder.org.tr/data/uploads/document/686fa88bed88a.jpeg";

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden">
                            <img
                                src={dernek.dernek_logosu 
                                    ? `${UPLOADS_BASE_URL}/uploads/dernek-logos/${dernek.dernek_logosu}`
                                    : defaultLogoUrl
                                }
                                alt={dernek.dernek_adi}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    if (e.target.src !== defaultLogoUrl) {
                                        e.target.src = defaultLogoUrl;
                                    } else {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }
                                }}
                            />
                            <span 
                                className="text-lg font-bold text-white flex items-center justify-center h-full w-full"
                                style={{ display: 'none' }}
                            >
                                {dernek.dernek_adi?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEditAdmin(dernek)}
                            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all text-red-800"
                            title="Admin Ata"
                        >
                            <FiUser className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => onEdit(dernek)}
                            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all text-red-800"
                            title="Düzenle"
                        >
                            <FiEdit3 className="h-4 w-4" />
                        </button>

                        <Link
                            to={`/dernekler/${encodeURIComponent(dernek.dernek_adi)}`}
                            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all text-red-800"
                            title="Görüntüle"
                        >
                            <FiEye className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {dernek.dernek_adi}
                </h3>

                <p className="text-red-100 text-sm">
                    {dernek.dernek_baskani || 'Başkan belirlenmemiş'}
                </p>
            </div>

            {/* Card Body */}
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">
                            {dernek.il || 'Belirtilmemiş'}
                            {dernek.ilce && <span>, {dernek.ilce}</span>}
                        </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <FiUsers className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">{uyeCount} üye</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <FiCalendar className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="font-medium">{formatDate(dernek.dernek_kuruluş_tarihi)}</span>
                    </div>

                    {dernek.dernek_telefon && (
                        <div className="flex items-center text-gray-600">
                            <FiPhone className="mr-3 h-5 w-5 text-gray-400" />
                            <span className="font-medium">{dernek.dernek_telefon}</span>
                        </div>
                    )}
                </div>

                {/* Admin Status */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Yönetici:</span>
                        {admin ? (
                            <div className="flex items-center">
                                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                    <FiUser className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-green-600 font-medium">
                                    {admin.isim} {admin.soyisim}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm text-red-600 font-medium">
                                Yönetici atanmamış
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DernekCard;
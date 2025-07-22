import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dernekService, userService, faaliyetService } from '../../services';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import DernekHeader from './components/DernekProfile/DernekHeader';
import DernekStats from './components/DernekProfile/DernekStats';
import DernekTabs from './components/DernekProfile/DernekTabs';
// YENİ: Leaflet harita komponenti
import DernekLocationMap from './components/DernekProfile/DernekLocationMap';

const DernekProfile = () => {
  const { dernekAdi } = useParams();
  const navigate = useNavigate();
  
  const [dernek, setDernek] = useState(null);
  const [members, setMembers] = useState([]);
  const [faaliyetler, setFaaliyetler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingFaaliyetler, setLoadingFaaliyetler] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dernek bilgilerini getir
  useEffect(() => {
    const loadDernek = async () => {
      try {
        setLoading(true);
        const response = await dernekService.getDernekProfile(dernekAdi);
        
        if (response.success) {
          setDernek(response.data);
          console.log('Dernek data:', response.data); 
        } else {
          toast.error('Dernek bulunamadı');
          navigate('/dernekler');
        }
      } catch (error) {
        console.error('Dernek loading error:', error);
        toast.error('Dernek bilgileri yüklenemedi');
        navigate('/dernekler');
      } finally {
        setLoading(false);
      }
    };

    if (dernekAdi) {
      loadDernek();
    }
  }, [dernekAdi, navigate]);

  // Dernek üyelerini getir
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const response = await userService.getUsersByDernek(dernekAdi);
        
        if (response.success) {
          setMembers(response.data || []);
        }
      } catch (error) {
        console.error('Members loading error:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (dernekAdi) {
      loadMembers();
    }
  }, [dernekAdi]);

  // Dernek faaliyetlerini getir
  useEffect(() => {
    const loadFaaliyetler = async () => {
      try {
        setLoadingFaaliyetler(true);
        const response = await faaliyetService.getFaaliyetler({ dernek: dernekAdi });
        
        if (response.success) {
          setFaaliyetler(response.data || []);
        }
      } catch (error) {
        console.error('Faaliyetler loading error:', error);
      } finally {
        setLoadingFaaliyetler(false);
      }
    };

    if (dernekAdi) {
      loadFaaliyetler();
    }
  }, [dernekAdi]);

  // Sosyal medya linklerini parse et
  const parseSocialMedia = (socialMediaData) => {
    if (!socialMediaData) return {};
    try {
      return typeof socialMediaData === 'string' 
        ? JSON.parse(socialMediaData) 
        : socialMediaData;
    } catch {
      return {};
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Dernek bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!dernek) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <FiArrowLeft className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Dernek bulunamadı</h2>
          <p className="text-gray-600 mb-8">Aradığınız dernek mevcut değil.</p>
          <button
            onClick={() => navigate('/dernekler')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md font-medium"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" />
            Derneklere Dön
          </button>
        </div>
      </div>
    );
  }

  const socialMedia = parseSocialMedia(dernek.dernek_sosyal_medya_hesaplari);

  // Stats data
  const statsData = {
    totalMembers: members.length,
    totalActivities: faaliyetler.length,
    foundingDate: dernek.dernek_kuruluş_tarihi,
    lastActivity: faaliyetler.length > 0 ? faaliyetler[0].created_at : null
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <FiArrowLeft className="mr-2 h-5 w-5" />
            Geri Dön
          </button>
        </div>

        {/* Dernek Header */}
        <DernekHeader 
          dernek={dernek}
          members={members}
          faaliyetler={faaliyetler}
        />

        {/* Stats Cards */}
        <DernekStats stats={statsData} formatDate={formatDate} />

        {/* YENİ: Leaflet Harita Bölümü - Stats'den sonra, Tabs'den önce */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <DernekLocationMap dernek={dernek} />
        </div>

        {/* Tabs Content */}
        <DernekTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dernek={dernek}
          members={members}
          faaliyetler={faaliyetler}
          loadingMembers={loadingMembers}
          loadingFaaliyetler={loadingFaaliyetler}
          socialMedia={socialMedia}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default DernekProfile;
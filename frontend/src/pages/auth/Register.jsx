import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { constantsService, authService } from '../../services';
import EducationInfoSection from './EducationInfoSection'; 

import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiPhone, FiCalendar, FiMapPin, FiUserPlus,
  FiBriefcase, FiShield, FiX, FiCheck
} from 'react-icons/fi';

// Personal Info Component
const PersonalInfoSection = ({ formData, handleChange, showPassword, showConfirmPassword, setShowPassword, setShowConfirmPassword }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-lg flex items-center justify-center">
        <FiUser className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 ml-3">Kişisel Bilgiler</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">İsim *</label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="isim"
            value={formData.isim}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="İsminizi girin"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Soyisim *</label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="soyisim"
            value={formData.soyisim}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="Soyisminizi girin"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email Adresi *</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="ornek@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Telefon *</label>
        <div className="relative">
          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="tel"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="05XX XXX XX XX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Doğum Tarihi *</label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            name="dogum_tarihi"
            value={formData.dogum_tarihi}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Şifre *</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500">En az 6 karakter, büyük/küçük harf ve rakam içermeli</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Şifre Tekrar *</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Professional Info Component - Mezun okul alanı kaldırıldı
const ProfessionalInfoSection = ({ formData, handleChange, options }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-lg flex items-center justify-center">
        <FiBriefcase className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 ml-3">Mesleki Bilgiler</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Sektör *</label>
        <select
          name="sektor"
          value={formData.sektor}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
        >
          <option value="">Sektör seçiniz</option>
          {options.sektorler.map(sektor => (
            <option key={sektor} value={sektor}>{sektor}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Meslek *</label>
        <input
          type="text"
          name="meslek"
          value={formData.meslek}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
          placeholder="Mesleğinizi girin"
        />
      </div>
    </div>
  </div>
);

// Location Info Component
const LocationInfoSection = ({ formData, handleChange, options, loadingStates }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-lg flex items-center justify-center">
        <FiMapPin className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 ml-3">Konum & Dernek Bilgileri</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">İl *</label>
        <select
          name="il"
          value={formData.il}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
        >
          <option value="">İl seçiniz</option>
          {options.iller.map(il => (
            <option key={il} value={il}>{il}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">İlçe *</label>
        <div className="relative">
          <select
            name="ilce"
            value={formData.ilce}
            onChange={handleChange}
            disabled={!formData.il || loadingStates.ilceler}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">İlçe seçiniz</option>
            {options.ilceler.map(ilce => (
              <option key={ilce} value={ilce}>{ilce}</option>
            ))}
          </select>
          {loadingStates.ilceler && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E2000A] border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Gönüllü Olduğunuz Dernek *</label>
        <div className="relative">
          <select
            name="gonullu_dernek"
            value={formData.gonullu_dernek}
            onChange={handleChange}
            disabled={!formData.ilce || loadingStates.dernekler}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">Dernek seçiniz</option>
            {options.dernekler.map(dernek => (
              <option key={dernek.id} value={dernek.dernek_adi}>
                {dernek.dernek_adi} ({dernek.uye_sayisi} üye)
              </option>
            ))}
          </select>
          {loadingStates.dernekler && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E2000A] border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Çalışma Komisyonu *</label>
        <select
          name="calisma_komisyon"
          value={formData.calisma_komisyon}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E2000A] focus:border-transparent transition-all duration-200"
        >
          <option value="">Komisyon seçiniz</option>
          {options.komisyonlar.map(komisyon => (
            <option key={komisyon} value={komisyon}>{komisyon}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

// Privacy Agreements Component
const PrivacyAgreementsSection = ({ formData, handleChange, onShowKvkk, onShowAydinlatma }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-lg flex items-center justify-center">
        <FiShield className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 ml-3">Gizlilik Onayları</h3>
    </div>
    
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            id="kvkk_onay"
            name="kvkk_onay"
            checked={formData.kvkk_onay}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-[#E2000A] border-gray-300 rounded focus:ring-[#E2000A]"
          />
          <div className="flex-1">
            <label htmlFor="kvkk_onay" className="text-sm text-gray-700 cursor-pointer">
              <span className="text-[#E2000A] font-medium">*</span> Kişisel Verilerin Korunması Kanunu kapsamında{' '}
              <button
                type="button"
                onClick={onShowKvkk}
                className="text-[#E2000A] hover:text-red-700 underline font-medium transition-colors"
              >
                KVKK metnini
              </button>
              {' '}okudum, anladım ve kabul ediyorum.
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            id="aydinlatma_metni_onay"
            name="aydinlatma_metni_onay"
            checked={formData.aydinlatma_metni_onay}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-[#E2000A] border-gray-300 rounded focus:ring-[#E2000A]"
          />
          <div className="flex-1">
            <label htmlFor="aydinlatma_metni_onay" className="text-sm text-gray-700 cursor-pointer">
              <span className="text-[#E2000A] font-medium">*</span> Kişisel verilerin işlenmesine ilişkin{' '}
              <button
                type="button"
                onClick={onShowAydinlatma}
                className="text-[#E2000A] hover:text-red-700 underline font-medium transition-colors"
              >
                aydınlatma metnini
              </button>
              {' '}okudum, anladım ve kabul ediyorum.
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col z-[10000]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E2000A] to-red-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiShield className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg leading-6 font-semibold text-white">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
              {content || "İçerik yükleniyor..."}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-[#E2000A] to-red-600 hover:from-red-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E2000A] transition-all duration-200 shadow-lg"
                onClick={onClose}
              >
                <FiCheck className="mr-2 h-5 w-5" />
                Anladım
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Register Component
const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  // GÜNCEL FORM STATE - Eski alanlar kaldırıldı
  const [formData, setFormData] = useState({
    isim: '',
    soyisim: '',
    email: '',
    password: '',
    confirmPassword: '',
    dogum_tarihi: '',
    sektor: '',
    meslek: '',
    telefon: '',
    il: '',
    ilce: '',
    gonullu_dernek: '',
    calisma_komisyon: '',
    mezun_okul: '', // Backward compatibility için tutuldu
    
    // EĞİTİM ALANLARI - Sadece gerekli olanlar
    ortaokul_id: null,
    ortaokul_custom: null,
    ortaokul_mezun_yili: null,
    
    lise_id: null,
    lise_custom: null,
    lise_mezun_yili: null,
    
    // Üniversite bilgileri - tam destekli
    universite_durumu: 'okumadi',
    universite_adi: '',
    universite_bolum: '',
    universite_mezun_yili: null,
    
    kvkk_onay: false,
    aydinlatma_metni_onay: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showAydinlatmaModal, setShowAydinlatmaModal] = useState(false);

  // Options state
  const [options, setOptions] = useState({
    iller: [],
    ilceler: [],
    dernekler: [],
    sektorler: [],
    komisyonlar: []
  });

  const [loadingStates, setLoadingStates] = useState({
    iller: false,
    ilceler: false,
    dernekler: false
  });

  const handleEducationDataChange = (educationData) => {
    setFormData(prev => ({
      ...prev,
      ...educationData
    }));
  };

  // KVKK texts
  const [kvkkTexts, setKvkkTexts] = useState({
    kvkk_metni: '',
    aydinlatma_metni: ''
  });

  // Check authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sektorRes, komisyonRes, kvkkRes, illerRes] = await Promise.all([
          constantsService.getSektorler(),
          constantsService.getKomisyonlar(),
          authService.getKvkkTexts(),
          constantsService.getIller()
        ]);

        setOptions({
          sektorler: sektorRes.data || [],
          komisyonlar: komisyonRes.data || [],
          iller: illerRes.data || [],
          ilceler: [],
          dernekler: []
        });

        if (kvkkRes.success) {
          setKvkkTexts(kvkkRes.data);
        }
      } catch (error) {
        console.error('Data loading error:', error);
        toast.error('Veriler yüklenemedi');
      }
    };

    loadData();
  }, []);

  // Load ilceler when il changes
  useEffect(() => {
    if (!formData.il) return;

    const loadIlceler = async () => {
      setLoadingStates(prev => ({ ...prev, ilceler: true }));
      try {
        const response = await constantsService.getIlceler(formData.il);
        setOptions(prev => ({
          ...prev,
          ilceler: response.data || [],
          dernekler: []
        }));
        setFormData(prev => ({ ...prev, ilce: '', gonullu_dernek: '' }));
      } catch (error) {
        console.error('İlçeler error:', error);
        toast.error('İlçeler yüklenemedi');
      } finally {
        setLoadingStates(prev => ({ ...prev, ilceler: false }));
      }
    };

    loadIlceler();
  }, [formData.il]);

  // Load dernekler when ilce changes
  useEffect(() => {
    if (!formData.il || !formData.ilce) return;

    const loadDernekler = async () => {
      setLoadingStates(prev => ({ ...prev, dernekler: true }));
      try {
        const response = await constantsService.getDerneklerByLocation(formData.il, formData.ilce);
        setOptions(prev => ({
          ...prev,
          dernekler: response.data || []
        }));
        setFormData(prev => ({ ...prev, gonullu_dernek: '' }));
      } catch (error) {
        console.error('Dernekler error:', error);
        toast.error('Dernekler yüklenemedi');
      } finally {
        setLoadingStates(prev => ({ ...prev, dernekler: false }));
      }
    };

    loadDernekler();
  }, [formData.il, formData.ilce]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // GÜNCEL VALIDATION - Eski durumlar kaldırıldı
  const validateForm = () => {
    const errors = [];
    
    if (!formData.isim.trim()) errors.push('İsim zorunlu');
    if (!formData.soyisim.trim()) errors.push('Soyisim zorunlu');
    if (!formData.email.trim()) errors.push('Email zorunlu');
    if (!formData.telefon.trim()) errors.push('Telefon zorunlu');
    if (!formData.dogum_tarihi) errors.push('Doğum tarihi zorunlu');
    if (!formData.password) errors.push('Şifre zorunlu');
    if (formData.password !== formData.confirmPassword) errors.push('Şifreler eşleşmiyor');
    if (!formData.sektor) errors.push('Sektör zorunlu');
    if (!formData.meslek.trim()) errors.push('Meslek zorunlu');
    
    if (!formData.il) errors.push('İl zorunlu');
    if (!formData.ilce) errors.push('İlçe zorunlu');
    if (!formData.gonullu_dernek) errors.push('Dernek zorunlu');
    if (!formData.calisma_komisyon) errors.push('Komisyon zorunlu');
    
    // EĞİTİM VALİDASYONLARI - Sadece mezun durumu
    
    // Ortaokul validasyonları - mezuniyet yılı seçildiyse okul da seçilmeli
    if (formData.ortaokul_mezun_yili && !formData.ortaokul_id && !formData.ortaokul_custom) {
      errors.push('Ortaokul seçimi zorunlu');
    }
    
    // Lise validasyonları - mezuniyet yılı seçildiyse okul da seçilmeli
    if (formData.lise_mezun_yili && !formData.lise_id && !formData.lise_custom) {
      errors.push('Lise seçimi zorunlu');
    }
    
    // Üniversite validasyonları
    if (formData.universite_durumu === 'mezun' || formData.universite_durumu === 'devam_ediyor') {
      if (!formData.universite_adi.trim()) errors.push('Üniversite adı zorunlu');
      if (!formData.universite_bolum.trim()) errors.push('Üniversite bölümü zorunlu');
      if (formData.universite_durumu === 'mezun' && !formData.universite_mezun_yili) {
        errors.push('Üniversite mezuniyet yılı zorunlu');
      }
    }
    
    if (!formData.kvkk_onay) errors.push('KVKK onayı zorunlu');
    if (!formData.aydinlatma_metni_onay) errors.push('Aydınlatma metni onayı zorunlu');

    return errors;
  };

  // GÜNCEL SUBMIT - Eski alanlar kaldırıldı
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      
      // Tüm undefined değerleri null veya boş string olarak temizle
      const cleanedData = {
        // Temel bilgiler
        isim: submitData.isim || '',
        soyisim: submitData.soyisim || '',
        email: submitData.email || '',
        password: submitData.password || '',
        dogum_tarihi: submitData.dogum_tarihi || null,
        sektor: submitData.sektor || '',
        meslek: submitData.meslek || '',
        telefon: submitData.telefon || '',
        il: submitData.il || '',
        ilce: submitData.ilce || '',
        gonullu_dernek: submitData.gonullu_dernek || '',
        calisma_komisyon: submitData.calisma_komisyon || '',
        
        // Mezun okul alanı - backward compatibility için
        mezun_okul: submitData.mezun_okul || '',
        
        // Ortaokul bilgileri - sadece mezun durumu
        ortaokul_id: submitData.ortaokul_id || null,
        ortaokul_custom: submitData.ortaokul_custom ? submitData.ortaokul_custom.trim() : null,
        ortaokul_mezun_yili: submitData.ortaokul_mezun_yili || null,
        
        // Lise bilgileri - sadece mezun durumu
        lise_id: submitData.lise_id || null,
        lise_custom: submitData.lise_custom ? submitData.lise_custom.trim() : null,
        lise_mezun_yili: submitData.lise_mezun_yili || null,
        
        // Üniversite bilgileri - tam destekli
        universite_durumu: submitData.universite_durumu || 'okumadi',
        universite_adi: submitData.universite_adi ? submitData.universite_adi.trim() : null,
        universite_bolum: submitData.universite_bolum ? submitData.universite_bolum.trim() : null,
        universite_mezun_yili: submitData.universite_mezun_yili || null,
        
        // KVKK onayları
        kvkk_onay: Boolean(submitData.kvkk_onay),
        aydinlatma_metni_onay: Boolean(submitData.aydinlatma_metni_onay)
      };
      
      console.log('Frontend - Gönderilen veri:', cleanedData); // Debug için
      console.log('Frontend - Üniversite bilgileri kontrol:', {
        universite_durumu: cleanedData.universite_durumu,
        universite_adi: cleanedData.universite_adi,
        universite_bolum: cleanedData.universite_bolum,
        universite_mezun_yili: cleanedData.universite_mezun_yili,
        form_universite_adi: formData.universite_adi,
        form_universite_bolum: formData.universite_bolum
      });
      
      const result = await register(cleanedData);
      
      if (result.success) {
        toast.success('Kayıt başarılı!');
        navigate('/', { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Kayıt sırasında hata oluştu: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#E2000A] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#E2000A] to-red-600 rounded-2xl mb-4">
            <FiUserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Üye Kayıt Formu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dernek yönetim sistemine katılın ve topluluğumuzun bir parçası olun
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info Section */}
          <PersonalInfoSection
            formData={formData}
            handleChange={handleChange}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />

          {/* Professional Info Section */}
          <ProfessionalInfoSection
            formData={formData}
            handleChange={handleChange}
            options={options}
          />

          {/* Education Info Section */}
          <EducationInfoSection
            formData={formData}
            handleChange={handleChange}
            onEducationDataChange={handleEducationDataChange}
          />

          {/* Location Info Section */}
          <LocationInfoSection
            formData={formData}
            handleChange={handleChange}
            options={options}
            loadingStates={loadingStates}
          />

          {/* Privacy Agreements Section */}
          <PrivacyAgreementsSection
            formData={formData}
            handleChange={handleChange}
            onShowKvkk={() => setShowKvkkModal(true)}
            onShowAydinlatma={() => setShowAydinlatmaModal(true)}
          />

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#E2000A] to-red-600 text-white py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-[#E2000A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  <span className="text-lg font-semibold">Kayıt oluşturuluyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiUserPlus className="mr-3 h-6 w-6" />
                  <span className="text-lg font-semibold">Kayıt Ol</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/login" 
                className="text-[#E2000A] hover:text-red-700 font-semibold transition-colors duration-200"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showKvkkModal}
          onClose={() => setShowKvkkModal(false)}
          title="Kişisel Verilerin Korunması Kanunu (KVKK) Metni"
          content={kvkkTexts.kvkk_metni}
        />

        <Modal
          isOpen={showAydinlatmaModal}
          onClose={() => setShowAydinlatmaModal(false)}
          title="Kişisel Verilerin İşlenmesinew İlişkin Aydınlatma Metni"
          content={kvkkTexts.aydinlatma_metni}
        />
      </div>
    </div>
  );
};

export default Register;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { constantsService, authService } from '../../services';
import EducationInfoSection from './EducationInfoSection'; 

import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiPhone, FiCalendar, FiMapPin, FiUserPlus,
  FiBriefcase, FiShield, FiX, FiCheck, FiInfo,
  FiUsers, 
  FiHome 
} from 'react-icons/fi';
const InputField = ({ label, name, type = "text", icon: Icon, value, placeholder, onChange, showToggle, toggleVisibility, isPassword = false, options = null, disabled = false, hint = null }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300"> {/* Label rengi */}
      {label} {label.includes('*') ? '' : <span className="text-red-500">*</span>} {/* Zorunlu alan işareti */}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />} {/* İkon rengi */}
      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed" // Koyu tema stilleri
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.id || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={isPassword && showToggle ? 'text' : type} // Şifre göster/gizle
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed" // Koyu tema stilleri
        />
      )}
      {isPassword && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showToggle ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      )}
    </div>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>} {/* Hint metni */}
  </div>
);


// Personal Info Component
const PersonalInfoSection = ({ formData, handleChange, showPassword, showConfirmPassword, setShowPassword, setShowConfirmPassword }) => (
  <div className="p-4 sm:p-6"> 
    <div className="flex items-center mb-4 sm:mb-6"> 
      <div className="w-9 h-9 sm:w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0"> 
        <FiUser className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-white ml-3">Kişisel Bilgiler</h3> 
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> 
      <InputField
        label="İsim"
        name="isim"
        icon={FiUser}
        value={formData.isim}
        onChange={handleChange}
        placeholder="İsminizi girin"
      />

      <InputField
        label="Soyisim"
        name="soyisim"
        icon={FiUser}
        value={formData.soyisim}
        onChange={handleChange}
        placeholder="Soyisminizi girin"
      />

      <InputField
        label="Email Adresi"
        name="email"
        type="email"
        icon={FiMail}
        value={formData.email}
        onChange={handleChange}
        placeholder="ornek@email.com"
      />

      <InputField
        label="Telefon"
        name="telefon"
        type="tel"
        icon={FiPhone}
        value={formData.telefon}
        onChange={handleChange}
        placeholder="05XX XXX XX XX"
      />

      <InputField
        label="Doğum Tarihi"
        name="dogum_tarihi"
        type="date"
        icon={FiCalendar}
        value={formData.dogum_tarihi}
        onChange={handleChange}
      />

      <InputField
        label="Şifre"
        name="password"
        type="password"
        icon={FiLock}
        value={formData.password}
        onChange={handleChange}
        isPassword={true}
        showToggle={showPassword}
        toggleVisibility={() => setShowPassword(!showPassword)}
        placeholder="••••••••"
        hint="En az 6 karakter, büyük/küçük harf ve rakam içermeli"
      />

      <InputField
        label="Şifre Tekrar"
        name="confirmPassword"
        type="password"
        icon={FiLock}
        value={formData.confirmPassword}
        onChange={handleChange}
        isPassword={true}
        showToggle={showConfirmPassword}
        toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
        placeholder="••••••••"
      />
    </div>
  </div>
);

// Professional Info Component
const ProfessionalInfoSection = ({ formData, handleChange, options }) => (
  <div className="p-4 sm:p-6"> 
    <div className="flex items-center mb-4 sm:mb-6"> 
      <div className="w-9 h-9 sm:w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0"> {/* İkon kapsayıcı rengi ve boyutu */}
        <FiBriefcase className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-white ml-3">Mesleki Bilgiler</h3> {/* Metin rengi ve boyutu */}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> {/* Responsive grid ve boşluk */}
      <InputField
        label="Sektör"
        name="sektor"
        icon={FiBriefcase}
        value={formData.sektor}
        onChange={handleChange}
        placeholder="Sektör seçiniz"
        options={options.sektorler.map(s => ({ value: s, label: s }))} // Select options için format
      />

      <InputField
        label="Meslek"
        name="meslek"
        icon={FiBriefcase}
        value={formData.meslek}
        onChange={handleChange}
        placeholder="Mesleğinizi girin"
      />
    </div>
  </div>
);

// Location Info Component
const LocationInfoSection = ({ formData, handleChange, options, loadingStates }) => (
  <div className="p-4 sm:p-6"> 
    <div className="flex items-center mb-4 sm:mb-6"> 
      <div className="w-9 h-9 sm:w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0"> 
        <FiMapPin className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-white ml-3">Konum & Dernek Bilgileri</h3> 
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> 
      <InputField
        label="İl"
        name="il"
        icon={FiMapPin}
        value={formData.il}
        onChange={handleChange}
        placeholder="İl seçiniz"
        options={options.iller.map(il => ({ value: il, label: il }))}
        disabled={loadingStates.iller}
      />

      <InputField
        label="İlçe"
        name="ilce"
        icon={FiMapPin}
        value={formData.ilce}
        onChange={handleChange}
        placeholder="İlçe seçiniz"
        options={options.ilceler.map(ilce => ({ value: ilce, label: ilce }))}
        disabled={!formData.il || loadingStates.ilceler}
        hint={loadingStates.ilceler ? "İlçeler yükleniyor..." : ""}
      />

      <div className="md:col-span-2"> {/* Tam genişlik */}
        <InputField
          label="Gönüllü Olduğunuz Dernek"
          name="gonullu_dernek"
          icon={FiUser}
          value={formData.gonullu_dernek}
          onChange={handleChange}
          placeholder="Dernek seçiniz"
          options={options.dernekler.map(dernek => ({ value: dernek.dernek_adi, label: `${dernek.dernek_adi} (${dernek.uye_sayisi} üye)` }))}
          disabled={!formData.ilce || loadingStates.dernekler}
          hint={loadingStates.dernekler ? "Dernekler yükleniyor..." : ""}
        />
      </div>

      <div className="md:col-span-2"> {/* Tam genişlik */}
        <InputField
          label="Çalışma Komisyonu"
          name="calisma_komisyon"
          icon={FiUsers}
          value={formData.calisma_komisyon}
          onChange={handleChange}
          placeholder="Komisyon seçiniz"
          options={options.komisyonlar.map(k => ({ value: k, label: k }))}
        />
      </div>
    </div>
  </div>
);

// Privacy Agreements Component
const PrivacyAgreementsSection = ({ formData, handleChange, onShowKvkk, onShowAydinlatma }) => (
  <div className="p-4 sm:p-6"> 
    <div className="flex items-center mb-4 sm:mb-6"> 
      <div className="w-9 h-9 sm:w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0"> {/* İkon kapsayıcı rengi ve boyutu */}
        <FiShield className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-white ml-3">Gizlilik Onayları</h3> {/* Metin rengi ve boyutu */}
    </div>
    
    <div className="space-y-4 sm:space-y-6"> {/* Responsive boşluk */}
      <div className="p-3 sm:p-4 "> 
        <div className="flex items-start space-x-3"> {/* Responsive boşluk */}
          <input
            type="checkbox"
            id="kvkk_onay"
            name="kvkk_onay"
            checked={formData.kvkk_onay}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-red-600 border-gray-500 rounded focus:ring-red-600 bg-gray-600 cursor-pointer" // Koyu tema stilleri
          />
          <div className="flex-1">
            <label htmlFor="kvkk_onay" className="text-sm text-gray-300 cursor-pointer"> 
              <span className="text-red-500 font-medium">*</span> Kişisel Verilerin Korunması Kanunu kapsamında{' '}
              <button
                type="button"
                onClick={onShowKvkk}
                className="text-red-400 hover:text-red-300 underline font-medium transition-colors" // Metin rengi
              >
                KVKK metnini
              </button>
              {' '}okudum, anladım ve kabul ediyorum.
            </label>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 "> {/* Koyu tema arka planı, responsive padding */}
        <div className="flex items-start space-x-3"> {/* Responsive boşluk */}
          <input
            type="checkbox"
            id="aydinlatma_metni_onay"
            name="aydinlatma_metni_onay"
            checked={formData.aydinlatma_metni_onay}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-red-600 border-gray-500 rounded focus:ring-red-600 bg-gray-600 cursor-pointer" // Koyu tema stilleri
          />
          <div className="flex-1">
            <label htmlFor="aydinlatma_metni_onay" className="text-sm text-gray-300 cursor-pointer"> 
              <span className="text-red-500 font-medium">*</span> Kişisel verilerin işlenmesine ilişkin{' '}
              <button
                type="button"
                onClick={onShowAydinlatma}
                className="text-red-400 hover:text-red-300 underline font-medium transition-colors" // Metin rengi
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
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4"> {/* Responsive padding */}
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" // Daha koyu backdrop
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-xl sm:max-w-4xl w-full max-h-[90vh] flex flex-col z-[10000]"> {/* Koyu tema arka planı, responsive max-width ve yuvarlatma */}
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 px-4 py-3 sm:px-6 sm:py-4 rounded-t-xl sm:rounded-t-2xl"> {/* Koyu kırmızı gradient, responsive padding ve yuvarlatma */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiShield className="h-6 w-6 sm:h-8 w-8 text-white" /> {/* Responsive ikon boyutu */}
              </div>
              <div className="ml-3">
                <h3 className="text-base sm:text-lg leading-6 font-semibold text-white"> {/* Responsive font boyutu */}
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-900/20" // Responsive padding, hover efekti
            >
              <FiX className="h-5 w-5 sm:h-6 w-6" /> {/* Responsive ikon boyutu */}
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 py-4 sm:px-6 sm:py-6 flex-1 overflow-y-auto"> {/* Responsive padding */}
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base"> {/* Metin rengi, responsive font boyutu */}
            {content || "İçerik yükleniyor..."}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:py-4 rounded-b-xl sm:rounded-b-2xl"> {/* Koyu tema arka planı, responsive padding ve yuvarlatma */}
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all duration-200 shadow-lg" // Responsive padding, yuvarlatma, renkler
              onClick={onClose}
            >
              <FiCheck className="mr-2 h-4 w-4 sm:h-5 w-5" /> {/* Responsive ikon boyutu */}
              Anladım
            </button>
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

  // GÜNCEL FORM STATE
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
        setLoadingStates(prev => ({ ...prev, iller: true })); // İller yükleniyor
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
      } finally {
        setLoadingStates(prev => ({ ...prev, iller: false })); // İller yüklendi
      }
    };

    loadData();
  }, []);

  // Load ilceler when il changes
  useEffect(() => {
    if (!formData.il) {
      setOptions(prev => ({ ...prev, ilceler: [], dernekler: [] }));
      setFormData(prev => ({ ...prev, ilce: '', gonullu_dernek: '' }));
      return;
    }

    const loadIlceler = async () => {
      setLoadingStates(prev => ({ ...prev, ilceler: true }));
      try {
        const response = await constantsService.getIlceler(formData.il);
        setOptions(prev => ({
          ...prev,
          ilceler: response.data || [],
          dernekler: [] // İlçe değiştiğinde dernekleri sıfırla
        }));
        setFormData(prev => ({ ...prev, ilce: '', gonullu_dernek: '' })); // İlçe ve derneği sıfırla
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
    if (!formData.il || !formData.ilce) {
        setOptions(prev => ({ ...prev, dernekler: [] }));
        setFormData(prev => ({ ...prev, gonullu_dernek: '' }));
        return;
    }

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

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  let processedValue = value;
  
  if (name === 'isim' || name === 'soyisim') {
    processedValue = value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : processedValue
  }));
};

  // GÜNCEL VALIDATION
  const validateForm = () => {
    const errors = [];
    
    if (!formData.isim.trim()) errors.push('İsim zorunlu.');
    if (!formData.soyisim.trim()) errors.push('Soyisim zorunlu.');
    if (!formData.email.trim()) errors.push('Email zorunlu.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Geçerli bir email adresi giriniz.');
    if (!formData.telefon.trim()) errors.push('Telefon numarası zorunlu.');
    if (!/^\d{10}$/.test(formData.telefon.replace(/\s/g, ''))) errors.push('Geçerli bir telefon numarası giriniz (örn: 5XX XXX XX XX).');
    if (!formData.dogum_tarihi) errors.push('Doğum tarihi zorunlu.');
    
    if (!formData.password) {
      errors.push('Şifre zorunlu.');
    } else if (formData.password.length < 6 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.push('Şifre en az 6 karakter, büyük/küçük harf ve rakam içermeli.');
    }
    
    if (formData.password !== formData.confirmPassword) errors.push('Şifreler eşleşmiyor.');
    if (!formData.sektor) errors.push('Sektör seçimi zorunlu.');
    if (!formData.meslek.trim()) errors.push('Meslek zorunlu.');
    
    if (!formData.il) errors.push('İl seçimi zorunlu.');
    if (!formData.ilce) errors.push('İlçe seçimi zorunlu.');
    if (!formData.gonullu_dernek) errors.push('Gönüllü dernek seçimi zorunlu.');
    if (!formData.calisma_komisyon) errors.push('Çalışma komisyonu seçimi zorunlu.');
    
    
    if (formData.ortaokul_mezun_yili && !formData.ortaokul_id && !formData.ortaokul_custom) {
      errors.push('Ortaokul seçimi veya özel okul adı zorunlu.');
    }
    
    if (formData.lise_mezun_yili && !formData.lise_id && !formData.lise_custom) {
      errors.push('Lise seçimi veya özel okul adı zorunlu.');
    }
    
    if (formData.universite_durumu === 'mezun' || formData.universite_durumu === 'devam_ediyor') {
      if (!formData.universite_adi.trim()) errors.push('Üniversite adı zorunlu.');
      if (!formData.universite_bolum.trim()) errors.push('Üniversite bölümü zorunlu.');
      if (formData.universite_durumu === 'mezun' && !formData.universite_mezun_yili) {
        errors.push('Üniversite mezuniyet yılı zorunlu.');
      }
    }
    
    if (!formData.kvkk_onay) errors.push('KVKK onayı zorunludur.');
    if (!formData.aydinlatma_metni_onay) errors.push('Aydınlatma metni onayı zorunludur.');

    return errors;
  };

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
      
      const cleanedData = {
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
        mezun_okul: submitData.mezun_okul || '',
        
        ortaokul_id: submitData.ortaokul_id || null,
        ortaokul_custom: submitData.ortaokul_custom ? submitData.ortaokul_custom.trim() : null,
        ortaokul_mezun_yili: submitData.ortaokul_mezun_yili || null,
        
        lise_id: submitData.lise_id || null,
        lise_custom: submitData.lise_custom ? submitData.lise_custom.trim() : null,
        lise_mezun_yili: submitData.lise_mezun_yili || null,
        
        universite_durumu: submitData.universite_durumu || 'okumadi',
        universite_adi: submitData.universite_adi ? submitData.universite_adi.trim() : null,
        universite_bolum: submitData.universite_bolum ? submitData.universite_bolum.trim() : null,
        universite_mezun_yili: submitData.universite_mezun_yili || null,
        
        kvkk_onay: Boolean(submitData.kvkk_onay),
        aydinlatma_metni_onay: Boolean(submitData.aydinlatma_metni_onay)
      };
      
      console.log('Frontend - Gönderilen veri:', cleanedData); // Debug için
      
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
      <div className="min-h-screen flex items-center justify-center bg-black"> 
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-red-500 mx-auto"></div> 
          <p className="mt-4 text-gray-400 font-medium">Yükleniyor...</p> 
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6 lg:p-8"> 
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 pt-22 sm:pt-8"> 
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2"> 
            Yeni Üye Kayıt Formu
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto"> 
            Dernek yönetim sistemine katılın ve topluluğumuzun bir parçası olun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8"> {/* Responsive boşluk */}
          <PersonalInfoSection
            formData={formData}
            handleChange={handleChange}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />

          <ProfessionalInfoSection
            formData={formData}
            handleChange={handleChange}
            options={options}
          />

          {/* EducationInfoSection - Bu bileşenin stilinin ayrı olarak güncellenmesi gerekebilir. */}
          <EducationInfoSection
            formData={formData}
            handleChange={handleChange}
            onEducationDataChange={handleEducationDataChange}
            options={options} // Options prop'unu EducationInfoSection'a geçirin
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

          <div className="p-4 sm:p-6"> 
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 px-6 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base sm:text-lg" // Responsive padding, yuvarlatma, font boyutu
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div> {/* Responsive spinner boyutu */}
                  <span className="font-semibold">Kayıt oluşturuluyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiUserPlus className="mr-3 h-5 w-5" /> {/* Responsive ikon boyutu */}
                  <span className="font-semibold">Kayıt Ol</span>
                </div>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 sm:mt-8"> 
          <div className="p-4 sm:p-6"> {/* Koyu tema arka planı, responsive padding */}
            <p className="text-gray-300 text-sm sm:text-base"> {/* Metin rengi, responsive font boyutu */}
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/login" 
                className="text-red-500 hover:text-red-400 font-semibold transition-colors duration-200" // Metin rengi
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        {/* KVKK ve Aydınlatma Metni Modalları */}
        <Modal
          isOpen={showKvkkModal}
          onClose={() => setShowKvkkModal(false)}
          title="Kişisel Verilerin Korunması Kanunu (KVKK) Metni"
          content={kvkkTexts.kvkk_metni}
        />

        <Modal
          isOpen={showAydinlatmaModal}
          onClose={() => setShowAydinlatmaModal(false)}
          title="Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni"
          content={kvkkTexts.aydinlatma_metni}
        />
      </div>
    </div>
  );
};

export default Register;
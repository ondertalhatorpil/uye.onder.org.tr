import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { constantsService } from '../../services/api';
console.log(constantsService.getSektorler);
import { 
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiPhone, FiCalendar, FiMapPin, FiUserPlus 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  
  // Form state
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
    mezun_okul: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Eğer zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Sabit verileri yükle (sektör, komisyon)
  useEffect(() => {
    const loadConstants = async () => {
      try {
        const [sektorResponse, komisyonResponse] = await Promise.all([
          constantsService.getSektorler(),
          constantsService.getKomisyonlar()
        ]);

        setOptions(prev => ({
          ...prev,
          sektorler: sektorResponse.data || [],
          komisyonlar: komisyonResponse.data || []
        }));
      } catch (error) {
        console.error('Constants loading error:', error);
        toast.error('Sabit veriler yüklenemedi');
      }
    };

    loadConstants();
  }, []);

  // İlleri yükle
  useEffect(() => {
    const loadIller = async () => {
      setLoadingStates(prev => ({ ...prev, iller: true }));
      try {
        const response = await constantsService.getIller();
        setOptions(prev => ({
          ...prev,
          iller: response.data || []
        }));
      } catch (error) {
        console.error('İller loading error:', error);
        toast.error('İller yüklenemedi');
      } finally {
        setLoadingStates(prev => ({ ...prev, iller: false }));
      }
    };

    loadIller();
  }, []);

  // İl değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (formData.il) {
      const loadIlceler = async () => {
        setLoadingStates(prev => ({ ...prev, ilceler: true }));
        try {
          const response = await constantsService.getIlceler(formData.il);
          setOptions(prev => ({
            ...prev,
            ilceler: response.data || [],
            dernekler: [] // İl değişince dernekleri temizle
          }));
          // İlçe ve dernek seçimini temizle
          setFormData(prev => ({
            ...prev,
            ilce: '',
            gonullu_dernek: ''
          }));
        } catch (error) {
          console.error('İlçeler loading error:', error);
          toast.error('İlçeler yüklenemedi');
        } finally {
          setLoadingStates(prev => ({ ...prev, ilceler: false }));
        }
      };

      loadIlceler();
    } else {
      setOptions(prev => ({ ...prev, ilceler: [], dernekler: [] }));
      setFormData(prev => ({ ...prev, ilce: '', gonullu_dernek: '' }));
    }
  }, [formData.il]);

  // İlçe değiştiğinde dernekleri yükle
  useEffect(() => {
    if (formData.il && formData.ilce) {
      const loadDernekler = async () => {
        setLoadingStates(prev => ({ ...prev, dernekler: true }));
        try {
          const response = await constantsService.getDerneklerByLocation(formData.il, formData.ilce);
          setOptions(prev => ({
            ...prev,
            dernekler: response.data || []
          }));
          // Dernek seçimini temizle
          setFormData(prev => ({ ...prev, gonullu_dernek: '' }));
        } catch (error) {
          console.error('Dernekler loading error:', error);
          toast.error('Dernekler yüklenemedi');
        } finally {
          setLoadingStates(prev => ({ ...prev, dernekler: false }));
        }
      };

      loadDernekler();
    } else {
      setOptions(prev => ({ ...prev, dernekler: [] }));
      setFormData(prev => ({ ...prev, gonullu_dernek: '' }));
    }
  }, [formData.il, formData.ilce]);

  // Form değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePassword = (password) => {
    // En az 6 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const isLongEnough = password.length >= 6;
    
    return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough;
  };

  // Form validation
  const validateForm = () => {
    const errors = [];

    // Zorunlu alanlar kontrolü
    const requiredFields = [
      'isim', 'soyisim', 'email', 'password', 'dogum_tarihi',
      'sektor', 'meslek', 'telefon', 'il', 'ilce', 'gonullu_dernek',
      'calisma_komisyon', 'mezun_okul'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors.push(`${getFieldLabel(field)} zorunlu`);
      }
    });

    // Email kontrolü
    if (formData.email && !validateEmail(formData.email)) {
      errors.push('Geçerli bir email adresi girin');
    }

    // Telefon kontrolü
    if (formData.telefon && !validatePhone(formData.telefon)) {
      errors.push('Geçerli bir telefon numarası girin (05xxxxxxxxx)');
    }

    // Şifre kontrolü
    if (formData.password && !validatePassword(formData.password)) {
      errors.push('Şifre en az 6 karakter olmalı ve büyük harf, küçük harf, rakam içermeli');
    }

    // Şifre tekrar kontrolü
    if (formData.password !== formData.confirmPassword) {
      errors.push('Şifreler eşleşmiyor');
    }

    return errors;
  };

  const getFieldLabel = (field) => {
    const labels = {
      isim: 'İsim',
      soyisim: 'Soyisim',
      email: 'Email',
      password: 'Şifre',
      dogum_tarihi: 'Doğum tarihi',
      sektor: 'Sektör',
      meslek: 'Meslek',
      telefon: 'Telefon',
      il: 'İl',
      ilce: 'İlçe',
      gonullu_dernek: 'Gönüllü dernek',
      calisma_komisyon: 'Çalışma komisyonu',
      mezun_okul: 'Mezun okul'
    };
    return labels[field] || field;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // confirmPassword'u çıkar
      const { confirmPassword, ...submitData } = formData;
      
      const result = await register(submitData);
      
      if (result.success) {
        toast.success(result.message || 'Kayıt başarılı!');
        navigate('/', { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Kayıt sırasında hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 rounded-lg flex items-center justify-center">
            <img src="https://www.onder.org.tr/build/assets/search-bg-842c8fc7.svg" className='w-12 h-12' alt="" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Üye Kayıt Formu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Dernek yönetim sistemine katılın
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* İsim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İsim *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="isim"
                      value={formData.isim}
                      onChange={handleChange}
                      autoComplete="given-name"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İsminiz"
                    />
                  </div>
                </div>

                {/* Soyisim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyisim *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="soyisim"
                      value={formData.soyisim}
                      onChange={handleChange}
                      autoComplete="family-name"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Soyisminiz"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="05xxxxxxxxx"
                    />
                  </div>
                </div>

                {/* Doğum Tarihi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doğum Tarihi *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dogum_tarihi"
                      value={formData.dogum_tarihi}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Şifre */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Şifre Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Şifre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    En az 6 karakter, büyük/küçük harf ve rakam içermeli
                  </p>
                </div>

                {/* Şifre Tekrar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre Tekrar *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mesleki Bilgiler */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mesleki Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sektör */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör *
                  </label>
                  <select
                    name="sektor"
                    value={formData.sektor}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sektör seçiniz</option>
                    {options.sektorler.map(sektor => (
                      <option key={sektor} value={sektor}>{sektor}</option>
                    ))}
                  </select>
                </div>

                {/* Meslek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meslek *
                  </label>
                  <input
                    type="text"
                    name="meslek"
                    value={formData.meslek}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mesleğiniz"
                  />
                </div>

                {/* Mezun Okul */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mezun Olunan Okul *
                  </label>
                  <input
                    type="text"
                    name="mezun_okul"
                    value={formData.mezun_okul}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mezun olduğunuz okul"
                  />
                </div>
              </div>
            </div>

            {/* Lokasyon ve Dernek */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lokasyon ve Dernek Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* İl */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İl *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="il"
                      value={formData.il}
                      onChange={handleChange}
                      disabled={loadingStates.iller}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">İl seçiniz</option>
                      {options.iller.map(il => (
                        <option key={il} value={il}>{il}</option>
                      ))}
                    </select>
                    {loadingStates.iller && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe *
                  </label>
                  <select
                    name="ilce"
                    value={formData.ilce}
                    onChange={handleChange}
                    disabled={!formData.il || loadingStates.ilceler}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">İlçe seçiniz</option>
                    {options.ilceler.map(ilce => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                  {loadingStates.ilceler && (
                    <div className="flex justify-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Gönüllü Dernek */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gönüllü Olduğunuz Dernek *
                  </label>
                  <select
                    name="gonullu_dernek"
                    value={formData.gonullu_dernek}
                    onChange={handleChange}
                    disabled={!formData.ilce || loadingStates.dernekler}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Dernek seçiniz</option>
                    {options.dernekler.map(dernek => (
                      <option key={dernek.id} value={dernek.dernek_adi}>
                        {dernek.dernek_adi} ({dernek.uye_sayisi} üye)
                      </option>
                    ))}
                  </select>
                  {loadingStates.dernekler && (
                    <div className="flex justify-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Çalışma Komisyonu */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çalışma Komisyonu *
                  </label>
                  <select
                    name="calisma_komisyon"
                    value={formData.calisma_komisyon}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Komisyon seçiniz</option>
                    {options.komisyonlar.map(komisyon => (
                      <option key={komisyon} value={komisyon}>{komisyon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kayıt oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2 h-4 w-4" />
                    Kayıt Ol
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Zaten hesabınız var mı?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200"
                  >
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiArrowLeft, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    telefon: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sadece rakam girişine izin ver
    const cleanValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  // Telefon formatla (görüntülemek için)
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  // Form submit
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validasyon
  if (!formData.telefon) {
    toast.error('Telefon numarası gerekli');
    return;
  }

  if (formData.telefon.length < 10) {
    toast.error('Geçerli bir telefon numarası girin (10 haneli)');
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await api.post('/auth/forgot-password', {
      telefon: formData.telefon
    });

    console.log('API Response:', response);

    // Success case
    if (response && response.success) {
      toast.success(response.message);
      navigate('/verify-reset-code', { 
        state: { 
          telefon: formData.telefon,
          expiresIn: response.data?.expiresIn || 5
        } 
      });
    } else {
      // Unexpected response format
      toast.error('Beklenmeyen yanıt formatı');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Error response'dan mesaj al
    if (error.status === 429) {
      toast.error('Çok fazla istek. Lütfen bekleyin.');
    } else {
      toast.error(error.error || error.message || 'Bir hata oluştu');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Brand/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-1 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center">
            <img
              src="https://onder.org.tr/assets/images/statics/onder-logo.svg" 
              className='w-66 h-66' 
              alt="Logo" 
            />
            <div className="mt-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Şifrenizi mi unuttunuz?
              </h3>
              <p className="text-gray-400 text-lg max-w-md">
                Merak etmeyin, kayıtlı telefon numaranıza SMS kodu göndereceğiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <img 
              src="https://onder.org.tr/assets/images/statics/onder-logo.svg" 
              className='w-34 h-34' 
              alt="Logo" 
            />
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Şifremi Unuttum
            </h2>
            <p className="text-gray-400 text-sm">
              Kayıtlı telefon numaranızı girin, size SMS ile doğrulama kodu gönderelim.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-300 mb-2">
                Telefon Numarası
              </label>
              <div className="relative">
                <input
                  id="telefon"
                  name="telefon"
                  type="text"
                  autoComplete="tel"
                  required
                  value={formatPhone(formData.telefon)}
                  onChange={handleChange}
                  maxLength="13" // Format ile birlikte
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="5XX XXX XX XX"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Örnek: 555 123 45 67 (Başında 0 olmadan)
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
              <div className="text-sm text-blue-400">
                <strong>Bilgi:</strong> SMS kodu 5 dakika geçerli olacaktır. 
                Kodu almak için sistemde kayıtlı telefon numaranızı kullanın.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                  SMS gönderiliyor...
                </>
              ) : (
                <>
                  <FiSend className="mr-2 h-4 w-4" />
                  SMS Kodu Gönder
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-500">veya</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Şifrenizi hatırladınız mı?{' '}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-600">
              © 2025 ÖNDER. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
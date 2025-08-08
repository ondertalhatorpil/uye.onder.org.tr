import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State'den bilgileri al
  const resetToken = location.state?.resetToken;
  const email = location.state?.email;
  const telefon = location.state?.telefon;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // Eğer resetToken yoksa geri yönlendir
  useEffect(() => {
    if (!resetToken || !email) {
      toast.error('Geçersiz erişim. Şifre sıfırlama işlemini tekrar başlatın.');
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, email, navigate]);

  // Şifre gücünü değerlendir
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('En az 8 karakter olmalı');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Küçük harf içermeli');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Büyük harf içermeli');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Rakam içermeli');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Özel karakter içermeli');
    }

    return { score, feedback };
  };

  // Telefon formatla
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  // Form değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Şifre gücünü değerlendir
    if (name === 'newPassword') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

 // ResetPassword.jsx - handleSubmit düzeltmesi
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validasyon
  if (!formData.newPassword || !formData.confirmPassword) {
    toast.error('Tüm alanları doldurun');
    return;
  }

  if (formData.newPassword !== formData.confirmPassword) {
    toast.error('Şifreler eşleşmiyor');
    return;
  }

  if (formData.newPassword.length < 6) {
    toast.error('Şifre en az 6 karakter olmalıdır');
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await api.post('/auth/reset-password', {
      resetToken: resetToken,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });

    if (response && response.success) {
      toast.success(response.message);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } else {
      toast.error('Şifre güncellenirken hata oluştu');
    }
  } catch (error) {
    console.error('Reset password error:', error);
    toast.error(error.error || error.message || 'Şifre güncellenirken hata oluştu');
  } finally {
    setIsSubmitting(false);
  }
};

  // Şifre gücü renk ve metin
  const getPasswordStrengthInfo = (score) => {
    if (score === 0) return { color: 'text-gray-500', text: 'Şifre girin', bgColor: 'bg-gray-700' };
    if (score <= 2) return { color: 'text-red-400', text: 'Zayıf', bgColor: 'bg-red-500' };
    if (score <= 3) return { color: 'text-yellow-400', text: 'Orta', bgColor: 'bg-yellow-500' };
    if (score <= 4) return { color: 'text-blue-400', text: 'İyi', bgColor: 'bg-blue-500' };
    return { color: 'text-green-400', text: 'Güçlü', bgColor: 'bg-green-500' };
  };

  const strengthInfo = getPasswordStrengthInfo(passwordStrength.score);

  if (!resetToken || !email) {
    return null; // useEffect redirect eder
  }

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
                Yeni Şifrenizi Belirleyin
              </h3>
              <p className="text-gray-400 text-lg max-w-md">
                Güvenlik için güçlü bir şifre seçin ve şifrenizi kimseyle paylaşmayın.
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
              to="/verify-reset-code"
              state={{ telefon }}
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Geri dön
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Yeni Şifre Belirleyin
            </h2>
            <p className="text-gray-400 text-sm">
              <span className="font-mono text-blue-400">{email}</span> hesabı için 
              yeni şifrenizi belirleyin
            </p>
          </div>

          {/* Success Info */}
          <div className="rounded-lg bg-green-900/20 border border-green-800 p-4 mb-6">
            <div className="text-sm text-green-400">
              <strong>✓ SMS Doğrulama Başarılı</strong>
              <br />
              Artık yeni şifrenizi belirleyebilirsiniz.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Yeni şifrenizi girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Şifre Gücü:</span>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bgColor}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Öneriler: {passwordStrength.feedback.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className="text-xs text-green-400 flex items-center">
                      <FiCheck className="mr-1 h-3 w-3" />
                      Şifreler eşleşiyor
                    </div>
                  ) : (
                    <div className="text-xs text-red-400">
                      Şifreler eşleşmiyor
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
              <div className="text-sm text-blue-400">
                <strong>Şifre Gereksinimleri:</strong>
                <ul className="mt-2 text-xs space-y-1">
                  <li>• En az 6 karakter (önerilen 8+)</li>
                  <li>• Büyük ve küçük harf karışımı</li>
                  <li>• En az bir rakam</li>
                  <li>• Özel karakter (!@#$%^&* vb.)</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || formData.newPassword !== formData.confirmPassword || !formData.newPassword}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                  Şifre güncelleniyor...
                </>
              ) : (
                <>
                  <FiLock className="mr-2 h-4 w-4" />
                  Şifreyi Güncelle
                </>
              )}
            </button>

            {/* Info */}
            <div className="rounded-lg bg-yellow-900/20 border border-yellow-800 p-3">
              <div className="text-xs text-yellow-400 text-center">
                <strong>Güvenlik:</strong> Şifreniz güncellendikten sonra otomatik olarak 
                giriş sayfasına yönlendirileceksiniz.
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

export default ResetPassword;
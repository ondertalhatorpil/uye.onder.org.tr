import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  // State'den telefon numarasını al
  const telefon = location.state?.telefon;
  const initialExpiresIn = location.state?.expiresIn || 5;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialExpiresIn * 60); // saniye cinsinden
  const [canResend, setCanResend] = useState(false);

  // Eğer telefon numarası yoksa geri yönlendir
  useEffect(() => {
    if (!telefon) {
      toast.error('Önce telefon numaranızı girin');
      navigate('/forgot-password', { replace: true });
    }
  }, [telefon, navigate]);

  // Geri sayım timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Timer'ı formatla (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  // Input değişikliklerini handle et
  const handleInputChange = (index, value) => {
    // Sadece rakam girişine izin ver
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Otomatik bir sonraki input'a geç
      if (numericValue && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  // Backspace handle et
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Paste handle et
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (pastedText.length === 6) {
      const newCode = pastedText.split('');
      setCode(newCode);
      inputRefs[5].current?.focus();
    }
  };

  // Form submit
 const handleSubmit = async (e) => {
  e.preventDefault();

  const fullCode = code.join('');
  
  if (fullCode.length !== 6) {
    toast.error('Lütfen 6 haneli kodu tamamen girin');
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await api.post('/auth/verify-reset-code', {
      telefon: telefon,
      code: fullCode
    });

    if (response && response.success) {
      toast.success(response.message);
      navigate('/reset-password', { 
        state: { 
          resetToken: response.data.resetToken,
          email: response.data.email,
          telefon: response.data.telefon
        } 
      });
    } else {
      toast.error('Kod doğrulama başarısız');
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    }
  } catch (error) {
    console.error('Verify code error:', error);
    toast.error(error.error || error.message || 'Kod doğrulanırken hata oluştu');
    
    setCode(['', '', '', '', '', '']);
    inputRefs[0].current?.focus();
  } finally {
    setIsSubmitting(false);
  }
};

  // SMS yeniden gönder
  const handleResendSMS = async () => {
  setIsResending(true);

  try {
    const response = await api.post('/auth/forgot-password', {
      telefon: telefon
    });

    if (response && response.success) {
      toast.success('Yeni SMS kodu gönderildi');
      setTimeLeft(initialExpiresIn * 60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } else {
      toast.error('SMS gönderilirken hata oluştu');
    }
  } catch (error) {
    console.error('Resend SMS error:', error);
    toast.error(error.error || error.message || 'SMS gönderilirken hata oluştu');
  } finally {
    setIsResending(false);
  }
};

  if (!telefon) {
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
                SMS Doğrulaması
              </h3>
              <p className="text-gray-400 text-lg max-w-md">
                <span className="font-mono text-blue-400">{formatPhone(telefon)}</span> 
                <br />numarasına gönderdiğimiz 6 haneli kodu girin.
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
              to="/forgot-password"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Geri dön
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              SMS Kodunu Girin
            </h2>
            <p className="text-gray-400 text-sm">
              <span className="font-mono text-blue-400">{formatPhone(telefon)}</span> numarasına 
              gönderdiğimiz 6 haneli doğrulama kodunu girin
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Doğrulama Kodu
              </label>
              <div className="flex justify-center space-x-3 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-gray-400 text-sm">
                  Kod geçerlilik süresi: 
                  <span className="font-mono text-blue-400 ml-2">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-red-400 text-sm">
                  Kod süresi doldu. Yeni kod talep edin.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || code.join('').length !== 6}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2 h-4 w-4" />
                  Kodu Doğrula
                </>
              )}
            </button>

            {/* Resend SMS */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendSMS}
                disabled={!canResend || isResending}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200 inline-flex items-center"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent mr-2"></div>
                    SMS gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-2 h-3 w-3" />
                    {canResend ? 'Yeni SMS kodu gönder' : 'SMS kodunu yeniden gönder'}
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="rounded-lg bg-yellow-900/20 border border-yellow-800 p-3">
              <div className="text-xs text-yellow-400 text-center">
                <strong>İpucu:</strong> SMS almadıysanız spam klasörünü kontrol edin veya 
                birkaç dakika bekleyip tekrar deneyin.
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

export default VerifyResetCode;
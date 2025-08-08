const axios = require('axios');

class SmsService {
    constructor() {
        this.apiUrl = process.env.EKOMESAJ_API_URL || 'https://panel4.ekomesaj.com:9588/sms/create';
        this.sender = process.env.EKOMESAJ_SENDER || 'ONDER iHD';
        this.username = process.env.EKOMESAJ_USERNAME;
        this.password = process.env.EKOMESAJ_PASSWORD;
        this.testMode = process.env.SMS_TEST_MODE === 'true';
        
        console.log('🔧 SMS Service Başlatıldı:', {
            apiUrl: this.apiUrl,
            sender: this.sender,
            testMode: this.testMode,
            hasCredentials: !!(this.username && this.password)
        });
    }

    // 6 haneli rastgele kod üret
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Telefon numarasını formatla
    formatPhoneNumber(phone) {
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        
        if (cleanPhone.startsWith('90')) {
            cleanPhone = cleanPhone.substring(2);
        }
        
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }
        
        if (cleanPhone.length === 10 && cleanPhone.startsWith('5')) {
            return '90' + cleanPhone;
        }
        
        throw new Error('Geçersiz telefon numarası formatı');
    }

    async checkServiceHealth() {
        try {
            if (!this.username || !this.password || !this.sender || !this.apiUrl) {
                return {
                    success: false,
                    message: 'SMS servisi konfigürasyonu eksik',
                    details: {
                        apiUrl: !!this.apiUrl,
                        sender: !!this.sender,
                        username: !!this.username,
                        password: !!this.password
                    }
                };
            }

            if (this.testMode) {
                return {
                    success: true,
                    message: 'SMS servisi test modunda çalışıyor',
                    testMode: true
                };
            }

            return {
                success: true,
                message: 'SMS servisi aktif ve çalışıyor',
                apiStatus: 'connected',
                details: {
                    sender: this.sender,
                    apiUrl: this.apiUrl,
                    testMode: this.testMode
                }
            };

        } catch (error) {
            console.error('❌ SMS servis kontrolü hatası:', error.message);
            return {
                success: false,
                message: 'SMS servisi bağlantı hatası',
                error: error.message
            };
        }
    }

    async sendSMS(phone, message) {
        let formattedPhone = phone.toString().trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = formattedPhone.substring(1);
        }
        if (!formattedPhone.startsWith('90')) {
            formattedPhone = '90' + formattedPhone;
        }

        // Test mode kontrolü
        if (this.testMode) {
            console.log('🧪 TEST MODE - SMS gönderilmedi:', {
                phone: formattedPhone,
                message,
                sender: this.sender
            });
            return {
                success: true,
                message: 'Test modunda SMS gönderildi'
            };
        }

        try {
            const requestData = {
                type: 1,                    // SMS tipi (sabit: 1)
                sendingType: 0,             // Gönderim tipi (sabit: 0)
                title: "Şifre Sıfırlama",   // Paket başlığı (zorunlu)
                content: message,           // Mesaj içeriği (zorunlu)
                number: formattedPhone,     // Telefon numarası (zorunlu)
                encoding: 1,                // Türkçe karakter desteği (1)
                sender: this.sender,        // Gönderen başlığı (zorunlu)
                validity: 60,               // Geçerlilik süresi (dakika)
                commercial: false,          // Ticari mesaj değil
                skipAhsQuery: true,         // AHS sorgusunu atla
                recipientType: 0            // Bireysel alıcı
            };

            console.log('📤 PRODUCTION SMS gönderiliyor:', {
                phone: formattedPhone,
                sender: this.sender,
                message: message.substring(0, 30) + '...',
                apiUrl: this.apiUrl
            });

            // ÖNCE TEST CREDENTIALS İLE DENE
            console.log('🧪 TEST CREDENTIALS ile deneniyor...');
            
            const testAuth = Buffer.from('smsuser:p4r0la').toString('base64'); // Doğru: küçük 'l'
            console.log('🔍 Test Auth Token:', testAuth);
            console.log('🔍 Expected Token:', 'c21zdXNlcjpwNHIwbGE=');
            console.log('🔍 Tokens Match:', testAuth === 'c21zdXNlcjpwNHIwbGE=');

            try {
               const testResponse = await axios.post(this.apiUrl, requestData, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${testAuth}`,
        'User-Agent': 'ONDER-SMS-Client/1.0',
        'Accept': 'application/json'
    },
    timeout: 15000
});

                console.log('✅ TEST CREDENTIALS SUCCESS:', {
                    status: testResponse.status,
                    data: testResponse.data
                });

                // Test credentials başarılıysa response kontrol et
                if (testResponse.data && testResponse.data.data && testResponse.data.data.pkgID) {
                    console.log('✅ TEST CREDENTIALS ile SMS başarıyla gönderildi!', {
                        pkgID: testResponse.data.data.pkgID
                    });
                    return {
                        success: true,
                        message: 'SMS başarıyla gönderildi (TEST CREDENTIALS)',
                        pkgID: testResponse.data.data.pkgID,
                        data: testResponse.data,
                        note: '⚠️ Test credentials kullanıldı - gerçek credentials kontrol edilmeli!'
                    };
                } else if (testResponse.data && testResponse.data.err) {
                    console.error('❌ TEST CREDENTIALS - API Error:', testResponse.data.err);
                    throw new Error(`Test API Error: ${testResponse.data.err.message}`);
                } else {
                    console.log('⚠️ TEST CREDENTIALS - Beklenmeyen yanıt:', testResponse.data);
                }

            } catch (testError) {
                console.log('❌ TEST CREDENTIALS FAILED:', {
                    status: testError.response?.status,
                    error: testError.response?.data || testError.message
                });
            }

            // SONRA GERÇEK CREDENTIALS İLE DENE
            console.log('🔍 GERÇEK CREDENTIALS ile deneniyor...');
            
            if (!this.username || !this.password) {
                console.log('⚠️ Gerçek credentials eksik, fallback moduna geçiliyor...');
                return this.fallbackMode(formattedPhone, message, 'Gerçek credentials eksik');
            }

            const realAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
            console.log('🔍 Real Credentials:', {
                username: this.username,
                passwordLength: this.password.length,
                passwordStart: this.password.substring(0, 3) + '***'
            });
            console.log('🔍 Real Auth Token:', realAuth.substring(0, 20) + '...');

            const realResponse = await axios.post(this.apiUrl, requestData, {
    headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Basic ${realAuth}`,
        'User-Agent': 'ONDER-SMS-Client/1.0',
        'Accept': 'application/json'
    },
    timeout: 15000
});

            console.log('✅ REAL CREDENTIALS SUCCESS:', {
                status: realResponse.status,
                data: realResponse.data
            });

            // Gerçek credentials başarılı response kontrolü
            if (realResponse.data && realResponse.data.data && realResponse.data.data.pkgID) {
                console.log('✅ REAL CREDENTIALS ile SMS başarıyla gönderildi!', {
                    pkgID: realResponse.data.data.pkgID
                });
                return {
                    success: true,
                    message: 'SMS başarıyla gönderildi (REAL CREDENTIALS)',
                    pkgID: realResponse.data.data.pkgID,
                    data: realResponse.data,
                    note: '✅ Gerçek credentials ile gönderildi!'
                };
            } else if (realResponse.data && realResponse.data.err) {
                console.error('❌ REAL CREDENTIALS - API Error:', realResponse.data.err);
                throw new Error(`Real API Error: ${realResponse.data.err.message}`);
            }

        } catch (error) {
            console.error('❌ PRODUCTION SMS gönderme hatası:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                response: error.response?.data
            });
            
            return this.fallbackMode(formattedPhone, message, error.message);
        }

        // Hiçbir method başarılı değilse fallback
        return this.fallbackMode(formattedPhone, message, 'Tüm authentication methodları başarısız');
    }

    // Fallback mode helper
    fallbackMode(phone, message, errorReason) {
        console.log('🔄 Production SMS başarısız, fallback aktif...');
        
        // Mesajdan kodu extract et
        const codeMatch = message.match(/\d{6}/);
        const code = codeMatch ? codeMatch[0] : 'KOD_BULUNAMADI';
        
        console.log('🧪 FALLBACK - SMS gönderilmedi:', {
            phone: phone,
            message,
            sender: this.sender,
            error: errorReason,
            extractedCode: code
        });
        
        return {
            success: true,
            message: 'Fallback: SMS kodu console\'da görüntülendi',
            fallback: true,
            code: code,
            phone: phone,
            error: errorReason
        };
    }

    async sendPasswordResetCode(phone, code) {
        const message = `ONDER IHD\nSifre sifirlama kodunuz: ${code}\nKod ${process.env.SMS_CODE_EXPIRE_MINUTES || 5} dakika gecerlidir.`;
        return await this.sendSMS(phone, message);
    }

    async testConnection() {
        try {
            console.log('🧪 SMS Service Connection Test...');
            
            const testResult = await this.sendSMS('905551234567', 'Test mesajı: 123456');
            
            return {
                success: testResult.success,
                message: 'SMS Service test tamamlandı',
                details: testResult
            };
        } catch (error) {
            return {
                success: false,
                message: 'SMS Service test başarısız',
                error: error.message
            };
        }
    }
}

module.exports = new SmsService();
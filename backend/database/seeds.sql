USE dernek_system;

-- Super admin kullanıcısı
INSERT INTO users (isim, soyisim, email, password, role) VALUES 
('Super', 'Admin', 'admin@dernek.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Test dernekler
INSERT INTO dernekler (dernek_adi, dernek_baskani, dernek_kuruluş_tarihi) VALUES 
('İstanbul Esnaf Derneği', 'Ahmet Yılmaz', '2010-05-15'),
('Ankara Teknoloji Derneği', 'Mehmet Öz', '2015-03-20'),
('İzmir Sağlık Derneği', 'Ayşe Kaya', '2012-08-10');

-- Test kullanıcılar
INSERT INTO users (isim, soyisim, email, password, il, ilce, sektor, meslek, gonullu_dernek) VALUES 
('Ali', 'Veli', 'ali@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'İstanbul', 'Kadıköy', 'Teknoloji', 'Yazılım Geliştirici', 'İstanbul Esnaf Derneği'),
('Fatma', 'Nur', 'fatma@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ankara', 'Çankaya', 'Sağlık', 'Hemşire', 'Ankara Teknoloji Derneği');
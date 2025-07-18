-- Database oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS dernek_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dernek_system;

-- Users tablosu
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  isim VARCHAR(100) NOT NULL,
  soyisim VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dogum_tarihi DATE,
  sektor VARCHAR(100),
  meslek VARCHAR(150),
  telefon VARCHAR(15),
  il VARCHAR(50),
  ilce VARCHAR(50),
  gonullu_dernek VARCHAR(200),
  calisma_komisyon TEXT,
  mezun_okul VARCHAR(200),
  role ENUM('super_admin', 'dernek_admin', 'uye') DEFAULT 'uye',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_gonullu_dernek (gonullu_dernek),
  INDEX idx_il_ilce (il, ilce),
  INDEX idx_sektor (sektor)
);

-- Dernekler tablosu
CREATE TABLE dernekler (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dernek_adi VARCHAR(200) NOT NULL UNIQUE,
  dernek_logosu VARCHAR(255),
  dernek_baskani VARCHAR(100),
  dernek_kuruluş_tarihi DATE,
  dernek_sosyal_medya_hesaplari JSON,
  dernek_telefon VARCHAR(15),
  admin_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dernek_adi (dernek_adi),
  INDEX idx_admin_user (admin_user_id)
);

ALTER TABLE faaliyet_paylasimlar ADD COLUMN (
  durum ENUM('beklemede', 'onaylandi', 'reddedildi') DEFAULT 'beklemede',
  onaylayan_admin_id INT NULL,
  onay_tarihi TIMESTAMP NULL,
  red_nedeni TEXT NULL,
  
  FOREIGN KEY (onaylayan_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_durum (durum),
  INDEX idx_onaylayan_admin (onaylayan_admin_id),
  INDEX idx_onay_tarihi (onay_tarihi)
);

-- Mevcut faaliyetleri otomatik onaylı yap (geçmiş veriler için)
UPDATE faaliyet_paylasimlar 
SET durum = 'onaylandi', 
    onay_tarihi = created_at 
WHERE durum = 'beklemede';
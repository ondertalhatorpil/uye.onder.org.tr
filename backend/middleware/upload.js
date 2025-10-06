const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörlerini oluştur
const uploadDirs = [
  './uploads/temp',
  './uploads/dernek-logos', 
  './uploads/faaliyet-images',
  './uploads/kilavuz'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==================== EXCEL UPLOAD ====================
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueName = `excel-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadExcel = multer({
  storage: excelStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir'), false);
    }
  }
}).single('excel');

const handleExcelUpload = (req, res, next) => {
  uploadExcel(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          error: 'Dosya boyutu çok büyük (Max: 10MB)' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Dosya yükleme hatası: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};

// ==================== FALİYET RESİMLERİ ====================
const faaliyetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/faaliyet-images');
  },
  filename: (req, file, cb) => {
    const uniqueName = `faaliyet-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadFaaliyetImages = multer({
  storage: faaliyetStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (jpg, jpeg, png, gif)'), false);
    }
  }
}).array('images', 5);

const handleFaaliyetImageUpload = (req, res, next) => {
  uploadFaaliyetImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          error: 'Dosya boyutu çok büyük (Max: 5MB per file)' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          success: false, 
          error: 'Çok fazla dosya (Max: 5 dosya)' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Dosya yükleme hatası: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};

// ==================== DERNEK LOGOSU ====================
const dernekLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/dernek-logos');
  },
  filename: (req, file, cb) => {
    const uniqueName = `logo-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadDernekLogo = multer({
  storage: dernekLogoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (jpg, jpeg, png, gif)'), false);
    }
  }
}).single('logo');

const handleDernekLogoUpload = (req, res, next) => {
  uploadDernekLogo(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          error: 'Logo boyutu çok büyük (Max: 2MB)' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Logo yükleme hatası: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};


const kilavuzStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/kilavuz');
  },
  filename: (req, file, cb) => {
    const uniqueName = `kilavuz-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadKilavuzImage = multer({
  storage: kilavuzStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (jpg, jpeg, png, gif, webp)'), false);
    }
  }
}).single('gorsel'); // 'gorsel' field name olarak kullanacağız

const handleKilavuzImageUpload = (req, res, next) => {
  uploadKilavuzImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          error: 'Görsel boyutu çok büyük (Max: 5MB)' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Görsel yükleme hatası: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};

module.exports = { 
  handleExcelUpload, 
  handleFaaliyetImageUpload,
  handleDernekLogoUpload,
  handleKilavuzImageUpload
};
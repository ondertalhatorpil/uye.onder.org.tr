import React, { useState, useRef, useCallback } from 'react';
import { FiX, FiCheck, FiSquare } from 'react-icons/fi';

const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  imageFile, 
  onCropComplete 
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });
  const [selectedFormat, setSelectedFormat] = useState('16:9'); // Sadece 16:9
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const formatPresets = {
    '16:9': { ratio: 16/9, icon: FiSquare, label: 'Yatay (16:9)' }
  };

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      
      // Initial crop area - center the crop
      const containerWidth = 400;
      const containerHeight = 300;
      const ratio = formatPresets[selectedFormat].ratio;
      
      let cropWidth, cropHeight;
      if (ratio >= 1) {
        cropWidth = Math.min(200, containerWidth - 100);
        cropHeight = cropWidth / ratio;
      } else {
        cropHeight = Math.min(200, containerHeight - 100);
        cropWidth = cropHeight * ratio;
      }
      
      setCropArea({
        x: (containerWidth - cropWidth) / 2,
        y: (containerHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
      
      setImageLoaded(true);
    }
  }, [selectedFormat]);

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
    
    if (imageRef.current) {
      const containerWidth = 400;
      const containerHeight = 300;
      const ratio = formatPresets[format].ratio;
      
      let cropWidth, cropHeight;
      if (ratio >= 1) {
        cropWidth = Math.min(200, containerWidth - 100);
        cropHeight = cropWidth / ratio;
      } else {
        cropHeight = Math.min(200, containerHeight - 100);
        cropWidth = cropHeight * ratio;
      }
      
      setCropArea(prev => ({
        ...prev,
        width: cropWidth,
        height: cropHeight
      }));
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const container = document.getElementById('crop-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  // Global mouse events
  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      const container = document.getElementById('crop-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      // Boundaries check
      const maxX = 400 - cropArea.width;
      const maxY = 300 - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const getCroppedImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Calculate scale factors
    const containerWidth = 400;
    const containerHeight = 300;
    const scaleX = img.naturalWidth / containerWidth;
    const scaleY = img.naturalHeight / containerHeight;
    
    // Set canvas size to crop area size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Draw cropped image
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }, [cropArea]);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob && onCropComplete) {
      onCropComplete(croppedBlob, selectedFormat);
    }
    onClose();
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Resmi Düzenle</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selection - Kaldırıldı çünkü sadece 16:9 var */}
        
        {/* Crop Area */}
        <div className="p-4">
          <div 
            id="crop-container"
            className="relative mx-auto bg-gray-900 rounded-lg overflow-hidden"
            style={{ height: '300px', width: '400px' }}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={URL.createObjectURL(imageFile)}
              alt="Crop preview"
              className="w-full h-full object-contain pointer-events-none"
              onLoad={handleImageLoad}
              draggable={false}
              style={{ display: 'block' }}
            />
            
            {/* Crop Overlay */}
            {imageLoaded && (
              <>
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
                
                {/* Crop area */}
                <div
                  className="absolute border-2 border-white cursor-move bg-transparent select-none"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`
                  }}
                  onMouseDown={handleMouseDown}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full pointer-events-none" />
                  
                  {/* Center indicator */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full pointer-events-none" />
                </div>
              </>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-2 text-center">
            Kırpma alanını sürükleyerek hareket ettirin
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#FA2C37] text-white rounded-lg hover:bg-[#d62731] transition-colors flex items-center justify-center gap-2"
          >
            <FiCheck className="h-4 w-4" />
            Uygula
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropModal;
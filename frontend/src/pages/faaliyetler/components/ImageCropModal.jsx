import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiX, FiCheck, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  imageFile, 
  onCropComplete 
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  
  // Responsive crop area - smaller on mobile
  const getCropArea = () => {
    const isMobile = window.innerWidth < 640;
    const containerWidth = isMobile ? 350 : 400;
    const containerHeight = isMobile ? 262 : 300;
    const cropWidth = isMobile ? 280 : 300;
    const cropHeight = Math.round(cropWidth / (16/9));
    
    return {
      containerWidth,
      containerHeight,
      x: (containerWidth - cropWidth) / 2,
      y: (containerHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };
  };

  const cropArea = getCropArea();

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    
    console.log('Image load event fired');
    console.log('Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
    
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.log('Waiting for natural dimensions...');
      setTimeout(handleImageLoad, 100);
      return;
    }
    
    const natural = { width: img.naturalWidth, height: img.naturalHeight };
    setNaturalDimensions(natural);
    
    // Calculate initial scale to fit image nicely
    const containerWidth = 400;
    const containerHeight = 300;
    
    const scaleX = containerWidth / natural.width;
    const scaleY = containerHeight / natural.height;
    const initialScale = Math.max(scaleX, scaleY) * 1.1; // Fill container nicely
    
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(true);
    
    console.log('Image setup complete:', { natural, initialScale });
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Touch event handlers
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch - drag
      setIsTouching(true);
      setIsDragging(true);
      setDragStart({
        x: touches[0].clientX - position.x,
        y: touches[0].clientY - position.y
      });
    } else if (touches.length === 2) {
      // Two finger pinch - zoom
      setIsTouching(true);
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(touches));
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (!isTouching) return;
    
    if (touches.length === 1 && isDragging) {
      // Single touch drag
      const newX = touches[0].clientX - dragStart.x;
      const newY = touches[0].clientY - dragStart.y;
      
      const maxOffset = 200;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY))
      });
    } else if (touches.length === 2) {
      // Pinch zoom
      const newDistance = getTouchDistance(touches);
      if (lastTouchDistance > 0) {
        const scaleChange = newDistance / lastTouchDistance;
        setScale(prev => Math.max(0.1, Math.min(3, prev * scaleChange)));
      }
      setLastTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsTouching(false);
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Optional: Add boundaries to prevent dragging too far
    const maxOffset = 200;
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleZoom = (direction) => {
    setScale(prev => {
      const factor = direction === 'in' ? 1.2 : 0.8;
      return Math.max(0.1, Math.min(3, prev * factor));
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.95 : 1.05;
    setScale(prev => Math.max(0.1, Math.min(3, prev * factor)));
  };

  const getCroppedImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !imageLoaded) return null;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set output canvas size to crop dimensions
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Calculate image dimensions and position in container
    const containerWidth = 400;
    const containerHeight = 300;
    
    const scaledWidth = naturalDimensions.width * scale;
    const scaledHeight = naturalDimensions.height * scale;
    
    // Image center position in container
    const imageCenterX = containerWidth / 2 + position.x;
    const imageCenterY = containerHeight / 2 + position.y;
    
    // Image top-left in container
    const imageLeft = imageCenterX - scaledWidth / 2;
    const imageTop = imageCenterY - scaledHeight / 2;
    
    // Calculate crop area relative to the actual image
    const cropRelX = (cropArea.x - imageLeft) / scale;
    const cropRelY = (cropArea.y - imageTop) / scale;
    const cropRelWidth = cropArea.width / scale;
    const cropRelHeight = cropArea.height / scale;
    
    // Ensure crop coordinates are within image bounds
    const sourceX = Math.max(0, Math.min(naturalDimensions.width - 1, cropRelX));
    const sourceY = Math.max(0, Math.min(naturalDimensions.height - 1, cropRelY));
    const sourceWidth = Math.max(1, Math.min(cropRelWidth, naturalDimensions.width - sourceX));
    const sourceHeight = Math.max(1, Math.min(cropRelHeight, naturalDimensions.height - sourceY));
    
    // Draw the cropped image
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
    } catch (error) {
      console.error('Error drawing image:', error);
      return null;
    }
    
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [scale, position, imageLoaded, naturalDimensions]);

  // Create a new image element to get dimensions first
  useEffect(() => {
    if (!isOpen || !imageFile || imageLoaded) return;

    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    
    img.onload = () => {
      console.log('Image dimensions loaded:', img.width, 'x', img.height);
      
      const natural = { width: img.width, height: img.height };
      setNaturalDimensions(natural);
      
      // Calculate initial scale - responsive
      const crop = getCropArea();
      const scaleX = crop.containerWidth / natural.width;
      const scaleY = crop.containerHeight / natural.height;
      const initialScale = Math.max(scaleX, scaleY) * 1.1;
      
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(true);
      
      console.log('Setup complete:', { natural, initialScale });
    };
    
    img.onerror = (error) => {
      console.error('Image load error:', error);
    };
    
    img.src = imageUrl;

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [isOpen, imageFile, imageLoaded]);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob && onCropComplete) {
      onCropComplete(croppedBlob, '16:9');
    }
    onClose();
  };

  if (!isOpen || !imageFile) return null;

  const imageUrl = URL.createObjectURL(imageFile);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h3 className="text-base sm:text-lg font-bold text-white">Fotoğrafı Düzenle</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tools */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleZoom('out')}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                title="Uzaklaştır"
              >
                <FiZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <div className="text-xs sm:text-sm font-medium text-gray-300 min-w-[50px] sm:min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </div>
              
              <button
                onClick={() => handleZoom('in')}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                title="Yakınlaştır"
              >
                <FiZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="text-xs text-gray-400 text-right hidden sm:block">
              <div>Görüntüyü sürükleyin</div>
              <div>Tekerlek ile zum yapın</div>
            </div>
            
            <div className="text-xs text-gray-400 text-right sm:hidden">
              <div>Sürükle & Yakınlaştır</div>
            </div>
          </div>
        </div>

        {/* Main Edit Area */}
        <div className="p-3 sm:p-6">
          <div 
            ref={containerRef}
            className="relative mx-auto bg-black rounded-xl overflow-hidden cursor-move select-none touch-none"
            style={{ 
              width: `${cropArea.containerWidth}px`, 
              height: `${cropArea.containerHeight}px` 
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image */}
            {imageLoaded ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Edit"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                  style={{ 
                    width: `${naturalDimensions.width}px`,
                    height: `${naturalDimensions.height}px`,
                    maxWidth: 'none',
                    maxHeight: 'none'
                  }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div>Yükleniyor...</div>
                </div>
              </div>
            )}
            
            {/* Crop Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(to right, 
                      rgba(0,0,0,0.8) ${cropArea.x}px, 
                      transparent ${cropArea.x}px, 
                      transparent ${cropArea.x + cropArea.width}px, 
                      rgba(0,0,0,0.8) ${cropArea.x + cropArea.width}px
                    ),
                    linear-gradient(to bottom, 
                      rgba(0,0,0,0.8) ${cropArea.y}px, 
                      transparent ${cropArea.y}px, 
                      transparent ${cropArea.y + cropArea.height}px, 
                      rgba(0,0,0,0.8) ${cropArea.y + cropArea.height}px
                    )
                  `
                }}
              />
              
              {/* Crop frame */}
              <div
                className="absolute border-2 border-white rounded-sm"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height
                }}
              >
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-400">
            <div className="sm:hidden">Sürükle • İki parmakla yakınlaştır</div>
            <div className="hidden sm:block">16:9 formatında kırpılacak • Görüntüyü konumlandırın</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors text-sm sm:text-base"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!imageLoaded}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#FA2C37] hover:bg-[#d62731] disabled:bg-gray-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FiCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Uygula
          </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropModal;
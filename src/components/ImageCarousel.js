"use client";
import { useState, useEffect, useCallback } from 'react';
import { downloadImage, isMobileDevice } from '@/utils/mobileDownload';

export default function ImageCarousel({ images, productName, autoSlideInterval = 5000, compact = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, autoSlideInterval]);

  // Pause auto-play on hover/touch
  const handleMouseEnter = useCallback(() => {
    if (images.length > 1) {
      setIsAutoPlaying(false);
    }
  }, [images.length]);

  const handleMouseLeave = useCallback(() => {
    if (images.length > 1) {
      setIsAutoPlaying(true);
    }
  }, [images.length]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after manual navigation
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Touch/swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Lightbox navigation
  const openLightbox = () => {
    setShowLightbox(true);
    setIsAutoPlaying(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setIsAutoPlaying(true);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Handle mobile-friendly image download
  const handleDownloadImage = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    setDownloadMessage('');
    
    const filename = `${productName}-image-${currentIndex + 1}.jpg`;
    
    try {
      await downloadImage(images[currentIndex].url, filename, {
        onSuccess: (message) => {
          setDownloadMessage(message);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        onError: (error) => {
          setDownloadMessage(error);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        showInstructions: true
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadMessage('Download failed. Please try again.');
      setTimeout(() => setDownloadMessage(''), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Zoom functionality
  const handleZoom = (newZoomLevel) => {
    const clampedZoom = Math.max(1, Math.min(5, newZoomLevel));
    setZoomLevel(clampedZoom);
    if (clampedZoom === 1) {
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Pan functionality
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom functionality
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    handleZoom(zoomLevel + delta);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className={`${compact ? 'w-8 h-8' : 'w-16 h-16'} mx-auto text-gray-400 mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className={`${compact ? 'text-xs' : 'text-sm'}`}>No image</p>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-full h-full">
        <img
          src={images[0].url}
          alt={productName}
          className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity duration-200"
          onClick={openLightbox}
          title="Click to view full size"
        />
        
        {/* Lightbox Modal for Single Image */}
        {showLightbox && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <img
                src={images[0].url}
                alt={productName}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
                aria-label="Close lightbox"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div 
        className="relative w-full h-full group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <div className="w-full h-full overflow-hidden">
          <img
            src={images[currentIndex].url}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out cursor-pointer hover:opacity-95"
            onClick={openLightbox}
            title="Click to view full size"
          />
        </div>

        {/* Navigation Arrows - Hidden on mobile, visible on hover */}
        {!compact && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </>
        )}

        {/* Mobile Navigation Dots - Always visible on mobile */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2 sm:w-3 sm:h-3'} rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Image Counter - Hidden on mobile, visible on hover */}
        {!compact && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Auto-play Indicator */}
        {!compact && isAutoPlaying && images.length > 1 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Auto</span>
          </div>
        )}

        {/* Mobile Swipe Indicator - Only on mobile */}
        {!compact && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full sm:hidden">
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
              <span>Swipe</span>
            </span>
          </div>
        )}

        {/* Full-screen Button */}
        {!compact && (
          <button
            onClick={openLightbox}
            className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
            aria-label="View full screen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
            </svg>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div 
            className="relative max-w-full max-h-full overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* Main Image */}
            <img
              src={images[currentIndex].url}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                transformOrigin: 'center'
              }}
            />
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
              aria-label="Close lightbox"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className={`absolute top-4 right-16 text-white hover:text-gray-300 transition-colors duration-200 ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Download image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>

            {/* Lightbox Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
              aria-label="Previous image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
              aria-label="Next image"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            {/* Lightbox Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Download Message */}
            {downloadMessage && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg max-w-xs text-center">
                {downloadMessage}
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 text-white rounded-lg p-2">
              <button
                onClick={() => handleZoom(zoomLevel - 0.5)}
                disabled={zoomLevel <= 1}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span className="text-sm min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => handleZoom(zoomLevel + 0.5)}
                disabled={zoomLevel >= 5}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors duration-200"
                aria-label="Reset zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16m0-16L4 20"></path>
                </svg>
              </button>
            </div>

            {/* Lightbox Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

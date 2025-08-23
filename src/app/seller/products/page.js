"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerLanguage } from '../SellerLanguageContext';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import NotusButton from '@/components/NotusButton';
import { generateMultiProductUrl } from '@/utils/productUtils';

export default function SellerProducts() {
  const router = useRouter();
  const languageContext = useSellerLanguage();
  const { language } = languageContext || { language: 'en' };
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [multiProductSelection, setMultiProductSelection] = useState(new Set());
  const [imageIndices, setImageIndices] = useState({});
  const [autoSlideIntervals, setAutoSlideIntervals] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    
    // Check database health first
    checkDatabaseHealth().then(() => {
      fetchProducts(u.id);
    }).catch(() => {
      // If health check fails, still try to fetch products
      fetchProducts(u.id);
    });
  }, [router]);

  async function checkDatabaseHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        console.log('Database health check passed');
        return true;
      }
    } catch (error) {
      console.log('Database health check failed:', error);
    }
    return false;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setDeleteConfirm(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-slide effect for products with multiple images
  useEffect(() => {
    products.forEach(product => {
      if (product.images && product.images.length > 1) {
        startAutoSlide(product.id, product.images);
      }
    });

    // Cleanup function to stop all intervals
    return () => {
      Object.keys(autoSlideIntervals).forEach(productId => {
        stopAutoSlide(productId);
      });
    };
  }, [products]); // Re-run when products change

  const toggleMultiProductSelection = (productId) => {
    setMultiProductSelection(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAllForMultiProduct = () => {
    setMultiProductSelection(new Set(products.map(p => p.id)));
  };

  const clearMultiProductSelection = () => {
    setMultiProductSelection(new Set());
  };

  // Image Carousel Functions
  const updateProductImageIndex = (productId, newIndex) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  };

  const startAutoSlide = (productId, images) => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const currentIndex = prev[productId] || 0;
        const newIndex = (currentIndex + 1) % images.length;
        return {
          ...prev,
          [productId]: newIndex
        };
      });
    }, 5000); // 5 seconds

    setAutoSlideIntervals(prev => ({
      ...prev,
      [productId]: interval
    }));
  };

  const stopAutoSlide = (productId) => {
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId]);
      setAutoSlideIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[productId];
        return newIntervals;
      });
    }
  };

  const pauseAutoSlide = (productId) => {
    stopAutoSlide(productId);
  };

  const resumeAutoSlide = (productId, images) => {
    if (images.length > 1) {
      startAutoSlide(productId, images);
    }
  };

  const generateMultiProductLink = () => {
    if (multiProductSelection.size === 0) {
      showToast(
        language === 'ms' 
          ? 'Sila pilih sekurang-kurangnya satu produk' 
          : 'Please select at least one product', 
        'error'
      );
      return;
    }
    
    const productIds = Array.from(multiProductSelection);
    const multiProductUrl = generateMultiProductUrl(productIds);
    const fullUrl = `${window.location.origin}${multiProductUrl}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(
      language === 'ms' 
        ? `Pautan multi-produk berjaya disalin! (${productIds.length} produk)` 
        : `Multi-product link copied successfully! (${productIds.length} products)`, 
      'success'
    );
  };

  function fetchProducts(sellerId, retryCount = 0) {
    console.log('Fetching products for sellerId:', sellerId, 'retry:', retryCount);
    
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
      signal: controller.signal
    })
      .then(res => {
        console.log('API Response status:', res.status);
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Database temporarily unavailable. Retrying...');
          }
          if (res.status === 500) {
            throw new Error('Database connection error. Please try again.');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('API Response data:', data);
        if (data.error) {
          console.error('API Error:', data.error);
          
          // Retry on database connection errors (up to 3 times)
          if ((data.code === 'P1001' || data.error.includes('Database connection') || data.retryable) && retryCount < 3) {
            console.log(`Retrying... Attempt ${retryCount + 1}/3`);
            showToast(
              language === 'ms' 
                ? `Pangkalan data tidak tersedia. Mencuba semula... (${retryCount + 1}/3)`
                : `Database unavailable. Retrying... (${retryCount + 1}/3)`,
              'error'
            );
            setTimeout(() => {
              fetchProducts(sellerId, retryCount + 1);
            }, 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          
          showToast(`Error fetching products: ${data.error}`, 'error');
          setProducts([]);
          clearTimeout(timeoutId);
        } else {
          setProducts(data.products || []);
        }
        setLoading(false);
        clearTimeout(timeoutId);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        clearTimeout(timeoutId);
        
        // Retry on network errors (up to 3 times)
        if (retryCount < 3) {
          console.log(`Retrying... Attempt ${retryCount + 1}/3`);
          setTimeout(() => {
            fetchProducts(sellerId, retryCount + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        showToast(`Failed to fetch products: ${error.message}`, 'error');
        setProducts([]);
        setLoading(false);
      });
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleProductSelect(productId) {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length);
  }

  function handleSelectAll() {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
      setSelectAll(true);
    }
  }

  function copySelectedLinks() {
    if (selectedProducts.size === 0) {
      showToast(language === 'ms' ? 'Sila pilih produk terlebih dahulu' : 'Please select products first', 'error');
      return;
    }

    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    
    // Create a clean, shareable format with proper line breaks and clear separation
    const formattedText = selectedProductsData.map((product, index) => 
      `${index + 1}. ${product.name}\n   Link: ${window.location.origin}/product/${product.id}`
    ).join('\n\n');
    
    // Add header and footer for clarity
    const finalText = `=== PRODUCT LINKS ===\n\n${formattedText}\n\n=== END ===`;
    
    // Copy the formatted text
    navigator.clipboard.writeText(finalText).then(() => {
      showToast(
        language === 'ms' 
          ? `${selectedProducts.size} pautan produk berjaya disalin!` 
          : `${selectedProducts.size} product links copied successfully!`, 
        'success'
      );
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(
        language === 'ms' 
          ? `${selectedProducts.size} pautan produk berjaya disalin!` 
          : `${selectedProducts.size} product links copied successfully!`, 
        'success'
      );
    });
  }

  function copyUrlsOnly() {
    if (selectedProducts.size === 0) {
      showToast(language === 'ms' ? 'Sila pilih produk terlebih dahulu' : 'Please select products first', 'error');
      return;
    }

    const selectedProductsData = products.filter(p => selectedProducts.has(p.id));
    
    // Create clean URL list with proper separation and clear formatting
    const urlList = selectedProductsData.map(product => 
      `${window.location.origin}/product/${product.id}`
    ).join('\n');
    
    // Add clear header and footer for better separation
    const finalText = `=== PRODUCT URLS ===\n\n${urlList}\n\n=== END ===`;
    
    navigator.clipboard.writeText(finalText).then(() => {
      showToast(
        language === 'ms' 
          ? `${selectedProducts.size} URL sahaja berjaya disalin!` 
          : `${selectedProducts.size} URLs only copied successfully!`, 
        'success'
      );
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(
        language === 'ms' 
          ? `${selectedProducts.size} URL sahaja berjaya disalin!` 
          : `${selectedProducts.size} URLs only copied successfully!`, 
        'success'
      );
    });
  }

  function copySingleUrl(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const singleUrl = `${window.location.origin}/product/${productId}`;
    
    navigator.clipboard.writeText(singleUrl).then(() => {
      showToast(
        language === 'ms' 
          ? 'Pautan produk berjaya disalin!' 
          : 'Product link copied successfully!', 
        'success'
      );
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = singleUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(
        language === 'ms' 
          ? 'Pautan produk berjaya disalin!' 
          : 'Product link copied successfully!', 
        'success'
      );
    });
  }

  function clearSelection() {
    setSelectedProducts(new Set());
    setSelectAll(false);
  }

  function previewSelectedLinks() {
    if (selectedProducts.size === 0) {
      showToast(language === 'ms' ? 'Sila pilih produk terlebih dahulu' : 'Please select products first', 'error');
      return;
    }
    setShowPreview(true);
  }

  function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    fetch('/api/seller/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sellerId: JSON.parse(localStorage.getItem('currentUser')).id }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(language === 'ms' ? 'Produk berjaya dipadamkan!' : 'Product deleted successfully!', 'success');
          // Refresh the products list
          const u = JSON.parse(localStorage.getItem('currentUser'));
          fetchProducts(u.id);
        } else {
          showToast(data.error || 'Failed to delete product', 'error');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
      });
  }

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {language === 'ms' ? 'Produk Saya' : 'My Products'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {language === 'ms' ? 'Urus produk anda' : 'Manage your products'}
            </p>
            {/* Connection Status Indicator */}
            {loading && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-600">
                  {language === 'ms' ? 'Menyambung ke pangkalan data...' : 'Connecting to database...'}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">

            
            <Link href="/seller/dashboard/create-product">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                ADD PRODUCT
              </button>
            </Link>
          </div>
        </div>

        {/* Enhanced Multi-Product Link Section */}
        {products.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {language === 'ms' ? 'Salin Pautan Multi-Produk' : 'Copy Multi-Product Link'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'ms' 
                  ? 'Pilih produk yang anda mahu sertakan dalam pautan'
                  : 'Select products you want to include in the link'
                }
              </p>
              
              <div className="flex items-center justify-center space-x-3 mb-4">
                <button
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <i className="fas fa-list-check"></i>
                  {showProductSelector 
                    ? (language === 'ms' ? 'Tutup Pemilih' : 'Close Selector')
                    : (language === 'ms' ? 'Pilih Produk' : 'Select Products')
                  }
                </button>
                
                {multiProductSelection.size > 0 && (
                  <button
                    onClick={generateMultiProductLink}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <i className="fas fa-copy text-lg"></i>
                    {language === 'ms' 
                      ? `Salin Pautan (${multiProductSelection.size})` 
                      : `Copy Link (${multiProductSelection.size})`
                    }
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              {showProductSelector && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={selectAllForMultiProduct}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      {language === 'ms' ? 'Pilih Semua' : 'Select All'}
                    </button>
                    <button 
                      onClick={clearMultiProductSelection}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      {language === 'ms' ? 'Kosongkan' : 'Clear All'}
                    </button>
                  </div>
                  <p className="text-sm text-purple-700 mt-2 text-center">
                    {language === 'ms' 
                      ? `Dipilih: ${multiProductSelection.size} daripada ${products.length} produk`
                      : `Selected: ${multiProductSelection.size} of ${products.length} products`
                    }
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {language === 'ms' 
                  ? 'Format: /multi-products/15,14 (pautan pendek dan bersih)'
                  : 'Format: /multi-products/15,14 (short and clean link)'
                }
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <svg className="w-16 h-16 sm:w-20 sm:w-20 lg:w-24 lg:h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2">
              {language === 'ms' ? 'Tiada Produk' : 'No Products Yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {language === 'ms' ? 'Mula jualan dengan menambah produk pertama anda' : 'Start selling by adding your first product'}
            </p>
            <Link href="/seller/dashboard/create-product">
              <NotusButton variant="success" size="lg">
                {language === 'ms' ? 'Tambah Produk Pertama' : 'Add First Product'}
              </NotusButton>
            </Link>
          </div>
        ) : products.length === 0 && loading ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2">
              {language === 'ms' ? 'Menyambung ke Pangkalan Data' : 'Connecting to Database'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {language === 'ms' ? 'Sila tunggu sementara kami menyambung ke pangkalan data...' : 'Please wait while we connect to the database...'}
            </p>
            <button
              onClick={() => {
                const u = JSON.parse(localStorage.getItem('currentUser'));
                if (u) fetchProducts(u.id);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {language === 'ms' ? 'Cuba Semula' : 'Retry Connection'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
            {products.map((product) => (
              <div key={product.id} className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 relative ${
                showProductSelector && multiProductSelection.has(product.id)
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200'
              }`}>

                
                {/* Product Image Carousel */}
                <div className="aspect-square overflow-hidden rounded-t-lg relative group">
                  {/* Multi-Product Selection Checkbox */}
                  {showProductSelector && (
                    <div className="absolute top-2 left-2 z-20">
                      <input
                        type="checkbox"
                        id={`multi-product-${product.id}`}
                        checked={multiProductSelection.has(product.id)}
                        onChange={() => toggleMultiProductSelection(product.id)}
                        className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2 shadow-lg"
                      />
                    </div>
                  )}
                  
                                     {/* Image Carousel */}
                   {product.images && product.images.length > 0 ? (
                     <div 
                       className="relative w-full h-full"
                       onMouseEnter={() => pauseAutoSlide(product.id)}
                       onMouseLeave={() => resumeAutoSlide(product.id, product.images)}
                       onTouchStart={(e) => {
                         const touch = e.touches[0];
                         e.currentTarget.touchStartX = touch.clientX;
                         e.currentTarget.touchStartY = touch.clientY;
                       }}
                       onTouchEnd={(e) => {
                         const touch = e.changedTouches[0];
                         const touchStartX = e.currentTarget.touchStartX;
                         const touchStartY = e.currentTarget.touchStartY;
                         const touchEndX = touch.clientX;
                         const touchEndY = touch.clientY;
                         
                         const deltaX = touchEndX - touchStartX;
                         const deltaY = touchEndY - touchStartY;
                         
                         // Only handle horizontal swipes (ignore vertical swipes)
                         if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                           if (deltaX > 0) {
                             // Swipe right - go to previous image
                             const currentIndex = imageIndices[product.id] || 0;
                             const newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
                             updateProductImageIndex(product.id, newIndex);
                           } else {
                             // Swipe left - go to next image
                             const currentIndex = imageIndices[product.id] || 0;
                             const newIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
                             updateProductImageIndex(product.id, newIndex);
                           }
                           // Pause auto-slide temporarily
                           pauseAutoSlide(product.id);
                           setTimeout(() => resumeAutoSlide(product.id, product.images), 3000);
                         }
                       }}
                     >
                                             {/* Main Image Display */}
                       <img
                         src={product.images[imageIndices[product.id] || 0]?.url || product.images[0].url}
                         alt={product.name}
                         className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                       />
                      
                      {/* Navigation Arrows (only show if multiple images) */}
                      {product.images.length > 1 && (
                        <>
                                                     {/* Left Arrow */}
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               const currentIndex = imageIndices[product.id] || 0;
                               const newIndex = currentIndex === 0 
                                 ? product.images.length - 1 
                                 : currentIndex - 1;
                               updateProductImageIndex(product.id, newIndex);
                               // Pause auto-slide temporarily when manually navigating
                               pauseAutoSlide(product.id);
                               setTimeout(() => resumeAutoSlide(product.id, product.images), 3000);
                             }}
                             className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                           >
                             <i className="fas fa-chevron-left text-sm"></i>
                           </button>
                           
                           {/* Right Arrow */}
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               const currentIndex = imageIndices[product.id] || 0;
                               const newIndex = currentIndex === product.images.length - 1 
                                 ? 0 
                                 : currentIndex + 1;
                               updateProductImageIndex(product.id, newIndex);
                               // Pause auto-slide temporarily when manually navigating
                               pauseAutoSlide(product.id);
                               setTimeout(() => resumeAutoSlide(product.id, product.images), 3000);
                             }}
                             className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                           >
                             <i className="fas fa-chevron-right text-sm"></i>
                           </button>
                        </>
                      )}
                      
                                             {/* Image Counter */}
                       {product.images.length > 1 && (
                         <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                           {(imageIndices[product.id] || 0) + 1} / {product.images.length}
                         </div>
                       )}
                      
                                             {/* Auto-play Indicator */}
                       {product.images.length > 1 && (
                         <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                           <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                           Auto
                         </div>
                       )}
                       
                       {/* Touch Instructions for Mobile */}
                       <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <i className="fas fa-hand-pointer mr-1"></i>
                         Swipe
                       </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-green-600 font-bold text-sm sm:text-base mb-2 sm:mb-3">
                    RM {product.price.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Stock Status */}
                  <div className="mb-2 sm:mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-3">
                    {/* Copy Single Link Button - Full Width */}
                    <button
                      onClick={() => copySingleUrl(product.id)}
                      className="btn btn-sm btn-outline w-full group hover:scale-105 transition-all duration-200 hover:bg-purple-50 hover:border-purple-300"
                    >
                      <i className="fas fa-link mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                      {language === 'ms' ? 'Salin Pautan' : 'Copy Link'}
                    </button>
                    
                    {/* View Button - Full Width */}
                    <Link href={`/seller/product/${product.id}`} className="w-full">
                      <button className="btn btn-sm btn-primary w-full group hover:scale-105 transition-all duration-200">
                        <i className="fas fa-eye mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                        {language === 'ms' ? 'Lihat' : 'View'}
                      </button>
                    </Link>
                    
                    {/* Edit and Delete Buttons - Side by Side */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/seller/dashboard/edit-product/${product.id}`} className="w-full">
                        <button className="btn btn-sm btn-warning w-full group hover:scale-105 transition-all duration-200">
                          <i className="fas fa-edit mr-2 group-hover:rotate-12 transition-transform duration-200"></i>
                          {language === 'ms' ? 'Edit' : 'Edit'}
                        </button>
                      </Link>
                      
                      <button 
                        className="btn btn-sm btn-danger w-full group hover:scale-105 transition-all duration-200"
                        onClick={() => setDeleteConfirm(product.id)}
                      >
                        <i className="fas fa-trash mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                        {language === 'ms' ? 'Padam' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <i className={`fas ${toast.type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}`}></i>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}





        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'ms' ? 'Sahkan Padaman' : 'Confirm Deletion'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'ms' 
                  ? 'Adakah anda pasti mahu memadamkan produk ini? Tindakan ini tidak boleh dibatalkan.' 
                  : 'Are you sure you want to delete this product? This action cannot be undone.'
                }
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button 
                  className="btn btn-outline group hover:scale-105 transition-all duration-200"
                  onClick={() => setDeleteConfirm(null)}
                >
                  <i className="fas fa-times mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </button>
                <button 
                  className="btn btn-danger group hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    handleDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                >
                  <i className="fas fa-trash mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                  {language === 'ms' ? 'Padam' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
} 
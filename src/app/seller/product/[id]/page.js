"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { downloadImage, isMobileDevice } from '@/utils/mobileDownload';

export default function SellerProductView() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [images, setImages] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProduct();
    }
  }, [user, productId]);

  // Handle mobile-friendly image download
  const handleDownloadImage = async (imageUrl, imageIndex) => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    setDownloadMessage('');
    
    const filename = `${product?.name || 'product'}-image-${imageIndex + 1}.jpg`;
    
    try {
      await downloadImage(imageUrl, filename, {
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

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/product/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      console.log('Product API response:', data); // Debug log
      
      if (data.product) {
        // Verify the product belongs to the current seller
        if (data.product.sellerId !== user?.id) {
          console.log('Product seller ID:', data.product.sellerId, 'User ID:', user?.id);
          setUnauthorizedAccess(true);
          setProduct(data.product);
          setSeller(data.seller);
          setImages(data.product.images || []);
        } else {
          setProduct(data.product);
          setSeller(data.seller);
          setImages(data.product.images || []);
        }
        
        console.log('Images set:', data.product.images); // Debug log
      } else {
        console.log('No product found for ID:', productId);
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/seller/dashboard/edit-product/${productId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/seller/dashboard');
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/product/${productId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Product link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">This product doesn't exist or doesn't belong to you.</p>
          <div className="bg-gray-100 p-4 rounded mb-4 text-left text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Product ID: {productId}</p>
            <p>User ID: {user?.id}</p>
            <p>User Type: {user?.userType}</p>
          </div>
          <button 
            onClick={handleBackToDashboard}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold flex items-center gap-2 mx-auto"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const quantityLeft = product.quantity;
  const shippingPrice = product.shippingPrice;
  const price = product.price;
  const outOfStock = quantityLeft === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Warning Banner */}
        {unauthorizedAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span className="text-yellow-800 text-sm font-medium">Warning: This product doesn't belong to your account</span>
            </div>
            <p className="text-yellow-600 text-xs mt-1">You can view this product, but you cannot edit it.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button 
                onClick={handleShareLink}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <i className="fas fa-link text-sm"></i>
                Copy Share Link
              </button>
              <button 
                onClick={handleEdit}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                  unauthorizedAccess 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:shadow-none transform-none' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600'
                }`}
                disabled={unauthorizedAccess}
              >
                <i className="fas fa-edit text-sm"></i>
                Edit Product
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <i className="fas fa-arrow-left text-sm"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
          
          {/* Product Status */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              outOfStock 
                ? 'bg-red-100 text-red-800' 
                : quantityLeft <= 5 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
            }`}>
              {outOfStock ? 'Out of Stock' : quantityLeft <= 5 ? 'Low Stock' : 'In Stock'}
            </div>
            <div className="text-xs text-gray-600">
              Created: {new Date(product.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 mt-2">
            <strong>Debug:</strong> Images count: {images ? images.length : 'null'}, 
            Product ID: {product.id}, 
            Seller ID: {product.sellerId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Product Images */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3">Product Images</h2>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img 
                      src={img.url} 
                      alt={`Product ${i + 1}`} 
                      className="w-full h-24 sm:h-32 lg:h-48 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', img.url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500" style={{ display: 'none' }}>
                      Image {i + 1}
                    </div>
                    
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadImage(img.url, i)}
                      disabled={isDownloading}
                      className={`absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 ${
                        isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Download image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4 sm:py-6 text-sm">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                No images uploaded
                <div className="text-xs text-gray-400 mt-1">
                  Debug: {images ? `${images.length} images found` : 'images is null/undefined'}
                </div>
              </div>
            )}
            
            {/* Download Message */}
            {downloadMessage && (
              <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm">
                {downloadMessage}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3">Product Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-2 sm:p-3 rounded text-sm">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">RM{price}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Shipping Price</label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">RM{shippingPrice}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                    outOfStock ? 'text-red-600' : quantityLeft <= 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {quantityLeft} units
                  </span>
                  {quantityLeft <= 5 && quantityLeft > 0 && (
                    <span className="text-yellow-600 text-xs">⚠️ Low stock warning</span>
                  )}
                  {outOfStock && (
                    <span className="text-red-600 text-xs">⚠️ Out of stock</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded text-xs sm:text-sm">#{product.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow mt-4">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={handleEdit}
              disabled={unauthorizedAccess}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
                unauthorizedAccess 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:shadow-none transform-none' 
                  : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-edit text-xl text-black"></i>
                </div>
                <div className="font-semibold text-sm mb-1">Edit Product</div>
                <div className="text-xs opacity-80">Update details & images</div>
              </div>
            </button>
            
            <button 
              onClick={handleShareLink}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-share-alt text-xl text-white"></i>
                </div>
                <div className="font-semibold text-sm mb-1">Share Product</div>
                <div className="text-xs opacity-80">Copy link to share</div>
              </div>
            </button>
            
            <button 
              onClick={handleBackToDashboard}
              className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg sm:col-span-2 lg:col-span-1"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-chart-line text-xl text-white"></i>
                </div>
                <div className="font-semibold text-sm mb-1">View Dashboard</div>
                <div className="text-xs opacity-80">Manage all products</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
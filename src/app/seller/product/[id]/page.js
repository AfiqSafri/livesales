"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/product/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      if (data.product) {
        // Verify the product belongs to the current seller
        if (data.product.sellerId !== user?.id) {
          console.log('Product seller ID:', data.product.sellerId, 'User ID:', user?.id);
          setUnauthorizedAccess(true);
          setProduct(data.product);
          setSeller(data.seller);
          setImages(data.images || []);
        } else {
          setProduct(data.product);
          setSeller(data.seller);
          setImages(data.images || []);
        }
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Warning Banner */}
        {unauthorizedAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span className="text-yellow-800 font-medium">Warning: This product doesn't belong to your account</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">You can view this product, but you cannot edit it.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex gap-3">
              <button 
                onClick={handleShareLink}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Copy Share Link
              </button>
                             <button 
                 onClick={handleEdit}
                 className={`px-4 py-2 rounded ${
                   unauthorizedAccess 
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                     : 'bg-yellow-500 text-black hover:bg-yellow-600'
                 }`}
                 disabled={unauthorizedAccess}
               >
                 Edit Product
               </button>
              <button 
                onClick={handleBackToDashboard}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          
          {/* Product Status */}
          <div className="flex gap-4 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              outOfStock 
                ? 'bg-red-100 text-red-800' 
                : quantityLeft <= 5 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
            }`}>
              {outOfStock ? 'Out of Stock' : quantityLeft <= 5 ? 'Low Stock' : 'In Stock'}
            </div>
                         <div className="text-sm text-gray-600">
               Created: {new Date(product.createdAt).toLocaleDateString('en-US', {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
               })}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img.url} 
                    alt={`Product ${i + 1}`} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No images uploaded
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-2xl font-bold text-green-600">RM{price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Price</label>
                  <p className="text-lg font-semibold text-gray-900">RM{shippingPrice}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    outOfStock ? 'text-red-600' : quantityLeft <= 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {quantityLeft} units
                  </span>
                  {quantityLeft <= 5 && quantityLeft > 0 && (
                    <span className="text-yellow-600 text-sm">⚠️ Low stock warning</span>
                  )}
                  {outOfStock && (
                    <span className="text-red-600 text-sm">⚠️ Out of stock</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">#{product.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleEdit}
              className="bg-yellow-500 text-black p-4 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">✏️</div>
                <div className="font-medium">Edit Product</div>
                <div className="text-sm text-gray-600">Update details & images</div>
              </div>
            </button>
            
            <button 
              onClick={handleShareLink}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-medium">Share Product</div>
                <div className="text-sm text-blue-100">Copy link to share</div>
              </div>
            </button>
            
            <button 
              onClick={handleBackToDashboard}
              className="bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">View Dashboard</div>
                <div className="text-sm text-gray-300">Manage all products</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
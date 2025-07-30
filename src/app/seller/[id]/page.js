"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PublicSellerProfile() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id;
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
  }, [router]);

  useEffect(() => {
    if (!sellerId || !user) return;
    setLoading(true);
    fetch('/api/seller/public-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.seller) {
          setSeller(data.seller);
          setProducts(data.products || []);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [sellerId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
          <p className="text-gray-600 mb-6">The seller you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Livesalez</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                {seller.profileImage ? (
                  <img 
                    src={seller.profileImage} 
                    alt={seller.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {seller.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{seller.name}</h1>
                <p className="text-blue-100 text-lg">
                  {seller.bio || 'Professional seller on Livesalez'}
                </p>
                {seller.email && (
                  <p className="text-blue-200 text-sm mt-2">
                    📧 {seller.email}
                  </p>
                )}
                {seller.phone && (
                  <p className="text-blue-200 text-sm">
                    📞 {seller.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/register?from=seller&seller=${sellerId}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Share link copied to clipboard!');
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                  </svg>
                  <span>Share Profile</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.quantity > 0).length}
                </div>
                <div className="text-gray-600">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {products.reduce((total, p) => total + p.quantity, 0)}
                </div>
                <div className="text-gray-600">Total Units</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <span className="text-gray-500">{products.length} products available</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600">This seller hasn't added any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            RM{product.price}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            {product.quantity} units
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button 
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">© 2025 Livesalez. All rights reserved.</p>
          <p className="text-sm text-gray-500">Powered by MyTech Padu Solutions</p>
        </div>
      </div>
    </div>
  );
} 
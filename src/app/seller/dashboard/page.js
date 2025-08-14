"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDiscountInfo } from '@/utils/productUtils';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchProducts(currentUser.id);
  }, [router]);

  const fetchProducts = async (userId) => {
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch products');
        return;
      }
      
      setProducts(data.products);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    if (!user || !user.id) {
      alert('User session not found. Please log in again.');
      return;
    }
    
    try {
      const requestBody = { 
        productId: Number(productId), 
        userId: Number(user.id) 
      };
      console.log('Sending delete request:', requestBody);
      console.log('User object:', user);
      
      const res = await fetch('/api/seller/delete-product', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Seller Dashboard</h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage your products and track your sales</p>
            </div>
            <button
              onClick={() => router.push('/seller/dashboard/create-product')}
              className="w-full sm:w-auto bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span className="hidden sm:inline">Add New Product</span>
                <span className="sm:hidden">Add Product</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Bank Account Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Bank Account</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Setup Required</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/seller/bank-account')}
                className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium text-center sm:text-left"
              >
                <span className="hidden sm:inline">Configure Now →</span>
                <span className="sm:hidden">Setup →</span>
              </button>
            </div>
          </div>

          {/* Total Products Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Products</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          {/* In Stock Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Stock</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {products.filter(p => p.quantity > 0).length}
                </p>
              </div>
            </div>
          </div>

          {/* Active Discounts Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Discounts</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {products.filter(p => p.discountPercentage > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Out of Stock Card - Full Width on Mobile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Out of Stock</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Products ({products.length})</h2>
              
              {/* View Mode Toggle - Only show when there are products */}
              {products.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Grid view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {products.length === 0 ? (
            <div className="px-3 sm:px-4 lg:px-6 py-8 sm:py-12 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">Start selling by adding your first product</p>
              <button
                onClick={() => router.push('/seller/dashboard/create-product')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
                  {products.map((product) => {
                    const discountInfo = formatDiscountInfo(product);
                    const finalPrice = discountInfo ? discountInfo.discountedPrice : product.price;
                    
                    return (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        {/* Product Image */}
                        <div className="mb-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="w-full h-32 sm:h-40 object-cover rounded-lg"
                              src={product.images[0].url}
                              alt={product.name}
                            />
                          ) : (
                            <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{product.description}</p>
                          
                          {/* Price */}
                          <div className="text-sm">
                            {discountInfo && discountInfo.isValid ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-red-600">
                                    RM {finalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    RM {product.price.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-xs text-green-600">
                                  {discountInfo.discountLabel}
                                </div>
                              </div>
                            ) : (
                              <span className="font-semibold text-gray-900">RM {product.price.toFixed(2)}</span>
                            )}
                          </div>
                          
                          {/* Stock Status */}
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.quantity} units
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => router.push(`/seller/dashboard/edit-product/${product.id}`)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Desktop Table View */}
              {viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => {
                        const discountInfo = formatDiscountInfo(product);
                        const finalPrice = discountInfo ? discountInfo.discountedPrice : product.price;
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
                                      src={product.images[0].url}
                                      alt={product.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3 sm:ml-4">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">{product.name}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {discountInfo && discountInfo.isValid ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-red-600">
                                        RM {finalPrice.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-gray-500 line-through">
                                        RM {product.price.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-green-600">
                                      {discountInfo.discountLabel}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-semibold">RM {product.price.toFixed(2)}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.quantity} units
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => router.push(`/seller/dashboard/edit-product/${product.id}`)}
                                  className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
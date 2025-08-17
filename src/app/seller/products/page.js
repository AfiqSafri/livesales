"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerLanguage } from '../SellerLanguageContext';

export default function SellerProducts() {
  const router = useRouter();
  const languageContext = useSellerLanguage();
  const { language } = languageContext || { language: 'en' };
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchProducts(u.id);

    // Add click outside handler for delete modal
    const handleClickOutside = (event) => {
      if (deleteConfirm && !event.target.closest('.delete-modal')) {
        setDeleteConfirm(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [router, deleteConfirm]);

  function fetchProducts(sellerId) {
    setLoading(true);
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }

  const handleDelete = async (productId, productName) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/seller/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: productId, 
          sellerId: user.id 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove product from local state
        setProducts(products.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product');
    }
    
    setDeleteConfirm(null);
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Product link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Product link copied to clipboard!');
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen text-gray-900">
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900">Your Products</h1>
          <p className="text-base lg:text-lg mb-6 lg:mb-8 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="p-2 sm:p-3 lg:p-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-gray-900">Your Products</h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">{products.length} products</p>
        
        {products.length === 0 ? (
          <div className="text-center py-4 sm:py-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p className="text-sm font-medium mb-2 text-gray-900">No products found</p>
            <button 
              onClick={() => router.push('/seller/dashboard/create-product')} 
              className="mt-2 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border transition-colors duration-300 bg-white border-gray-200 hover:shadow-md">
                <div className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-0 sm:mr-2 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold mb-1 text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm font-bold text-green-600 mb-1">RM{product.price} per unit</p>
                      <p className="text-xs text-gray-600">Quantity: {product.quantity}</p>
                    </div>
                  </div>
                  
                  {/* Button Grid - Ultra Compact Layout */}
                  <div className="grid grid-cols-2 gap-1">
                    <button 
                      onClick={() => copyToClipboard(`${window.location.origin}/product/${product.id}`)} 
                      className="bg-blue-600 text-white px-1 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Share
                    </button>
                    <button 
                      onClick={() => router.push(`/seller/product/${product.id}`)} 
                      className="bg-green-600 text-white px-1 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => router.push(`/seller/dashboard/edit-product/${product.id}`)} 
                      className="bg-yellow-600 text-white px-1 py-1.5 rounded text-xs font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ id: product.id, name: product.name })} 
                      className="bg-red-600 text-white px-1 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-2 z-50">
          <div className="delete-modal bg-white rounded-lg p-3 max-w-sm w-full mx-2 shadow-2xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-xs text-gray-600 mb-3">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-2 py-1.5 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}
                className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
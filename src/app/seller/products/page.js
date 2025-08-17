"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerLanguage } from '../SellerLanguageContext';
import ProfessionalButton from '../../../components/ProfessionalButton';

export default function SellerProducts() {
  const router = useRouter();
  const languageContext = useSellerLanguage();
  const { language } = languageContext || { language: 'en' };
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    fetchProducts(u.id);
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setDeleteConfirm(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function fetchProducts(sellerId) {
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      });
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
          alert('Product deleted successfully!');
          fetchProducts(JSON.parse(localStorage.getItem('currentUser')).id);
        } else {
          alert('Error deleting product: ' + data.error);
        }
      });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-1 sm:p-2 lg:p-6">
        {/* Header */}
        <div className="mb-2 sm:mb-3 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              {language === 'ms' ? 'Produk Saya' : 'My Products'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'ms' ? 'Kelola produk anda' : 'Manage your products'}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Link href="/seller/dashboard/create-product">
              <ProfessionalButton variant="success" size="medium" icon="➕">
                {language === 'ms' ? 'Tambah Produk' : 'Add Product'}
              </ProfessionalButton>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2">
              {language === 'ms' ? 'Tiada Produk' : 'No Products Yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {language === 'ms' ? 'Mula jualan dengan menambah produk pertama anda' : 'Start selling by adding your first product'}
            </p>
            <Link href="/seller/dashboard/create-product">
              <ProfessionalButton variant="success" size="large">
                {language === 'ms' ? 'Tambah Produk Pertama' : 'Add First Product'}
              </ProfessionalButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Product Image */}
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
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
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <Link href={`/seller/product/${product.id}`}>
                      <ProfessionalButton variant="primary" size="small" fullWidth>
                        {language === 'ms' ? 'Lihat' : 'View'}
                      </ProfessionalButton>
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      <Link href={`/seller/dashboard/edit-product/${product.id}`}>
                        <ProfessionalButton variant="warning" size="small" fullWidth>
                          {language === 'ms' ? 'Edit' : 'Edit'}
                        </ProfessionalButton>
                      </Link>
                      
                      <ProfessionalButton 
                        variant="danger" 
                        size="small" 
                        fullWidth
                        onClick={() => setDeleteConfirm(product.id)}
                      >
                        {language === 'ms' ? 'Padam' : 'Delete'}
                      </ProfessionalButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <ProfessionalButton 
                  variant="outline" 
                  size="medium"
                  onClick={() => setDeleteConfirm(null)}
                  fullWidth
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </ProfessionalButton>
                <ProfessionalButton 
                  variant="danger" 
                  size="medium"
                  onClick={() => {
                    handleDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  fullWidth
                >
                  {language === 'ms' ? 'Padam' : 'Delete'}
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
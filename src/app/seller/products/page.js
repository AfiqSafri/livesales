"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerLanguage } from '../SellerLanguageContext';

export default function SellerProducts() {
  const router = useRouter();
  const { language } = useSellerLanguage();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchProducts(u.id);
  }, [router]);

  function fetchProducts(sellerId) {
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Your Products</h1>
        <p className="text-lg mb-8 text-gray-600">{products.length} products</p>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p className="text-lg font-medium mb-4 text-gray-900">No products found</p>
            <button onClick={() => router.push('/seller/dashboard/create-product')} className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">Create Product</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-24 h-24 mr-4 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt={product.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">{product.name}</h3>
                      <p className="text-2xl font-bold text-green-600 mb-2">RM{product.price} per unit</p>
                      <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { const url = `${window.location.origin}/product/${product.id}`; navigator.clipboard.writeText(url); alert('Product link copied to clipboard!'); }} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Share</button>
                    <button onClick={() => router.push(`/seller/product/${product.id}`)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">View</button>
                    <button onClick={() => router.push(`/seller/dashboard/edit-product/${product.id}`)} className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">Edit</button>
                    <button onClick={() => { /* handle delete with confirmation */ }} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
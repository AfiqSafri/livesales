"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SellerSidebar() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (window.location.pathname.includes('/seller/products')) setActiveTab('products');
    else if (window.location.pathname.includes('/seller/orders')) setActiveTab('orders');
    else setActiveTab('dashboard');
  }, []);

  return (
    <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'} lg:block bg-gray-800 text-white`}>
      <div className="p-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mb-6 p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div className="space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); router.push('/seller/dashboard'); }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-700'}`}
            title={sidebarCollapsed ? 'Dashboard' : ''}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('products'); router.push('/seller/products'); }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-700'}`}
            title={sidebarCollapsed ? 'Products' : ''}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              {!sidebarCollapsed && <span>Products</span>}
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); router.push('/seller/orders'); }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-300 hover:bg-gray-700'}`}
            title={sidebarCollapsed ? 'Orders' : ''}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              {!sidebarCollapsed && <span>Orders</span>}
            </div>
          </button>
        </div>
        {/* Create Product Button */}
        {!sidebarCollapsed && (
          <div className="mt-6">
            <button
              onClick={() => router.push('/seller/dashboard/create-product')}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Product
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
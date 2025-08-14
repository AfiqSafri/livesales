"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (pathname?.includes('/seller/products')) setActiveTab('products');
    else if (pathname?.includes('/seller/sales-reports')) setActiveTab('sales-reports');
    else if (pathname?.includes('/seller/order-history')) setActiveTab('order-history');
    else if (pathname?.includes('/seller/orders')) setActiveTab('orders');
    else if (pathname?.includes('/seller/subscription')) setActiveTab('subscription');
    else setActiveTab('dashboard');
  }, [pathname]);

  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    router.push(path);
    setMobileMenuOpen(false);
  };

  const isSellerPage = pathname?.startsWith('/seller/');

  return (
    <>
      {/* Simple Mobile Menu Button */}
      {isSellerPage && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Enhanced Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          transition-all duration-300 ease-in-out 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xl
          border-r border-blue-500
        `}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Header with Create Product Button at Top */}
          <div className={`mb-6 ${sidebarCollapsed ? 'mb-8' : ''}`}>
            {/* Create Product Button - Enhanced for collapsed state */}
            <button
              onClick={() => {
                router.push('/seller/dashboard/create-product');
                setMobileMenuOpen(false);
              }}
              className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:transform hover:scale-105 ${
                sidebarCollapsed 
                  ? 'p-3 flex items-center justify-center' 
                  : 'px-4 py-3'
              }`}
              title={sidebarCollapsed ? 'Create Product' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={`p-1 bg-white bg-opacity-20 rounded-lg ${sidebarCollapsed ? 'p-1.5' : ''}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-lg">Create Product</span>}
              </div>
            </button>
            
            {/* Enhanced Collapse Button */}
            <div className="hidden lg:block mt-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full p-2 rounded-lg hover:bg-blue-500 transition-all duration-200 text-white hover:shadow-md ${
                  sidebarCollapsed ? 'hover:bg-blue-400' : ''
                }`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className={`w-5 h-5 mx-auto transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Navigation Menu */}
          <nav className={`flex-1 space-y-3 ${sidebarCollapsed ? 'space-y-4' : ''}`}>
            <button
              onClick={() => handleNavigation('dashboard', '/seller/dashboard')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Dashboard' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Dashboard</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('products', '/seller/products')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'products' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Products' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'products' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Products</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('orders', '/seller/orders')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'orders' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Orders' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'orders' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Orders</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('sales-reports', '/seller/sales-reports')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'sales-reports' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Sales Reports' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'sales-reports' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Sales Reports</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('order-history', '/seller/order-history')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'order-history' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Order History' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'order-history' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Order History</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('subscription', '/seller/subscription')}
              className={`w-full text-left rounded-xl transition-all duration-200 group ${
                activeTab === 'subscription' 
                  ? 'bg-white text-blue-600 font-semibold shadow-lg transform scale-105' 
                  : 'text-white hover:bg-blue-500 hover:shadow-md hover:transform hover:scale-102'
              } ${sidebarCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-4 py-3'}`}
              title={sidebarCollapsed ? 'Subscription' : ''}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className={`rounded-lg transition-all duration-200 ${
                  activeTab === 'subscription' 
                    ? 'bg-blue-100' 
                    : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
                } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                  <svg className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                {!sidebarCollapsed && <span className="text-base">Subscription</span>}
              </div>
            </button>
          </nav>

          {/* Bottom Spacing for Collapsed State */}
          {sidebarCollapsed && (
            <div className="flex-1"></div>
          )}
        </div>
      </div>
    </>
  );
} 
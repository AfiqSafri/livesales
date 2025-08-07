"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Auto-collapse sidebar on small screens
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial width
    setWindowWidth(window.innerWidth);
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.location.pathname.includes('/seller/products')) setActiveTab('products');
    else if (window.location.pathname.includes('/seller/sales-reports')) setActiveTab('sales-reports');
    else if (window.location.pathname.includes('/seller/order-history')) setActiveTab('order-history');
    else if (window.location.pathname.includes('/seller/orders')) setActiveTab('orders');
    else if (window.location.pathname.includes('/seller/subscription')) setActiveTab('subscription');
    else setActiveTab('dashboard');
  }, []);

  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    router.push(path);
    setMobileMenuOpen(false); // Close mobile menu on navigation
  };

  // Only show mobile menu on actual seller pages
  const isSellerPage = pathname?.startsWith('/seller/');
  const shouldShowMobileMenu = isSellerPage;
  const isSmallScreen = windowWidth < 1024;
  const isMediumScreen = windowWidth >= 1024 && windowWidth < 1280;
  const isLargeScreen = windowWidth >= 1280;

  // Auto-expand sidebar on hover for medium screens when collapsed
  const shouldAutoExpand = isMediumScreen && sidebarCollapsed && isHovered;

  return (
    <>
      {/* Mobile Menu Overlay */}
      {shouldShowMobileMenu && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button - Only show on seller pages */}
      {shouldShowMobileMenu && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          transition-all duration-300 ease-in-out 
          ${shouldShowMobileMenu && mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed && !shouldAutoExpand ? 'w-16' : 'w-64'} 
          bg-gray-800 text-white shadow-xl lg:shadow-none
          border-r border-gray-700
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Desktop Collapse Button */}
          <div className="hidden lg:block">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="mb-6 p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className={`w-6 h-6 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Close Button */}
          {shouldShowMobileMenu && (
            <div className="lg:hidden flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="text-lg font-bold">Livesalez</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-2 flex-1">
            <button
              onClick={() => handleNavigation('dashboard', '/seller/dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Dashboard' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Dashboard</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('products', '/seller/products')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'products' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Products' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Products</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('orders', '/seller/orders')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'orders' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Orders' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Orders</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('sales-reports', '/seller/sales-reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'sales-reports' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Sales Reports' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Sales Reports</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('order-history', '/seller/order-history')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'order-history' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Order History' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Order History</span>}
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('subscription', '/seller/subscription')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                activeTab === 'subscription' 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={sidebarCollapsed ? 'Subscription' : ''}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                {(!sidebarCollapsed || shouldAutoExpand) && <span>Subscription</span>}
              </div>
            </button>
          </div>

          {/* Create Product Button */}
          {(!sidebarCollapsed || shouldAutoExpand) && (
            <div className="mt-6">
              <button
                onClick={() => {
                  router.push('/seller/dashboard/create-product');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
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

          {/* Collapsed Create Product Button */}
          {sidebarCollapsed && !shouldAutoExpand && (
            <div className="mt-6">
              <button
                onClick={() => {
                  router.push('/seller/dashboard/create-product');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Create Product"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>
          )}

          {/* Screen Size Indicator (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              {isSmallScreen ? 'Mobile' : isMediumScreen ? 'Tablet' : 'Desktop'} ({windowWidth}px)
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  const handleNavigation = (path) => {
    router.push(path);
    setShowMobileMenu(false);
  };

  // Simple check for buyer pages
  const isBuyerPage = pathname?.includes('/product/') || 
                     pathname?.includes('/order-success') || 
                     pathname?.includes('/order-tracking') ||
                     pathname === '/';

  // If we're on a buyer page and no user is logged in, don't show navigation
  if (isBuyerPage && (!isClient || !user)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-xl font-bold text-gray-900"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="hidden sm:inline">Livesalez</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => router.push('/order-tracking')}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              Track Order
            </button>
            
            {isClient && user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                {user.userType === 'seller' ? (
                  <button 
                    onClick={() => router.push('/seller/dashboard')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Seller Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/buyer/dashboard')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    My Orders
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : isClient && (
              <button 
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="py-4 space-y-4">
              {/* Track Order */}
              <button 
                onClick={() => handleNavigation('/order-tracking')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Track Order
                </div>
              </button>
              
              {isClient && user ? (
                <>
                  {/* User Welcome */}
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4">
                    <div className="text-sm text-gray-600">Welcome, {user.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.userType === 'seller' ? 'Seller Account' : 'Buyer Account'}</div>
                  </div>

                  {/* Dashboard Link */}
                  {user.userType === 'seller' ? (
                    <button 
                      onClick={() => handleNavigation('/seller/dashboard')}
                      className="block w-full text-left px-4 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        Seller Dashboard
                      </div>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleNavigation('/buyer/dashboard')}
                      className="block w-full text-left px-4 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        My Orders
                      </div>
                    </button>
                  )}

                  {/* Logout */}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Logout
                    </div>
                  </button>
                </>
              ) : isClient && (
                <div className="px-4 space-y-3">
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 
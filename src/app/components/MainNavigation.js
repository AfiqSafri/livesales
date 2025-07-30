"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MainNavigation() {
  const router = useRouter();
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

  return (
    <nav className="bg-white shadow-sm border-b">
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
              Livesalez
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
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              <button 
                onClick={() => {
                  router.push('/order-tracking');
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
              >
                Track Order
              </button>
              
                             {isClient && user ? (
                 <>
                   <div className="text-sm text-gray-600">Welcome, {user.name}</div>
                   {user.userType === 'seller' ? (
                     <button 
                       onClick={() => {
                         router.push('/seller/dashboard');
                         setShowMobileMenu(false);
                       }}
                       className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium"
                     >
                       Seller Dashboard
                     </button>
                   ) : (
                     <button 
                       onClick={() => {
                         router.push('/buyer/dashboard');
                         setShowMobileMenu(false);
                       }}
                       className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium"
                     >
                       My Orders
                     </button>
                   )}
                   <button 
                     onClick={() => {
                       handleLogout();
                       setShowMobileMenu(false);
                     }}
                     className="block w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                   >
                     Logout
                   </button>
                 </>
               ) : isClient && (
                 <button 
                   onClick={() => {
                     router.push('/login');
                     setShowMobileMenu(false);
                   }}
                   className="block w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   Login
                 </button>
               )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 
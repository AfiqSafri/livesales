"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerLanguage } from './SellerLanguageContext';

export default function SellerTopbar() {
  const router = useRouter();
  const { language, setLanguage } = useSellerLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadUser = () => {
      const u = JSON.parse(localStorage.getItem('currentUser'));
      setUser(u);
    };

    // Load user on mount
    loadUser();

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when profile is updated
    const handleProfileUpdate = () => {
      loadUser();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-menu') && !event.target.closest('.user-menu')) {
        setShowLanguageMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem('currentUser');
    router.push('/login');
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white border-opacity-30">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-xl font-bold text-white">Livesalez</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 px-3 sm:px-4 py-3 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white border-opacity-30">
          <span className="text-white font-bold text-sm sm:text-lg">L</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Livesalez</h1>
      </div>
      
      {/* Right: Language, User */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <div className="relative language-menu">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 border hover:bg-white hover:bg-opacity-20 text-white border-white border-opacity-30 hover:scale-105 backdrop-blur-sm"
            title="Language"
          >
            <span className="text-xs sm:text-sm font-medium">
              {language === 'en' ? 'Language' : 'Bahasa'}
            </span>
            <svg className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 inline transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 border rounded-lg shadow-lg py-2 z-20 bg-white border-gray-200">
              <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900">Language</h3>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }} 
                  className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors ${language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => { setLanguage('ms'); setShowLanguageMenu(false); }} 
                  className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors ${language === 'ms' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Bahasa Melayu
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative user-menu">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 sm:gap-2 border rounded-lg px-2 sm:px-3 py-2 hover:bg-white hover:bg-opacity-20 transition-all duration-200 bg-white bg-opacity-10 border-white border-opacity-30 hover:scale-105 backdrop-blur-sm"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border border-white border-opacity-30">
              {user?.profileImage ? (
                <img 
                  src={`${user.profileImage}?t=${Date.now()}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ display: user?.profileImage ? 'none' : 'flex' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="font-medium transition-colors duration-300 hidden sm:block text-white">{user?.name}</span>
            <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform text-white ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 border rounded-lg shadow-lg py-2 z-20 bg-white border-gray-200">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img 
                        src={`${user.profileImage}?t=${Date.now()}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className="text-white font-semibold text-xs sm:text-sm" style={{ display: user?.profileImage ? 'none' : 'flex' }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500">Seller Account</div>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { router.push('/seller/profile'); setShowUserMenu(false); }} 
                  className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => { router.push('/'); setShowUserMenu(false); }} 
                  className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Browse Products
                </button>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button 
                  onClick={() => { handleLogout(); setShowUserMenu(false); }} 
                  className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
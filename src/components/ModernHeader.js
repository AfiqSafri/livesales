"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSellerLanguage } from "../app/seller/SellerLanguageContext";

export default function ModernHeader() {
  const router = useRouter();
  const { language } = useSellerLanguage() || { language: 'en' };
    const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    
    // Fetch notification count if user is a seller
    if (user && user.userType === 'seller') {
      fetchNotificationCount(user.id);
      // Set up polling for notifications every 30 seconds
      const interval = setInterval(() => fetchNotificationCount(user.id), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotificationCount = async (userId) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&isRead=false`);
      const data = await response.json();
      if (data.notifications) {
        setNotificationCount(data.notifications.length);
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

    const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
 
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true })
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (isNotificationOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotificationOpen]);

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: slideDown 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-2 sm:gap-3 rounded-2xl bg-white/90 px-3 sm:px-4 shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          
          {/* Logo - Always visible on mobile */}
          <div className="flex flex-1 items-center">
            <Link href="/seller/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Livesalez</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/seller/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Dashboard' : 'Dashboard'}
            </Link>
            <Link href="/seller/products" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Produk' : 'Products'}
            </Link>
            <Link href="/seller/orders" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Pesanan' : 'Orders'}
            </Link>
            <Link href="/seller/sales-reports" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Laporan Jualan' : 'Sales Reports'}
            </Link>
            <Link href="/seller/subscription" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Langganan' : 'Subscription'}
            </Link>
            <Link href="/seller/profile" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              {language === 'ms' ? 'Profil' : 'Profile'}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder={language === 'ms' ? 'Cari produk...' : 'Search products...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* User Profile & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell - Desktop */}
            {currentUser?.userType === 'seller' && (
              <div className="hidden md:block relative notification-dropdown">
                <button 
                  onClick={toggleNotification}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <i className="fas fa-bell text-gray-600 text-lg"></i>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {notificationCount > 0 && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notificationCount} unread
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="fas fa-bell text-gray-400 text-lg"></i>
                          </div>
                          <p className="text-gray-500 text-sm">No notifications</p>
                        </div>
                      ) : (
                        <div className="py-1">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                              }`}
                              onClick={() => {
                                markNotificationAsRead(notification.id);
                                if (notification.type === 'receipt_uploaded') {
                                  router.push('/seller/dashboard');
                                }
                              }}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-receipt text-blue-600 text-sm"></i>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </h4>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {getTimeAgo(notification.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  {notification.type === 'receipt_uploaded' && (
                                    <div className="mt-2">
                                      <span className="text-xs text-blue-600 font-medium">
                                        View Receipts →
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0 ml-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link 
                          href="/seller/dashboard"
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          View All Notifications →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Profile */}
            <div className="hidden md:block relative profile-dropdown">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=3B82F6&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'Seller'}</p>
                  <p className="text-xs text-gray-500">Seller Account</p>
                </div>
                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'Seller'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email || 'seller@example.com'}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/seller/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <i className="fas fa-user mr-3 text-gray-400"></i>
                      {language === 'ms' ? 'Profil Saya' : 'My Profile'}
                    </Link>
                    <Link href="/seller/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <i className="fas fa-cog mr-3 text-gray-400"></i>
                      {language === 'ms' ? 'Tetapan' : 'Settings'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-red-400"></i>
                      {language === 'ms' ? 'Log Keluar' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Profile Display - Always Visible */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Notification Bell - Mobile */}
              {currentUser?.userType === 'seller' && (
                <div className="relative mr-2 notification-dropdown">
                  <button 
                    onClick={toggleNotification}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <i className="fas fa-bell text-gray-600 text-lg"></i>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Mobile Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          {notificationCount > 0 && (
                            <span className="text-xs text-blue-600 font-medium">
                              {notificationCount} unread
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <i className="fas fa-bell text-gray-400 text-sm"></i>
                            </div>
                            <p className="text-gray-500 text-xs">No notifications</p>
                          </div>
                        ) : (
                          <div className="py-1">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-3 py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                                  !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                                }`}
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  if (notification.type === 'receipt_uploaded') {
                                    router.push('/seller/dashboard');
                                  }
                                }}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                      <i className="fas fa-receipt text-blue-600 text-xs"></i>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-medium text-gray-900 truncate">
                                        {notification.title}
                                      </h4>
                                      <span className="text-xs text-gray-500 ml-1">
                                        {getTimeAgo(notification.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    {notification.type === 'receipt_uploaded' && (
                                      <div className="mt-1">
                                        <span className="text-xs text-blue-600 font-medium">
                                          View Receipts →
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {!notification.isRead && (
                                    <div className="flex-shrink-0 ml-1">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100">
                          <Link 
                            href="/seller/dashboard"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            View All →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-right mr-2">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{currentUser?.name || 'Seller'}</p>
                <p className="text-xs text-gray-500 flex items-center justify-end">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  Seller Account
                </p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer">
                {currentUser?.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=3B82F6&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 group ml-1 relative"
            >
              <div className="relative">
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-gray-600 text-lg group-hover:text-gray-800 transition-all duration-200`}></i>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={toggleMobileMenu}
            ></div>
            
            {/* Sidebar */}
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">L</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Livesalez</h3>
                    <p className="text-sm text-gray-600">Seller Portal</p>
                  </div>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <i className="fas fa-times text-gray-600 text-xl"></i>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                <Link 
                  href="/seller/dashboard" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-blue-200"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-tachometer-alt text-blue-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-blue-700 transition-colors duration-200">Dashboard</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                <Link 
                  href="/seller/products" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-green-200"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-box text-green-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-green-700 transition-colors duration-200">Products</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                <Link 
                  href="/seller/orders" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-purple-200"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-shopping-cart text-purple-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-purple-700 transition-colors duration-200">Orders</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                <Link 
                  href="/seller/sales-reports" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-orange-200"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-chart-bar text-orange-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-orange-700 transition-colors duration-200">Sales Reports</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                <Link 
                  href="/seller/subscription" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-indigo-200"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-credit-card text-indigo-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-indigo-700 transition-colors duration-200">Subscription</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                <Link 
                  href="/seller/profile" 
                  onClick={toggleMobileMenu}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    <i className="fas fa-user text-gray-600 text-lg"></i>
                    <i className="fas fa-user text-gray-600 text-lg"></i>
                  </div>
                  <span className="font-medium group-hover:text-gray-700 transition-colors duration-200">Profile</span>
                  <i className="fas fa-chevron-right ml-auto text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
                
                {/* Logout Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-200">
                      <i className="fas fa-sign-out-alt text-red-500 text-lg"></i>
                    </div>
                    <span className="font-medium group-hover:text-red-700 transition-colors duration-200">Logout</span>
                    <i className="fas fa-arrow-right ml-auto text-red-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-200"></i>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSellerLanguage } from "../app/seller/SellerLanguageContext";

export default function NotusHeader() {
  const router = useRouter();
  const { language } = useSellerLanguage() || { language: 'en' };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <Link href="/seller/dashboard" className="text-white text-sm uppercase hidden lg:inline-block font-semibold">
            Livesalez
          </Link>
          
          {/* Form */}
          <form className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex w-full flex-wrap items-stretch">
              <span className="z-10 h-full leading-snug font-normal absolute text-center text-gray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder={language === 'ms' ? 'Cari...' : 'Search...'}
                className="border-0 px-3 py-3 placeholder-gray-300 text-gray-600 relative bg-white rounded text-sm shadow focus:outline-none focus:ring w-full pl-10 ease-linear transition-all duration-150"
              />
            </div>
          </form>
          
          {/* User Profile Dropdown */}
          <div className="flex items-center">
            <div className="relative profile-dropdown">
              <button
                onClick={toggleProfile}
                className="bg-white active:bg-gray-50 text-gray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
              >
                <div className="flex items-center space-x-3">
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
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold">{currentUser?.name || 'Seller'}</p>
                  </div>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
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
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Seller'}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email || 'seller@example.com'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="py-1 max-h-64 overflow-y-auto">
                    <Link
                      href="/seller/profile"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-user-edit w-4 h-4 mr-3 text-blue-600 inline"></i>
                      {language === 'ms' ? 'Edit Profile' : 'Edit Profile'}
                    </Link>
                    
                    <Link
                      href="/seller/dashboard"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-tachometer-alt w-4 h-4 mr-3 text-green-600 inline"></i>
                      {language === 'ms' ? 'Dashboard' : 'Dashboard'}
                    </Link>
                    
                    <Link
                      href="/seller/products"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-box w-4 h-4 mr-3 text-purple-600 inline"></i>
                      {language === 'ms' ? 'Products' : 'Products'}
                    </Link>
                    
                    <Link
                      href="/seller/orders"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-shopping-cart w-4 h-4 mr-3 text-orange-600 inline"></i>
                      {language === 'ms' ? 'Orders' : 'Orders'}
                    </Link>
                    
                    <Link
                      href="/seller/sales-reports"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-chart-bar w-4 h-4 mr-3 text-indigo-600 inline"></i>
                      {language === 'ms' ? 'Sales Reports' : 'Sales Reports'}
                    </Link>
                    
                    <Link
                      href="/seller/subscription"
                      className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100 transition-colors ease-linear transition-all duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fas fa-credit-card w-4 h-4 mr-3 text-yellow-600 inline"></i>
                      {language === 'ms' ? 'Subscription' : 'Subscription'}
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white active:bg-red-700 text-sm font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                    >
                      <i className="fas fa-sign-out-alt w-4 h-4 mr-3 inline"></i>
                      {language === 'ms' ? 'Logout' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}

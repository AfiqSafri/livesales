"use client";
import { useState, useEffect } from 'react';
import SellerSidebar from './SellerSidebar';
import SellerTopbar from './SellerTopbar';
import { SellerLanguageProvider } from './SellerLanguageContext';

export default function SellerLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 px-4 py-3 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white border-opacity-30">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-xl font-bold text-white">Livesalez</h1>
            </div>
          </div>
          <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <SellerLanguageProvider>
      <div className="min-h-screen flex bg-gray-50">
        <SellerSidebar />
        <div className="flex-1 flex flex-col lg:ml-0">
          <SellerTopbar />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 pt-16 sm:pt-20 lg:pt-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SellerLanguageProvider>
  );
} 
"use client";
import SellerSidebar from './SellerSidebar';
import SellerTopbar from './SellerTopbar';
import { SellerLanguageProvider } from './SellerLanguageContext';

export default function SellerLayout({ children }) {
  return (
    <SellerLanguageProvider>
      <div className="min-h-screen flex bg-gray-50">
        <SellerSidebar />
        <div className="flex-1 flex flex-col lg:ml-0">
          <SellerTopbar />
          <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SellerLanguageProvider>
  );
} 
"use client";
import SellerSidebar from './SellerSidebar';
import SellerTopbar from './SellerTopbar';
import { SellerLanguageProvider } from './SellerLanguageContext';

export default function SellerLayout({ children }) {
  return (
    <SellerLanguageProvider>
      <div className="min-h-screen flex bg-white">
        <SellerSidebar />
        <div className="flex-1 flex flex-col">
          <SellerTopbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SellerLanguageProvider>
  );
} 
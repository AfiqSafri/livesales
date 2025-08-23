"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SellerLanguageProvider } from './SellerLanguageContext';

export default function SellerLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <SellerLanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SellerLanguageProvider>
  );
} 
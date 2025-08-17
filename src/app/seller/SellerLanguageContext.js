"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SellerLanguageContext = createContext({
  language: 'en',
  setLanguage: () => {}
});

export function SellerLanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language);
    }
  }, [language, mounted]);

  const value = {
    language,
    setLanguage
  };

  return (
    <SellerLanguageContext.Provider value={value}>
      {children}
    </SellerLanguageContext.Provider>
  );
}

export function useSellerLanguage() {
  const context = useContext(SellerLanguageContext);
  if (context === undefined) {
    console.warn('useSellerLanguage must be used within a SellerLanguageProvider');
    return { language: 'en', setLanguage: () => {} };
  }
  return context;
} 
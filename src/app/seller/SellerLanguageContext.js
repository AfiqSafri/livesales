"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SellerLanguageContext = createContext();

export function SellerLanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <SellerLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </SellerLanguageContext.Provider>
  );
}

export function useSellerLanguage() {
  return useContext(SellerLanguageContext);
} 
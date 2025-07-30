import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNavigation from "./components/MainNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Livesalez - Live Sales Platform",
  description: "Professional live sales platform for sellers and buyers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainNavigation />
        {children}
        
        {/* Global Footer */}
        <footer className="bg-gray-900 text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold">Livesalez</span>
              </div>
              <div className="text-sm text-gray-400">
                © 2025 MyTech Padu Solutions. All rights reserved. | Livesalez v1.0
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

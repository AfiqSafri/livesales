import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="bg-gray-900 text-white py-2 sm:py-4 lg:py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-8 mb-2 sm:mb-4 lg:mb-8">
              {/* Company Info */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">L</span>
                  </div>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">Livesalez</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Professional live sales platform connecting sellers and buyers in real-time. 
                  Streamline your business with our comprehensive e-commerce solution.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
                <div className="space-y-1 sm:space-y-2">
                  <a href="/order-tracking" className="block text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                    Track Order
                  </a>
                  <a href="/login" className="block text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                    Login
                  </a>
                  <a href="/register" className="block text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                    Register
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">Contact</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">support@livesalez.com</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-2 sm:pt-4 lg:pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                  © 2025 MyTech Padu Solutions. All rights reserved. | Livesalez v1.0
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

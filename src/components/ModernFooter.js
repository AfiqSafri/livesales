import Link from "next/link";

export default function ModernFooter({ border = false }) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top area: Blocks - Mobile Responsive */}
        <div className={`grid gap-6 sm:gap-8 lg:gap-10 py-8 sm:py-10 lg:py-12 sm:grid-cols-12 ${border ? "border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1]" : ""}`}>
          
          {/* 1st block - Brand & Description */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-12 lg:col-span-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">L</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">Livesalez</span>
            </div>
            <div className="text-gray-600 max-w-sm mx-auto sm:mx-0 text-sm sm:text-base leading-relaxed">
              Professional e-commerce platform connecting sellers and buyers with seamless transactions, 
              secure payments, and comprehensive business management tools.
            </div>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full">
                <i className="fab fa-facebook text-lg sm:text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full">
                <i className="fab fa-twitter text-lg sm:text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full">
                <i className="fab fa-instagram text-lg sm:text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full">
                <i className="fab fa-linkedin text-lg sm:text-xl"></i>
              </a>
            </div>
          </div>

          {/* 2nd block - Company Info & Contact */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-12 lg:col-span-6 text-center sm:text-left">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Company</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Mytech Padu Solutions</span>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Since 2025
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Contact</h3>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <a href="tel:01126738407" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm sm:text-base font-medium">
                    011-2673 8407
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom area - Mobile Responsive */}
        <div className="border-t border-gray-200 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <div className="text-xs sm:text-sm text-gray-600">
              &copy; 2024 Livesalez. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-600">
              <span>Made with ❤️ in Malaysia</span>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span>Powered by</span>
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">L</span>
                </div>
                <span className="ml-2">Mytech Padu Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


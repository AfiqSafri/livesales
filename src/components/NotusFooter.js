"use client";
import React from "react";
import Link from "next/link";

export default function NotusFooter() {
  console.log("NotusFooter component is rendering"); // Debug log
  
  return (
    <footer className="bg-gray-800 text-white relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Brand Information */}
          <div className="text-center md:text-left">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Livesalez</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Professional live sales platform connecting sellers and buyers in real-time. Streamline your business with our comprehensive e-commerce solution.
            </p>
          </div>

          {/* Middle Section - Useful Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Email:</span> livesalez@gmail.com
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">Phone:</span> +6011-1111 1111
              </p>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          {/* Copyright and Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm text-center md:text-left mb-4 md:mb-0">
              © 2025 MyTech Padu Solutions. All rights reserved. | Livesalez v1.0
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

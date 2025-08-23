"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSellerLanguage } from "../app/seller/SellerLanguageContext";

export default function NotusSidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useSellerLanguage() || { language: 'en' };

  const navigation = [
    {
      name: language === 'ms' ? 'Dashboard' : 'Dashboard',
      href: '/seller/dashboard',
      icon: 'fas fa-tachometer-alt'
    },
    {
      name: language === 'ms' ? 'Produk' : 'Products',
      href: '/seller/products',
      icon: 'fas fa-box'
    },
    {
      name: language === 'ms' ? 'Pesanan' : 'Orders',
      href: '/seller/orders',
      icon: 'fas fa-shopping-cart'
    },
    {
      name: language === 'ms' ? 'Laporan Jualan' : 'Sales Reports',
      href: '/seller/sales-reports',
      icon: 'fas fa-chart-bar'
    },
    {
      name: language === 'ms' ? 'Langganan' : 'Subscription',
      href: '/seller/subscription',
      icon: 'fas fa-credit-card'
    },
    {
      name: language === 'ms' ? 'Profil' : 'Profile',
      href: '/seller/profile',
      icon: 'fas fa-user'
    }
  ];

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-lg bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-4">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          
          {/* Brand */}
          <Link href="/seller/dashboard" className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0">
            Livesalez
          </Link>
          
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link href="/seller/dashboard" className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0">
                    Livesalez
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            
            {/* Heading */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              {language === 'ms' ? 'Menu Penjual' : 'Seller Menu'}
            </h6>
            
            {/* Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              {navigation.map((item) => (
                <li key={item.name} className="items-center">
                  <Link href={item.href}>
                    <span
                      className={
                        "text-xs uppercase py-3 font-bold block " +
                        (pathname === item.href
                          ? "text-lightBlue-500 hover:text-lightBlue-600"
                          : "text-blueGray-700 hover:text-blueGray-500")
                      }
                    >
                      <i className={item.icon + " mr-2 text-sm"}></i>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            
            {/* Logout */}
            <div className="md:min-w-full md:hidden block pb-4">
              <button
                onClick={() => {
                  localStorage.removeItem('currentUser');
                  router.push('/login');
                }}
                className="w-full text-left text-xs uppercase py-3 font-bold block text-red-500 hover:text-red-600"
              >
                <i className="fas fa-sign-out-alt mr-2 text-sm"></i>
                {language === 'ms' ? 'Log Keluar' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerLanguage } from '../SellerLanguageContext';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';

export default function SellerDashboard() {
  const router = useRouter();
  const { language } = useSellerLanguage() || { language: 'en' };
  
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  // Custom CSS for mobile optimization
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 640px) {
        .mobile-optimized-table {
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .mobile-optimized-table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .mobile-optimized-table tr:last-child td {
          border-bottom: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchDashboardData(u.id);
  }, [router]);

  async function fetchDashboardData(sellerId) {
    try {
      setLoading(true);
      
      // Initialize with empty arrays to prevent errors
      let orders = [];
      let products = [];
      
      // Fetch recent orders
      try {
        const ordersResponse = await fetch('/api/seller/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId })
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          // Check if ordersData is an array, if not, look for the orders property
          orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        }
      } catch (orderError) {
        console.error('Error fetching orders:', orderError);
        orders = [];
      }

      // Fetch products count
      try {
        const productsResponse = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId })
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          // Check if productsData is an array, if not, look for the products property
          products = Array.isArray(productsData) ? productsData : (productsData.products || []);
        }
      } catch (productError) {
        console.error('Error fetching products:', productError);
        products = [];
      }

      // Update state with fetched data
      setRecentOrders(orders.slice(0, 5));
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'RM 0.00';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header - Mobile Responsive */}
          <div className="mb-8 lg:mb-12">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 tracking-tight">
                {language === 'ms' ? 'Selamat Datang Kembali!' : 'Welcome Back!'}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                {language === 'ms' ? 'Kelola perniagaan anda dengan cekap' : 'Manage your business efficiently'}
              </p>
            </div>
          </div>

          {/* Stats Grid - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
            {/* Total Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {language === 'ms' ? 'Produk' : 'Products'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stats.totalProducts}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300 self-end sm:self-auto">
                  <i className="fas fa-box text-blue-600 text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {language === 'ms' ? 'Pesanan' : 'Orders'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{stats.totalOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300 self-end sm:self-auto">
                  <i className="fas fa-shopping-cart text-green-600 text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {language === 'ms' ? 'Pendapatan' : 'Revenue'}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 group-hover:scale-110 transition-all duration-300 self-end sm:self-auto">
                  <i className="fas fa-dollar-sign text-yellow-600 text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {language === 'ms' ? 'Tertunda' : 'Pending'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">{stats.pendingOrders}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300 self-end sm:self-auto">
                  <i className="fas fa-clock text-red-600 text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  {language === 'ms' ? 'Tindakan Pantas' : 'Quick Actions'}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <button
                    className="btn btn-lg btn-success w-full group hover:scale-105 transition-all duration-200 py-3 sm:py-4"
                    onClick={() => router.push('/seller/dashboard/create-product')}
                  >
                    <i className="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                    {language === 'ms' ? 'Tambah Produk' : 'Add Product'}
                  </button>
                  
                  <button
                    className="btn btn-outline w-full group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 py-3 sm:py-4"
                    onClick={() => router.push('/seller/orders')}
                  >
                    <i className="fas fa-shopping-cart mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                    {language === 'ms' ? 'Lihat Pesanan' : 'View Orders'}
                  </button>
                  
                  <button
                    className="btn btn-outline w-full group hover:bg-green-50 hover:border-green-300 transition-all duration-200 py-3 sm:py-4"
                    onClick={() => router.push('/seller/products')}
                  >
                    <i className="fas fa-box mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                    {language === 'ms' ? 'Kelola Produk' : 'Manage Products'}
                  </button>
                  
                  <button
                    className="btn btn-outline w-full group hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 py-3 sm:py-4"
                    onClick={() => router.push('/seller/profile')}
                  >
                    <i className="fas fa-user mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                    {language === 'ms' ? 'Profil Saya' : 'My Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {language === 'ms' ? 'Pesanan Terkini' : 'Recent Orders'}
                  </h3>
                  <Link href="/seller/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {language === 'ms' ? 'Lihat Semua' : 'View All'}
                  </Link>
                </div>
                
                {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full mobile-optimized-table">
                      <thead className="hidden sm:table-header-group">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'ID' : 'ID'}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'Produk' : 'Product'}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'Jumlah' : 'Amount'}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'Status' : 'Status'}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'Tarikh' : 'Date'}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {language === 'ms' ? 'Tindakan' : 'Action'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                          <tr key={order?.id || Math.random()} className="hover:bg-gray-50">
                            {/* Mobile: Card-like layout, Desktop: Table layout */}
                            <td className="py-3 px-3 text-sm font-medium text-gray-900">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">ID:</span>
                              </div>
                              #{order?.id || 'N/A'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Product:</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                                  <i className="fas fa-box text-blue-600 text-sm"></i>
                                </div>
                                <span className="text-sm text-gray-900 font-medium">
                                  {order?.productName || order?.product?.name || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-sm font-semibold text-gray-900">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Amount:</span>
                              </div>
                              {formatCurrency(order?.totalAmount)}
                            </td>
                            <td className="py-3 px-3">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Status:</span>
                              </div>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                order?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order?.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order?.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-sm text-gray-600">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Date:</span>
                              </div>
                              <div className="flex items-center">
                                <i className="fas fa-calendar text-gray-400 mr-2 text-xs"></i>
                                {order?.createdAt ? formatDate(order.createdAt) : 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="sm:hidden mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Action:</span>
                              </div>
                              <button
                                className="btn btn-sm btn-primary w-full sm:w-auto"
                                onClick={() => router.push(`/seller/orders/${order?.id}`)}
                              >
                                <i className="fas fa-eye mr-1"></i>
                                {language === 'ms' ? 'Lihat' : 'View'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <i className="fas fa-shopping-cart text-lg sm:text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {language === 'ms' ? 'Tiada Pesanan Lagi' : 'No Orders Yet'}
                    </h3>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm px-4">
                      {language === 'ms' ? 'Pesanan pertama anda akan muncul di sini' : 'Your first order will appear here'}
                    </p>
                    <button
                      className="btn btn-primary w-full sm:w-auto"
                      onClick={() => router.push('/seller/dashboard/create-product')}
                    >
                      {language === 'ms' ? 'Tambah Produk Pertama' : 'Add Your First Product'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
}
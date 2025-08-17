"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerLanguage } from '../SellerLanguageContext';
import ProfessionalButton from '../../../components/ProfessionalButton';

export default function SellerDashboard() {
  const router = useRouter();
  const { language } = useSellerLanguage();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchDashboardData(u.id);
  }, [router]);

  function fetchDashboardData(sellerId) {
    setLoading(true);
    
    // Fetch products count
    fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, totalProducts: data.products?.length || 0 }));
      });

    // Fetch orders and revenue
    fetch('/api/seller/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => {
        const orders = data.orders || [];
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders
        }));
        
        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
      setLoading(false);
      });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-1 sm:p-2 lg:p-6">
        {/* Header */}
        <div className="mb-2 sm:mb-3 lg:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            {language === 'ms' ? 'Selamat Datang' : 'Welcome'}, {user?.name || 'Seller'}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {language === 'ms' ? 'Gambaran keseluruhan perniagaan anda' : 'Overview of your business'}
          </p>
            </div>

        {/* Quick Actions */}
        <div className="mb-2 sm:mb-3 lg:mb-6">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-4">
            <Link href="/seller/dashboard/create-product">
              <ProfessionalButton variant="success" size="medium" icon="➕">
                {language === 'ms' ? 'Tambah Produk' : 'Add Product'}
              </ProfessionalButton>
            </Link>
            <Link href="/seller/orders">
              <ProfessionalButton variant="primary" size="medium" icon="📋">
                {language === 'ms' ? 'Lihat Pesanan' : 'View Orders'}
              </ProfessionalButton>
            </Link>
            <Link href="/seller/sales-reports">
              <ProfessionalButton variant="info" size="medium" icon="📊">
                {language === 'ms' ? 'Laporan Jualan' : 'Sales Reports'}
              </ProfessionalButton>
            </Link>
            <Link href="/seller/profile">
              <ProfessionalButton variant="outline" size="medium" icon="👤">
                {language === 'ms' ? 'Profil' : 'Profile'}
              </ProfessionalButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-3 lg:mb-6">
          {/* Total Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  {language === 'ms' ? 'Jumlah Produk' : 'Total Products'}
                </p>
                <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  {language === 'ms' ? 'Jumlah Pesanan' : 'Total Orders'}
                </p>
                <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  {language === 'ms' ? 'Jumlah Pendapatan' : 'Total Revenue'}
                </p>
                <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-900">RM {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-1 sm:p-2 bg-yellow-100 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:w-5 lg:w-8 lg:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  {language === 'ms' ? 'Pesanan Tertunggak' : 'Pending Orders'}
                </p>
                <p className="text-sm sm:text-base lg:text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="p-1 sm:p-2 bg-orange-100 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 sm:p-2 lg:p-4 mb-2 sm:mb-3 lg:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              {language === 'ms' ? 'Pesanan Terkini' : 'Recent Orders'}
            </h3>
            <Link href="/seller/orders">
              <ProfessionalButton variant="outline" size="small">
                {language === 'ms' ? 'Lihat Semua' : 'View All'}
              </ProfessionalButton>
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-4 sm:py-6 lg:py-8">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                {language === 'ms' ? 'Tiada pesanan lagi' : 'No orders yet'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'ms' ? 'Pesanan akan muncul di sini' : 'Orders will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {order.buyerName || (order.buyer ? order.buyer.name : 'Guest Customer')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.product?.name || 'Product'} - RM{order.totalAmount}
                      </p>
          </div>
        </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className={`px-1 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <Link href={`/seller/orders/${order.id}`}>
                      <ProfessionalButton variant="primary" size="small">
                        {language === 'ms' ? 'Lihat' : 'View'}
                      </ProfessionalButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-4">
          <Link href="/seller/products">
            <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 lg:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                          </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                    {language === 'ms' ? 'Kelola Produk' : 'Manage Products'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {language === 'ms' ? 'Tambah, edit, atau padam produk' : 'Add, edit, or delete products'}
                  </p>
                                </div>
                                </div>
                              </div>
          </Link>

          <Link href="/seller/analytics">
            <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 lg:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                          </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                    {language === 'ms' ? 'Analitik' : 'Analytics'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {language === 'ms' ? 'Lihat prestasi perniagaan' : 'View business performance'}
                  </p>
                          </div>
                        </div>
                      </div>
          </Link>

          <Link href="/seller/bank-account">
            <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 lg:p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 bg-purple-100 rounded-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                    {language === 'ms' ? 'Akaun Bank' : 'Bank Account'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {language === 'ms' ? 'Urus maklumat pembayaran' : 'Manage payment information'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
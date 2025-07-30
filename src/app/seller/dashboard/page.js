"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSellerLanguage } from '../SellerLanguageContext';

export default function SellerDashboard() {
  const router = useRouter();
  const { language, setLanguage } = useSellerLanguage();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, analytics, products, orders
  // Add state for confirmation dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState(null); // 'order' or 'product'
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days

  // Language translations
  const translations = {
    en: {
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      analytics: 'Analytics',
      createProduct: 'Create Product',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      sellerAccount: 'Seller Account',
      yourProducts: 'Your Products',
      totalOrders: 'Total Orders',
      pending: 'Pending',
      shipped: 'Shipped',
      totalRevenue: 'Total Revenue',
      share: 'Share',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      contact: 'Contact',
      markShipped: 'Mark Shipped',
      processing: 'Processing',
      pendingStatus: 'Pending',
      shippedStatus: 'Shipped',
      quantity: 'Quantity',
      perUnit: 'per unit',
      noProducts: 'No products found',
      noOrders: 'No orders found',
      language: 'Language',
      english: 'English',
      malay: 'Bahasa Melayu',
      buyerEmail: 'Buyer Email',
      // Analytics translations
      salesOverview: 'Sales Overview',
      revenue: 'Revenue',
      customers: 'Customers',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      last90Days: 'Last 90 Days',
      averageOrderValue: 'Average Order Value',
      conversionRate: 'Conversion Rate',
      topProducts: 'Top Products',
      recentOrders: 'Recent Orders',
      customerInsights: 'Customer Insights',
      salesTrends: 'Sales Trends',
      productPerformance: 'Product Performance',
      revenueGrowth: 'Revenue Growth',
      orderStatus: 'Order Status',
      completed: 'Completed',
      cancelled: 'Cancelled',
      viewAll: 'View All',
      noData: 'No data available',
      loading: 'Loading...',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      createNewProduct: 'Create New Product',
      viewAllOrders: 'View All Orders',
      viewAllProducts: 'View All Products',
      customerFeedback: 'Customer Feedback',
      inventoryStatus: 'Inventory Status',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock'
    },
    ms: {
      dashboard: 'Papan Pemuka',
      products: 'Produk',
      orders: 'Pesanan',
      analytics: 'Analitik',
      createProduct: 'Cipta Produk',
      editProfile: 'Sunting Profil',
      logout: 'Log Keluar',
      sellerAccount: 'Akaun Penjual',
      yourProducts: 'Produk Anda',
      totalOrders: 'Jumlah Pesanan',
      pending: 'Menunggu',
      shipped: 'Dihantar',
      totalRevenue: 'Jumlah Pendapatan',
      share: 'Kongsi',
      view: 'Lihat',
      edit: 'Sunting',
      delete: 'Padam',
      contact: 'Hubungi',
      markShipped: 'Tandakan Dihantar',
      processing: 'Memproses',
      pendingStatus: 'Menunggu',
      shippedStatus: 'Dihantar',
      quantity: 'Kuantiti',
      perUnit: 'seunit',
      noProducts: 'Tiada produk dijumpai',
      noOrders: 'Tiada pesanan dijumpai',
      language: 'Bahasa',
      english: 'English',
      malay: 'Bahasa Melayu',
      buyerEmail: 'Emel Pembeli',
      // Analytics translations
      salesOverview: 'Gambaran Keseluruhan Jualan',
      revenue: 'Pendapatan',
      customers: 'Pelanggan',
      last7Days: '7 Hari Lepas',
      last30Days: '30 Hari Lepas',
      last90Days: '90 Hari Lepas',
      averageOrderValue: 'Nilai Purata Pesanan',
      conversionRate: 'Kadar Penukaran',
      topProducts: 'Produk Teratas',
      recentOrders: 'Pesanan Terkini',
      customerInsights: 'Wawasan Pelanggan',
      salesTrends: 'Trend Jualan',
      productPerformance: 'Prestasi Produk',
      revenueGrowth: 'Pertumbuhan Pendapatan',
      orderStatus: 'Status Pesanan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      viewAll: 'Lihat Semua',
      noData: 'Tiada data tersedia',
      loading: 'Memuat...',
      recentActivity: 'Aktiviti Terkini',
      quickActions: 'Tindakan Pantas',
      createNewProduct: 'Cipta Produk Baharu',
      viewAllOrders: 'Lihat Semua Pesanan',
      viewAllProducts: 'Lihat Semua Produk',
      customerFeedback: 'Maklum Balas Pelanggan',
      inventoryStatus: 'Status Inventori',
      lowStock: 'Stok Rendah',
      outOfStock: 'Habis Stok',
      inStock: 'Ada Stok'
    }
  };

  const t = translations[language];

  // Apply dark mode to document
  useEffect(() => {
    // Removed darkMode and setDarkMode usage
  }, []);

  // Persist theme and language in localStorage
  useEffect(() => {
    // Removed darkMode persistence
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // On mount, read theme and language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang);
  }, [setLanguage]);

  // Refactor navigation to use real routes
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    // Set activeTab based on route
    if (window.location.pathname.includes('/seller/products')) setActiveTab('products');
    else if (window.location.pathname.includes('/seller/orders')) setActiveTab('orders');
    else if (window.location.pathname.includes('/seller/analytics')) setActiveTab('analytics');
    else setActiveTab('dashboard');
    fetchProducts(u.id);
    fetchOrders(u.id);
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (showMobileMenu && !event.target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showMobileMenu]);

  function fetchProducts(sellerId) {
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }

  function fetchOrders(sellerId) {
    fetch('/api/seller/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    router.push('/login');
  }

  // Delete handlers
  function confirmDelete(productId) {
    setDeleteId(productId);
  }

  function cancelDelete() {
    setDeleteId(null);
  }

  async function doDelete(productId) {
    const res = await fetch('/api/seller/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sellerId: user.id }),
    });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== productId));
      setDeleteId(null);
    }
  }

  async function doDeleteOrder(orderId) {
    const res = await fetch('/api/seller/orders/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sellerId: user.id }),
    });
    if (res.ok) {
      setOrders(orders.filter(o => o.id !== orderId));
      setDeleteOrderId(null);
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete order');
    }
  }

  async function updateOrderStatus(orderId, newStatus, extra = {}) {
    const res = await fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus, sellerId: user.id, ...extra }),
    });
    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, ...extra } : o));
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to update order status');
    }
  }

  function contactBuyer(phone) {
    window.open(`tel:${phone}`, '_blank');
  }

  function markAsShipped(orderId) {
    updateOrderStatus(orderId, 'shipped');
  }

  function filterOrders(status) {
    // TODO: Implement actual filtering
    fetchOrders(user.id);
  }

  // Add approve/reject payment handlers
  async function handleApprovePayment(orderId) {
    await fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentStatus: 'paid', sellerId: user.id }),
    });
    fetchOrders(user.id);
  }
  async function handleRejectPayment(orderId) {
    await fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentStatus: 'failed', clearReceipt: true, sellerId: user.id }),
    });
    fetchOrders(user.id);
  }

  // Calculate analytics metrics
  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = (order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0);
    return sum + orderTotal;
  }, 0);

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const topProducts = products
    .map(product => {
      const productOrders = orders.filter(order => order.productId === product.id);
      const revenue = productOrders.reduce((sum, order) => {
        return sum + ((order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0));
      }, 0);
      return { ...product, revenue, orderCount: productOrders.length };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockProducts = products.filter(product => product.quantity <= 5 && product.quantity > 0);
  const outOfStockProducts = products.filter(product => product.quantity === 0);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main dashboard content */}
      <div className="min-h-screen text-gray-900">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 transition-colors duration-300 text-gray-900">
                  {t.dashboard}
                </h1>
                <p className="text-lg transition-colors duration-300 text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium transition-colors duration-300 text-gray-600">
                    {t.totalRevenue}
                      </p>
                      <p className="text-2xl font-bold transition-colors duration-300 text-gray-900">
                    RM{totalRevenue.toFixed(2)}
                      </p>
                    </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium transition-colors duration-300 text-gray-600">
                    {t.totalOrders}
                      </p>
                      <p className="text-2xl font-bold transition-colors duration-300 text-gray-900">
                    {totalOrders}
                      </p>
                    </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium transition-colors duration-300 text-gray-600">
                    {t.averageOrderValue}
                      </p>
                      <p className="text-2xl font-bold transition-colors duration-300 text-gray-900">
                    RM{averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium transition-colors duration-300 text-gray-600">
                    {t.products}
                      </p>
                      <p className="text-2xl font-bold transition-colors duration-300 text-gray-900">
                    {products.length}
                      </p>
                    </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                  </div>
                </div>
              </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Order Status Chart */}
              <div className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold transition-colors duration-300 text-gray-900">
                  {t.orderStatus}
                  </h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                  {Object.entries(orderStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="capitalize transition-colors duration-300 text-gray-700">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-semibold transition-colors duration-300 text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

            {/* Top Products */}
            <div className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold transition-colors duration-300 text-gray-900">
                  {t.topProducts}
                </h2>
              </div>
              <div className="p-6">
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                            <div>
                              <p className="font-medium transition-colors duration-300 text-gray-900">
                              {product.name}
                              </p>
                              <p className="text-sm transition-colors duration-300 text-gray-600">
                              {product.orderCount} orders
                              </p>
                            </div>
                          </div>
                        <span className="font-semibold transition-colors duration-300 text-gray-900">
                          RM{product.revenue.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                    <p className="text-gray-500">{t.noData}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Inventory Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Low Stock Alert */}
            <div className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold transition-colors duration-300 text-gray-900">
                  {t.inventoryStatus}
                </h2>
              </div>
                      <div className="p-6">
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium transition-colors duration-300 text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm transition-colors duration-300 text-gray-600">
                            {t.lowStock}: {product.quantity} left
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {t.lowStock}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">All products have sufficient stock</p>
                  </div>
                )}
                          </div>
                        </div>
                        
            {/* Quick Actions */}
            <div className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold transition-colors duration-300 text-gray-900">
                  {t.quickActions}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                          <button 
                    onClick={() => router.push('/seller/dashboard/create-product')}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span>{t.createNewProduct}</span>
                    </div>
                          </button>
                          <button 
                    onClick={() => router.push('/seller/orders')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <span>{t.viewAllOrders}</span>
                    </div>
                          </button>
                          <button 
                    onClick={() => router.push('/seller/products')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                      <span>{t.viewAllProducts}</span>
                    </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

          {/* Recent Activity */}
          <div className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
            <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold transition-colors duration-300 text-gray-900">
                  {t.recentActivity}
                </h2>
                <button className="text-sm text-blue-600 hover:underline">
                  {t.viewAll}
                </button>
                    </div>
            </div>
            <div className="p-6">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border transition-colors duration-300 bg-gray-50 border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === 'shipped' ? 'bg-green-100' : 
                          order.status === 'pending' ? 'bg-yellow-100' : 
                          'bg-blue-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            order.status === 'shipped' ? 'text-green-600' : 
                            order.status === 'pending' ? 'text-yellow-600' : 
                            'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                    </div>
                    <div>
                          <p className="font-medium transition-colors duration-300 text-gray-900">
                            Order #{order.id}
                      </p>
                          <p className="text-sm transition-colors duration-300 text-gray-600">
                            {order.buyerName} • RM{((order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0)).toFixed(2)}
                      </p>
                    </div>
                    </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'shipped' ? 'bg-green-100 text-green-800' : 
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status === 'shipped' ? t.shippedStatus : 
                                 order.status === 'pending' ? t.pendingStatus : 
                                 t.processing}
                              </span>
                            </div>
                  ))}
                              </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-lg font-medium transition-colors duration-300 text-gray-600">
                    {t.noOrders}
                                </p>
                              </div>
              )}
                            </div>
                            </div>
                          </div>
                          
        {/* Confirmation dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this {confirmDeleteType}?</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={async () => {
                    if (confirmDeleteType === 'order') {
                      await doDeleteOrder(confirmDeleteId);
                    } else if (confirmDeleteType === 'product') {
                      await doDelete(confirmDeleteId);
                    }
                    setConfirmDeleteId(null);
                    setConfirmDeleteType(null);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => { setConfirmDeleteId(null); setConfirmDeleteType(null); }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerLanguage } from '../SellerLanguageContext';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import ReceiptManager from '@/components/ReceiptManager';
import SellerNotificationCenter from '@/components/SellerNotificationCenter';
import { downloadImage, isMobileDevice } from '@/utils/mobileDownload';
import ReminderFrequencySettings from '@/components/ReminderFrequencySettings';

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
  
  // QR Code state
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodeDescription, setQrCodeDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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
    
    // Set up 30-second reminder check
    const reminderInterval = setInterval(() => {
      checkPendingReceipts(u.id);
    }, 30000); // 30 seconds
    
    return () => clearInterval(reminderInterval);
  }, [router]);

  const checkPendingReceipts = async (sellerId) => {
    try {
      console.log('🔔 Checking for pending receipts...');
      const response = await fetch('/api/receipt/reminder-30s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('🔔 Reminder check completed:', data.summary);
      }
    } catch (error) {
      console.error('Error checking pending receipts:', error);
    }
  };

  async function fetchDashboardData(sellerId) {
    try {
      setLoading(true);
      
      // Initialize with empty arrays to prevent errors
      let orders = [];
      let products = [];
      
      // Fetch seller profile data (including QR code)
      try {
        const profileResponse = await fetch('/api/seller/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId })
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.user) {
            // Update user state with fresh data from database
            const updatedUser = { ...user, ...profileData.user };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        }
      } catch (profileError) {
        console.error('Error fetching seller profile:', profileError);
      }
      
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

  // QR Code handling functions
  const handleQRCodeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
    }
  };

  const handleQRCodeSubmit = async (e) => {
    e.preventDefault();
    if (!qrCodeFile || !user?.id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('qrCodeImage', qrCodeFile);
      formData.append('qrCodeDescription', qrCodeDescription);
      formData.append('sellerId', user.id);

      const response = await fetch('/api/seller/qr-code', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Update user state with new QR code
        const updatedUser = { ...user, qrCodeImage: result.qrCodeImage, qrCodeDescription: result.qrCodeDescription };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Reset form
        setQrCodeFile(null);
        setQrCodeDescription('');
        document.querySelector('input[type="file"]').value = '';
        
        alert(language === 'ms' ? 'QR Code berjaya dimuat naik!' : 'QR Code uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading QR code:', error);
      alert(language === 'ms' ? 'Ralat memuat naik QR Code' : 'Error uploading QR Code');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (isDownloading || !user?.qrCodeImage) return;
    
    setIsDownloading(true);
    setDownloadMessage('');
    
    const filename = `qr-code-${user.name || 'seller'}.jpg`;
    
    try {
      await downloadImage(user.qrCodeImage, filename, {
        onSuccess: (message) => {
          setDownloadMessage(message);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        onError: (error) => {
          setDownloadMessage(error);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        showInstructions: true
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadMessage('Download failed. Please try again.');
      setTimeout(() => setDownloadMessage(''), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewQR = () => {
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {language === 'ms' ? 'Produk' : 'Products'}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stats.totalProducts}</p>
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
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{stats.totalOrders}</p>
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

          {/* Payment Setup Alert - Mobile Responsive */}
          {!user?.bankAccountNumber && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start mb-4 sm:mb-0">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-university text-blue-600 text-lg sm:text-xl"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
                      {language === 'ms' ? 'Selesaikan Konfigurasi Pembayaran' : 'Complete Payment Setup'}
                    </h3>
                    <p className="text-blue-800 text-sm sm:text-base mb-3">
                      {language === 'ms' 
                        ? 'Pembeli memerlukan maklumat bank anda untuk membuat pembayaran. Sila konfigurasi akaun bank anda untuk mula menerima pembayaran.'
                        : 'Buyers need your bank information to make payments. Please configure your bank account to start receiving payments.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        className="btn btn-primary group hover:scale-105 transition-all duration-200 py-2 sm:py-3 px-4 sm:px-6"
                        onClick={() => router.push('/seller/bank-account')}
                      >
                        <i className="fas fa-cog mr-2 group-hover:rotate-180 transition-transform duration-200"></i>
                        {language === 'ms' ? 'Konfigurasi Sekarang' : 'Configure Now'}
                      </button>
                      <button
                        className="btn btn-outline text-blue-700 border-blue-300 hover:bg-blue-50 group hover:scale-105 transition-all duration-200 py-2 sm:py-3 px-4 sm:px-6"
                        onClick={() => router.push('/seller/profile')}
                      >
                        <i className="fas fa-info-circle mr-2"></i>
                        {language === 'ms' ? 'Ketahui Lebih Lanjut' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

                  {/* Bank Account Configuration Quick Action */}
                  {!user?.bankAccountNumber && (
                    <button
                      className="btn btn-warning w-full group hover:scale-105 transition-all duration-200 py-3 sm:py-4 border-2 border-orange-300"
                      onClick={() => router.push('/seller/bank-account')}
                    >
                      <i className="fas fa-university mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                      {language === 'ms' ? 'Konfigurasi Bank' : 'Setup Bank'}
                    </button>
                  )}

                </div>
              </div>

            </div>

            {/* Notification Center */}
            <div className="lg:col-span-1">
              <SellerNotificationCenter seller={user} />
            </div>

            {/* QR Code Management */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-qrcode text-green-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {language === 'ms' ? 'QR Code Pembayaran' : 'Payment QR Code'}
                  </h3>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                  </div>
                ) : (
                  <>
                    {/* QR Code Upload Form */}
                <form onSubmit={handleQRCodeSubmit} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Muat Naik QR Code' : 'Upload QR Code'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ms' ? 'Penerangan (Pilihan)' : 'Description (Optional)'}
                    </label>
                    <textarea
                      value={qrCodeDescription}
                      onChange={(e) => setQrCodeDescription(e.target.value)}
                      placeholder={language === 'ms' ? 'Contoh: Scan untuk bayar dengan Maybank2U' : 'Example: Scan to pay with Maybank2U'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                      rows="3"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {language === 'ms' ? 'Memuat Naik...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        {language === 'ms' ? 'Muat Naik QR Code' : 'Upload QR Code'}
                      </>
                    )}
                  </button>
                </form>

                {/* Current QR Code Display */}
                {user?.qrCodeImage && (
                  <div className="border-t pt-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {language === 'ms' ? 'QR Code Semasa' : 'Current QR Code'}
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <img
                          src={user.qrCodeImage}
                          alt="QR Code"
                          className="max-w-full h-auto max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                      
                      {user.qrCodeDescription && (
                        <p className="text-sm text-gray-600 mb-4 italic">
                          "{user.qrCodeDescription}"
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleViewQR}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <i className="fas fa-eye"></i>
                          {language === 'ms' ? 'Lihat' : 'View'}
                        </button>
                        
                        <button
                          onClick={handleDownloadQR}
                          disabled={isDownloading}
                          className={`flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                          {isDownloading 
                            ? (language === 'ms' ? 'Muat Turun...' : 'Downloading...') 
                            : (language === 'ms' ? 'Muat Turun' : 'Download')
                          }
                        </button>
                      </div>
                      
                      {/* Download Message */}
                      {downloadMessage && (
                        <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm">
                          {downloadMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                  </>
                )}
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

          {/* Reminder Frequency Settings */}
          <div className="mt-8">
            <ReminderFrequencySettings seller={user} />
          </div>

          {/* Receipt Management Section */}
          <div className="mt-8">
            <ReceiptManager seller={user} />
          </div>
        </div>
      </main>
      
      {/* QR Code Modal */}
      {showQRModal && user?.qrCodeImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={handleCloseQRModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'ms' ? 'QR Code Pembayaran' : 'Payment QR Code'}
                </h3>
                {user.qrCodeDescription && (
                  <p className="text-sm text-gray-600 italic mb-4">
                    "{user.qrCodeDescription}"
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <img
                  src={user.qrCodeImage}
                  alt="QR Code"
                  className="mx-auto max-w-full h-auto max-h-80 object-contain"
                  onError={(e) => {
                    console.error('QR code image failed to load:', e);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className={`flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                  {isDownloading 
                    ? (language === 'ms' ? 'Muat Turun...' : 'Downloading...') 
                    : (language === 'ms' ? 'Muat Turun' : 'Download')
                  }
                </button>
                
                <button
                  onClick={handleCloseQRModal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check"></i>
                  {language === 'ms' ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ModernFooter />
    </div>
  );
}
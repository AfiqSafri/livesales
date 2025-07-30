"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'buyer') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchProducts();
    fetchOrders(u.id);
  }, [router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  function fetchProducts() {
    fetch('/api/products', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }

  function fetchOrders(buyerId) {
    fetch(`/api/buyer/orders?buyerId=${buyerId}`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user.name}</p>
            </div>
            
            {/* User Menu */}
            <div className="relative user-menu">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-700 text-sm sm:text-base">{user?.name}</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                        {user?.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                        <div className="text-xs text-blue-600 mt-1">Buyer Account</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        router.push('/buyer/profile');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Edit Profile
                    </button>
                    
                    <button 
                      onClick={() => {
                        router.push('/buyer/orders');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      My Orders
                    </button>
                    
                    <button 
                      onClick={() => {
                        router.push('/buyer/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      Dashboard
                    </button>
                    
                    <button 
                      onClick={() => {
                        router.push('/');
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      Browse Products
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-1">
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Available Products</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      RM{orders.reduce((total, order) => {
                        const orderTotal = (order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0);
                        return total + orderTotal;
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{order.product?.name}</h3>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          {/* Payment status message */}
                          {order.paymentStatus === 'pending' && (
                            <p className="text-yellow-700 text-xs mt-1">Payment awaiting seller approval</p>
                          )}
                          {order.paymentStatus === 'paid' && (
                            <p className="text-green-700 text-xs mt-1">Payment approved! Your order is being processed.</p>
                          )}
                          {order.paymentStatus === 'failed' && (
                            <p className="text-red-700 text-xs mt-1">Payment rejected. Please upload a valid receipt or contact support.</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            RM{((order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0)).toFixed(2)}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                            order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Browse Products
                </button>
                                    <button 
                      onClick={() => router.push('/buyer/profile')}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => router.push('/buyer/orders')}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      View All Orders
                    </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium text-gray-900">Buyer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-medium text-gray-900">{orders.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
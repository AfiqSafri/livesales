"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function BuyerOrders() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, processing, ready_to_ship, shipped, out_for_delivery, delivered, completed, cancelled, returned
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [uploadingOrderId, setUploadingOrderId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'buyer') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchOrders(u.id);
    
    // Refresh orders every 30 seconds to get latest payment status
    const interval = setInterval(() => {
      fetchOrders(u.id);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [router]);

  function fetchOrders(buyerId) {
    setLoading(true);
    fetch(`/api/buyer/orders?buyerId=${buyerId}`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    router.push('/login');
  }

  async function trackOrder(order) {
    if (!order.trackingNumber || !order.courierName) {
      alert('No tracking information available for this order');
      return;
    }

    setTrackingOrder(order);
    setTrackingLoading(true);
    
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: order.trackingNumber,
          courierName: order.courierName
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        alert('Failed to track order');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Error tracking order');
    } finally {
      setTrackingLoading(false);
    }
  }

  async function handleReuploadReceipt(orderId) {
    const fileInput = fileInputRefs.current[orderId];
    if (!fileInput || !fileInput.files[0]) {
      setUploadError('Please select a receipt file to upload.');
      return;
    }
    setUploadingOrderId(orderId);
    setUploadError('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('receipt', fileInput.files[0]);
      const res = await fetch('/api/buyer/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Failed to upload receipt.');
      } else {
        setUploadSuccess(true);
        fetchOrders(user.id);
      }
    } catch (err) {
      setUploadError('Failed to upload receipt.');
    } finally {
      setUploadingOrderId(null);
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'ready_to_ship': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-teal-100 text-teal-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
      case 'processing': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      );
      case 'shipped': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      );
      case 'delivered': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 text-sm sm:text-base">Track your order status and history</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/buyer/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { key: 'paid', label: 'Paid', count: orders.filter(o => o.status === 'paid').length },
              { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
              { key: 'ready_to_ship', label: 'Ready to Ship', count: orders.filter(o => o.status === 'ready_to_ship').length },
              { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
              { key: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Start shopping to see your orders here' 
                : `You don't have any ${filter} orders at the moment`
              }
            </p>
            {filter === 'all' && (
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {order.product?.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Quantity: {order.quantity}</span>
                          <span>Seller: {order.product?.seller?.name}</span>
                        </div>
                        
                        {/* Payment Status Display */}
                        <div className="mt-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus === 'pending' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            )}
                            {order.paymentStatus === 'paid' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                            {order.paymentStatus === 'failed' && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            )}
                            Payment: {order.paymentStatus.toUpperCase()}
                          </div>
                          
                          {/* Payment Status Messages */}
                          {order.paymentStatus === 'pending' && order.receiptUrl && (
                            <p className="text-yellow-700 text-sm mt-2">
                              📄 Receipt uploaded! Waiting for seller approval...
                            </p>
                          )}
                          {order.paymentStatus === 'pending' && !order.receiptUrl && (
                            <p className="text-yellow-700 text-sm mt-2">
                              ⚠️ Please upload your payment receipt to proceed with the order.
                            </p>
                          )}
                          {order.paymentStatus === 'paid' && (
                            <p className="text-green-700 text-sm mt-2">
                              ✅ Payment approved! Your order is being processed.
                            </p>
                          )}
                          {order.paymentStatus === 'failed' && (
                            <p className="text-red-700 text-sm mt-2">
                              ❌ Payment rejected. Please upload a valid receipt or contact support.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 mb-2">
                          RM{((order.product?.price || 0) * order.quantity + (order.product?.shippingPrice || 0)).toFixed(2)}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">Name:</span> {order.buyerName}</p>
                          <p><span className="font-medium">Phone:</span> {order.phone}</p>
                          <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Timeline</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Order placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {order.status !== 'pending' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Order confirmed by seller</span>
                            </div>
                          )}
                          {order.status === 'shipped' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Order shipped</span>
                            </div>
                          )}
                          {order.status === 'delivered' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Order delivered</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Re-upload receipt if payment failed */}
                {order.paymentStatus === 'failed' && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-900 font-semibold mb-2">Your payment was rejected. Please re-upload a valid receipt.</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      ref={el => (fileInputRefs.current[order.id] = el)}
                      className="mb-2"
                      disabled={uploadingOrderId === order.id}
                    />
                    {uploadError && <p className="text-red-600 text-sm mb-2">{uploadError}</p>}
                    {uploadSuccess && uploadingOrderId === order.id && <p className="text-green-600 text-sm mb-2">Receipt uploaded successfully!</p>}
                    <button
                      onClick={() => handleReuploadReceipt(order.id)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                      disabled={uploadingOrderId === order.id}
                    >
                      {uploadingOrderId === order.id ? 'Uploading...' : 'Re-upload Receipt'}
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                                         <button
                       onClick={() => router.push(`/product/${order.productId}`)}
                       className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                     >
                       View Product
                     </button>
                     {order.trackingNumber && order.courierName && (
                       <button
                         onClick={() => trackOrder(order)}
                         className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                       >
                         Track Order
                       </button>
                     )}
                     {order.product?.seller?.phone && (
                       <button
                         onClick={() => window.open(`tel:${order.product.seller.phone}`)}
                         className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                       >
                         Contact Seller
                       </button>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
                <button
                  onClick={() => {
                    setTrackingOrder(null);
                    setTrackingData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{trackingOrder.product?.name}</h3>
                <p className="text-sm text-gray-600">Order #{trackingOrder.id}</p>
                <p className="text-sm text-gray-600">Tracking: {trackingOrder.trackingNumber}</p>
                <p className="text-sm text-gray-600">Courier: {trackingOrder.courierName}</p>
              </div>

              {trackingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Tracking order...</p>
                </div>
              ) : trackingData ? (
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.courierStatus.status)}`}>
                        {trackingData.courierStatus.status.replace('_', ' ').toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600">{trackingData.courierStatus.location}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">{trackingData.courierStatus.description}</p>
                  </div>

                  {/* Status History */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-3">
                      {trackingOrder.statusHistory?.map((history, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                                {history.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(history.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{history.description}</p>
                            {history.location && (
                              <p className="text-xs text-gray-500">📍 {history.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {trackingOrder.estimatedDelivery && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Estimated Delivery</h4>
                      <p className="text-green-700">
                        {new Date(trackingOrder.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No tracking data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
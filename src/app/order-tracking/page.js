"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderTracking() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId || !buyerEmail) {
      setError('Please enter both Order ID and Email');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, buyerEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch order details');
        return;
      }

      setOrder(data.order);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'processing': '⚙️',
      'shipped': '📦',
      'delivered': '✅',
      'cancelled': '❌',
      'paid': '💰',
      'failed': '❌'
    };
    return icons[status] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Home
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Order Tracking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Track Your Order</h2>
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="Enter your order ID"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  value={buyerEmail} 
                  onChange={(e) => setBuyerEmail(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="Enter your email address"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Tracking Order...
                </div>
              ) : (
                'Track Order'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Order Header */}
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{order.id}</h2>
                  <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                    {getStatusIcon(order.paymentStatus)} {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Product:</span> {order.productName}</p>
                    <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                    <p><span className="font-medium">Total Amount:</span> RM{order.totalAmount.toFixed(2)}</p>
                    <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'Not specified'}</p>
                    {order.paymentDate && (
                      <p><span className="font-medium">Payment Date:</span> {new Date(order.paymentDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Shipping Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {order.buyerName}</p>
                    <p><span className="font-medium">Email:</span> {order.buyerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {order.phone}</p>
                    <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                    {order.trackingNumber && (
                      <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber}</p>
                    )}
                    {order.courierName && (
                      <p><span className="font-medium">Courier:</span> {order.courierName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {order.seller && (
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{order.seller.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.seller.name}</p>
                    <p className="text-sm text-gray-600">{order.seller.email}</p>
                    {order.seller.phone && (
                      <p className="text-sm text-gray-600">{order.seller.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status History */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStatusColor(history.status)}`}>
                        {getStatusIcon(history.status)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.createdAt).toLocaleDateString()} {new Date(history.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{history.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">📍 {history.location}</span>
                        <span className="text-xs text-gray-500">👤 {history.updatedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
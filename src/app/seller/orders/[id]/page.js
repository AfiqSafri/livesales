"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useSellerLanguage } from '../../SellerLanguageContext';

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { language } = useSellerLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchOrderDetails();
  }, [id, router]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/seller/orders/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data.order);
      } else {
        alert('Error loading order details');
        router.push('/seller/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ready_to_ship': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'shipped': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'out_for_delivery': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'delivered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-gray-900 dark:text-white">
        <div className="p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen text-gray-900 dark:text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <button
            onClick={() => router.push('/seller/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {order.product?.name} - {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => router.push('/seller/orders')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium text-gray-900">{order.trackingNumber}</span>
                  </div>
                )}
                {order.courierName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Courier:</span>
                    <span className="font-medium text-gray-900">{order.courierName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium text-gray-900">{order.buyerName || (order.buyer ? order.buyer.name : 'Guest')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{order.buyerEmail || (order.buyer ? order.buyer.email : 'N/A')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Shipping Address:</span>
                  <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Product Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Product:</span>
                  <p className="font-medium text-gray-900">{order.product?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <p className="font-medium text-gray-900">{order.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-600">Unit Price:</span>
                  <p className="font-medium text-gray-900">RM{order.product?.price}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <p className="font-medium text-green-600">RM{order.totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="space-y-6">
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Timeline</h2>
              <div className="space-y-4">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
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
                  ))
                ) : (
                  <p className="text-gray-500">No status history available</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/seller/orders/${order.id}/edit`)}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Update Order Status
                </button>
                {order.buyerEmail && (
                  <button
                    onClick={() => window.open(`mailto:${order.buyerEmail}`, '_blank')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Contact Customer
                  </button>
                )}
                {order.phone && (
                  <button
                    onClick={() => window.open(`tel:${order.phone}`, '_blank')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Call Customer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
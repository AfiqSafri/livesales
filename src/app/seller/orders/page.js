"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSellerLanguage } from '../SellerLanguageContext';

export default function SellerOrders() {
  const router = useRouter();

  const { language } = useSellerLanguage();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchOrders(u.id);
  }, [router]);

  function fetchOrders(sellerId) {
    fetch('/api/seller/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId }),
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }

  function handleApprovePayment(orderId) {
    if (!confirm('Are you sure you want to approve this payment?')) return;
    
    fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id,
        paymentStatus: 'paid',
        clearReceipt: true
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Payment approved successfully!');
          fetchOrders(user.id);
          setShowReceiptModal(false);
        } else {
          alert('Error approving payment: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error approving payment: ' + err.message);
      });
  }

  function handleRejectPayment(orderId) {
    if (!confirm('Are you sure you want to reject this payment?')) return;
    
    fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id,
        paymentStatus: 'failed',
        clearReceipt: true
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Payment rejected successfully!');
          fetchOrders(user.id);
          setShowReceiptModal(false);
        } else {
          alert('Error rejecting payment: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error rejecting payment: ' + err.message);
      });
  }

  function handleDeleteOrder(orderId) {
    fetch('/api/seller/orders/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Order deleted successfully!');
          fetchOrders(user.id);
        } else {
          alert('Error deleting order: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error deleting order: ' + err.message);
      });
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getPaymentStatusColor(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Orders</h1>
        <p className="text-lg mb-8 text-gray-600">{orders.length} total orders</p>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-lg font-medium mb-4 text-gray-900">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{order.product.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Customer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Name:</span> {order.buyerName || (order.buyer ? order.buyer.name : 'Guest')}</p>
                            <p><span className="font-medium">Email:</span> {order.buyerEmail || (order.buyer ? order.buyer.email : 'N/A')}</p>
                            <p><span className="font-medium">Phone:</span> {order.phone}</p>
                            <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                            <p><span className="font-medium">Total Amount:</span> RM{order.totalAmount}</p>
                            <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.trackingNumber && (
                              <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt Section */}
                      {order.receiptUrl && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Payment Receipt</h4>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowReceiptModal(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              View Receipt
                            </button>
                            {order.paymentStatus === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprovePayment(order.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Approve Payment
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(order.id)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  Reject Payment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/seller/orders/${order.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/seller/orders/${order.id}/edit`)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Update Status
                        </button>
                        {order.buyerEmail && (
                          <button
                            onClick={() => window.open(`mailto:${order.buyerEmail}`, '_blank')}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            Contact Customer
                          </button>
                        )}
                        {order.phone && (
                          <button
                            onClick={() => window.open(`tel:${order.phone}`, '_blank')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Call Customer
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                              handleDeleteOrder(order.id);
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Order: {selectedOrder.product.name} - RM{selectedOrder.totalAmount}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Customer: {selectedOrder.buyerName || (selectedOrder.buyer ? selectedOrder.buyer.name : 'Guest')}
              </p>
            </div>

            <div className="mb-6">
              <img
                src={selectedOrder.receiptUrl}
                alt="Payment Receipt"
                className="w-full h-auto rounded-lg border border-gray-200"
              />
            </div>

            {selectedOrder.paymentStatus === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovePayment(selectedOrder.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => handleRejectPayment(selectedOrder.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Reject Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerLanguage } from '../SellerLanguageContext';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';

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

  function handleCompletePayment(orderId) {
    if (!confirm('Are you sure you want to mark this payment as completed? This will update the order status and send confirmation emails.')) return;
    
    fetch('/api/seller/orders/complete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id,
        paymentMethod: 'manual_confirmation',
        paymentReference: `MANUAL_${Date.now()}`
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Payment completed successfully! Order status updated to processing.');
          fetchOrders(user.id);
        } else {
          alert('Error completing payment: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error completing payment: ' + err.message);
      });
  }

  function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Are you sure you want to change the status to "${newStatus.replace('_', ' ').toUpperCase()}"?`)) return;

    fetch('/api/seller/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id,
        status: newStatus,
        clearReceipt: true
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`Status updated to "${newStatus.replace('_', ' ').toUpperCase()}" successfully!`);
          fetchOrders(user.id);
        } else {
          alert('Error updating status: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error updating status: ' + err.message);
      });
  }

  function updateTrackingNumber(orderId, trackingNumber) {
    if (!trackingNumber) {
      alert('Tracking number cannot be empty.');
      return;
    }

    if (!confirm('Are you sure you want to update the tracking number?')) return;

    fetch('/api/seller/orders/update-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId: user.id,
        trackingNumber,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Tracking number updated successfully!');
          fetchOrders(user.id);
        } else {
          alert('Error updating tracking number: ' + data.error);
        }
      })
      .catch(err => {
        alert('Error updating tracking number: ' + err.message);
      });
  }

  function setCustomerNotification(orderId, enabled) {
    // Store notification preference in localStorage for now
    // In a real app, this would be sent to the backend
    const key = `order_${orderId}_notifications`;
    localStorage.setItem(key, enabled.toString());
    
    if (enabled) {
      console.log(`Customer notifications enabled for order ${orderId}`);
    } else {
      console.log(`Customer notifications disabled for order ${orderId}`);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      {/* Main Content */}
      <main className="pt-20 pb-16 sm:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Orders</h1>
            <p className="text-base sm:text-lg text-gray-600">{orders.length} total orders</p>
          </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-base sm:text-lg font-medium mb-4 text-gray-900">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border transition-colors duration-300 bg-white border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">{order.product.name}</h3>
                        {/* Show both payment status and order status clearly */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Payment Status */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus.toUpperCase()}
                          </span>
                          {/* Order/Shipping Status */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            Shipping: {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Customer Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 text-base">Customer Information</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-gray-700">Name:</span>
                              <span className="break-words">{order.buyerName || (order.buyer ? order.buyer.name : 'Guest')}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-gray-700">Email:</span>
                              <span className="break-words text-blue-600">{order.buyerEmail || (order.buyer ? order.buyer.email : 'N/A')}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-gray-700">Phone:</span>
                              <span className="break-words text-green-600">{order.phone}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-gray-700">Address:</span>
                              <span className="break-words">{order.shippingAddress}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Quantity:</span>
                              <span className="font-semibold text-gray-900">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Amount:</span>
                              <span className="font-semibold text-green-600">RM{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Order Date:</span>
                              <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Current Status:</span>
                              <span className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700">Tracking Number:</span>
                                <span className="font-medium text-blue-600 break-all">{order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt Section */}
                      {order.receiptUrl && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Payment Receipt</h4>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <button
                              className="btn btn-primary group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowReceiptModal(true);
                              }}
                            >
                              <i className="fas fa-eye mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                              View Receipt
                            </button>
                            {order.paymentStatus === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                  className="btn btn-success group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                                  onClick={() => handleApprovePayment(order.id)}
                                >
                                  <i className="fas fa-check mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                                  Approve Payment
                                </button>
                                <button
                                  className="btn btn-danger group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                                  onClick={() => handleRejectPayment(order.id)}
                                >
                                  <i className="fas fa-times mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                                  Reject Payment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Manual Payment Completion Section */}
                      {order.paymentStatus === 'pending' && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Manual Payment Completion</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            If the customer has already made payment but the status is still pending, you can manually complete the payment
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-primary group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                              onClick={() => handleCompletePayment(order.id)}
                            >
                              <i className="fas fa-check-circle mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                              Complete Payment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Shipping Status Update Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Status Management</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Update the shipping status to keep customers informed about their order progress
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          <button
                            className={`btn btn-sm ${order.status === 'pending' ? 'btn-primary' : 'btn-outline'} group hover:scale-105 transition-all duration-200 w-full`}
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                          >
                            <i className="fas fa-clock mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Pending</span>
                            <span className="sm:hidden">Pend</span>
                          </button>
                          <button
                            className={`btn btn-sm ${order.status === 'processing' ? 'btn-primary' : 'btn-outline'} group hover:scale-105 transition-all duration-200 w-full`}
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                          >
                            <i className="fas fa-cog mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Processing</span>
                            <span className="sm:hidden">Proc</span>
                          </button>
                          <button
                            className={`btn btn-sm ${order.status === 'shipped' ? 'btn-primary' : 'btn-outline'} group hover:scale-105 transition-all duration-200 w-full`}
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                          >
                            <i className="fas fa-shipping-fast mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Shipped</span>
                            <span className="sm:hidden">Ship</span>
                          </button>
                          <button
                            className={`btn btn-sm ${order.status === 'delivered' ? 'btn-primary' : 'btn-outline'} group hover:scale-105 transition-all duration-200 w-full`}
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            <i className="fas fa-check-circle mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Delivered</span>
                            <span className="sm:hidden">Deliv</span>
                          </button>
                          <button
                            className={`btn btn-sm ${order.status === 'cancelled' ? 'btn-primary' : 'btn-outline'} group hover:scale-105 transition-all duration-200 w-full`}
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            <i className="fas fa-ban mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Cancelled</span>
                            <span className="sm:hidden">Cancel</span>
                          </button>
                        </div>
                      </div>

                      {/* Tracking Number Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Tracking Information</h4>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <input
                            type="text"
                            placeholder="Enter tracking number"
                            defaultValue={order.trackingNumber || ''}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            onBlur={(e) => updateTrackingNumber(order.id, e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-primary group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                            onClick={() => {
                              const trackingInput = document.querySelector(`input[placeholder="Enter tracking number"]`);
                              if (trackingInput) {
                                updateTrackingNumber(order.id, trackingInput.value);
                              }
                            }}
                          >
                            <i className="fas fa-truck mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            Update Tracking
                          </button>
                        </div>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-2">
                            Current tracking: <span className="font-medium break-all">{order.trackingNumber}</span>
                          </p>
                        )}
                      </div>

                      {/* Status History Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Status History</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Order Created:</span>
                              <span className="font-medium">{formatDate(order.createdAt)}</span>
                            </div>
                            {order.statusUpdatedAt && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Last Status Update:</span>
                                <span className="font-medium">{formatDate(order.statusUpdatedAt)}</span>
                              </div>
                            )}
                            {order.trackingNumber && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Tracking Added:</span>
                                <span className="font-medium">{formatDate(order.trackingUpdatedAt || order.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Notification Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Customer Communication</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-800 font-medium">Notify Customer of Status Changes</p>
                              <p className="text-xs text-blue-600">Send email updates when shipping status changes</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked={true}
                                onChange={(e) => setCustomerNotification(order.id, e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <button
                          className="btn btn-primary group hover:scale-105 transition-all duration-200 w-full"
                          onClick={() => router.push(`/seller/orders/${order.id}`)}
                        >
                          <i className="fas fa-eye mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                          View Details
                        </button>
                        <button
                          className="btn btn-warning group hover:scale-105 transition-all duration-200 w-full"
                          onClick={() => router.push(`/seller/orders/${order.id}/edit`)}
                        >
                          <i className="fas fa-edit mr-2 group-hover:rotate-12 transition-transform duration-200"></i>
                          Update Status
                        </button>
                        {order.buyerEmail && (
                          <button
                            className="btn btn-outline group hover:scale-105 transition-all duration-200 w-full"
                            onClick={() => window.open(`mailto:${order.buyerEmail}`, '_blank')}
                          >
                            <i className="fas fa-envelope mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Contact Customer</span>
                            <span className="sm:hidden">Email</span>
                          </button>
                        )}
                        {order.phone && (
                          <button
                            className="btn btn-success group hover:scale-105 transition-all duration-200 w-full"
                            onClick={() => window.open(`tel:${order.phone}`, '_blank')}
                          >
                            <i className="fas fa-phone mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                            <span className="hidden sm:inline">Call Customer</span>
                            <span className="sm:hidden">Call</span>
                          </button>
                        )}
                        <button
                          className="btn btn-danger group hover:scale-105 transition-all duration-200 w-full"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this order?')) {
                              // Handle order deletion
                              alert('Order deletion functionality not implemented yet');
                            }
                          }}
                        >
                          <i className="fas fa-trash mr-2 group-hover:scale-110 transition-transform duration-200"></i>
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

        {/* Receipt Modal */}
        {showReceiptModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                <button
                  className="btn btn-outline group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  onClick={() => setShowReceiptModal(false)}
                >
                  <i className="fas fa-times mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                  Close
                </button>
              </div>
              
              {selectedOrder.receiptUrl && (
                <div className="text-center">
                  <img 
                    src={selectedOrder.receiptUrl} 
                    alt="Payment Receipt" 
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}
              
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  className="btn btn-outline group hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  onClick={() => setShowReceiptModal(false)}
                >
                  <i className="fas fa-times mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    
    <ModernFooter />
  </div>
  );
} 
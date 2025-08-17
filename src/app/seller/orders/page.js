"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerLanguage } from '../SellerLanguageContext';
import ProfessionalButton from '../../../components/ProfessionalButton';

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
                        {/* Show both payment status and order status clearly */}
                        <div className="flex items-center gap-2">
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
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-medium">RM{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Order Date:</span>
                              <span className="font-medium">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Status:</span>
                              <span className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex justify-between">
                                <span>Tracking Number:</span>
                                <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt Section */}
                      {order.receiptUrl && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Payment Receipt</h4>
                          <div className="flex items-center gap-3">
                            <ProfessionalButton
                              variant="primary"
                              size="medium"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowReceiptModal(true);
                              }}
                            >
                              View Receipt
                            </ProfessionalButton>
                            {order.paymentStatus === 'pending' && (
                              <div className="flex gap-2">
                                <ProfessionalButton
                                  variant="success"
                                  size="medium"
                                  onClick={() => handleApprovePayment(order.id)}
                                >
                                  Approve Payment
                                </ProfessionalButton>
                                <ProfessionalButton
                                  variant="danger"
                                  size="medium"
                                  onClick={() => handleRejectPayment(order.id)}
                                >
                                  Reject Payment
                                </ProfessionalButton>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Shipping Status Update Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Status Management</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Update the shipping status to keep customers informed about their order progress
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <ProfessionalButton
                            variant={order.status === 'pending' ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                          >
                            Pending
                          </ProfessionalButton>
                          <ProfessionalButton
                            variant={order.status === 'processing' ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                          >
                            Processing
                          </ProfessionalButton>
                          <ProfessionalButton
                            variant={order.status === 'shipped' ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                          >
                            Shipped
                          </ProfessionalButton>
                          <ProfessionalButton
                            variant={order.status === 'delivered' ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            Delivered
                          </ProfessionalButton>
                          <ProfessionalButton
                            variant={order.status === 'cancelled' ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            Cancelled
                          </ProfessionalButton>
                        </div>
                      </div>

                      {/* Tracking Number Section */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Tracking Information</h4>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Enter tracking number"
                            defaultValue={order.trackingNumber || ''}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onBlur={(e) => updateTrackingNumber(order.id, e.target.value)}
                          />
                          <ProfessionalButton
                            variant="info"
                            size="medium"
                            onClick={() => {
                              const trackingInput = document.querySelector(`input[placeholder="Enter tracking number"]`);
                              if (trackingInput) {
                                updateTrackingNumber(order.id, trackingInput.value);
                              }
                            }}
                          >
                            Update Tracking
                          </ProfessionalButton>
                        </div>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-2">
                            Current tracking: <span className="font-medium">{order.trackingNumber}</span>
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
                      <div className="flex gap-2 flex-wrap">
                        <ProfessionalButton
                          variant="primary"
                          size="medium"
                          onClick={() => router.push(`/seller/orders/${order.id}`)}
                        >
                          View Details
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="warning"
                          size="medium"
                          onClick={() => router.push(`/seller/orders/${order.id}/edit`)}
                        >
                          Update Status
                        </ProfessionalButton>
                        {order.buyerEmail && (
                          <ProfessionalButton
                            variant="info"
                            size="medium"
                            onClick={() => window.open(`mailto:${order.buyerEmail}`, '_blank')}
                          >
                            Contact Customer
                          </ProfessionalButton>
                        )}
                        {order.phone && (
                          <ProfessionalButton
                            variant="success"
                            size="medium"
                            onClick={() => window.open(`tel:${order.phone}`, '_blank')}
                          >
                            Call Customer
                          </ProfessionalButton>
                        )}
                        <ProfessionalButton
                          variant="danger"
                          size="medium"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this order?')) {
                              // Handle order deletion
                              alert('Order deletion functionality not implemented yet');
                            }
                          }}
                        >
                          Delete Order
                        </ProfessionalButton>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                <ProfessionalButton
                  variant="outline"
                  size="small"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </ProfessionalButton>
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
                <ProfessionalButton
                  variant="outline"
                  size="medium"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useSellerLanguage } from '../../../SellerLanguageContext';

export default function EditOrder() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { language } = useSellerLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    courierName: '',
    estimatedDelivery: '',
    sellerNotes: ''
  });

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
        setFormData({
          status: data.order.status,
          trackingNumber: data.order.trackingNumber || '',
          courierName: data.order.courierName || '',
          estimatedDelivery: data.order.estimatedDelivery ? new Date(data.order.estimatedDelivery).toISOString().split('T')[0] : '',
          sellerNotes: data.order.sellerNotes || ''
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/seller/orders/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          sellerId: user.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order status updated successfully!');
        router.push(`/seller/orders/${id}`);
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Update Order #{order.id}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {order.product?.name} - {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => router.push(`/seller/orders/${id}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Order
          </button>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Information */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <p className="text-gray-900 font-medium">{order.product?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <p className="text-gray-900 font-medium">{order.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <p className="text-green-600 font-medium">RM{order.totalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <p className="text-gray-900 font-medium">{order.buyerName || (order.buyer ? order.buyer.name : 'Guest')}</p>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="rounded-lg border p-6 bg-white border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Update Order Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="ready_to_ship">Ready to Ship</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Courier Name
                    </label>
                    <input
                      type="text"
                      name="courierName"
                      value={formData.courierName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., PosLaju, J&T, NinjaVan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    name="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seller Notes
                  </label>
                  <textarea
                    name="sellerNotes"
                    value={formData.sellerNotes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Add any notes for the customer..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push(`/seller/orders/${id}`)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Order Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
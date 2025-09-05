"use client";
import { useState, useEffect } from 'react';

export default function SellerPayoutRequest({ sellerId }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (sellerId) {
      fetchPendingOrders();
    }
  }, [sellerId]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/pending-payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId })
      });

      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data.orders || []);
      } else {
        console.error('Failed to fetch pending orders');
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async (orderId, amount) => {
    try {
      setPayoutLoading(true);
      setMessage('');

      const response = await fetch('/api/payout/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId,
          orderId,
          amount,
          description: `Payout request for order #${orderId}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Payout initiated successfully! Reference: ${data.reference}`);
        // Refresh pending orders
        fetchPendingOrders();
      } else {
        setMessage(`❌ ${data.error || 'Failed to initiate payout'}`);
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      setMessage('❌ Error processing payout request');
    } finally {
      setPayoutLoading(false);
    }
  };

  const calculateTotalPending = () => {
    return pendingOrders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const calculatePlatformFee = (amount) => {
    return amount * 0.05; // 5% platform fee
  };

  const calculateSellerAmount = (amount) => {
    return amount - calculatePlatformFee(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Requests</h3>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          <p className="text-gray-500">No pending payouts available</p>
          <p className="text-sm text-gray-400 mt-1">All your orders have been processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payout Requests</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold text-green-600">RM {calculateTotalPending().toFixed(2)}</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                <p className="text-sm text-gray-600">{order.product?.name || 'Product'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-MY')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">RM {order.totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  Platform Fee: RM {calculatePlatformFee(order.totalAmount).toFixed(2)}
                </p>
                <p className="text-sm font-medium text-green-600">
                  You'll receive: RM {calculateSellerAmount(order.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span>Buyer: {order.buyerName}</span>
                <span className="mx-2">•</span>
                <span>Qty: {order.quantity}</span>
              </div>
              
              <button
                onClick={() => handlePayoutRequest(order.id, order.totalAmount)}
                disabled={payoutLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {payoutLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Request Payout'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How Payouts Work</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Platform fee: 5% of order amount</p>
          <p>• Payouts are processed within 1-3 business days</p>
          <p>• Money is transferred directly to your bank account</p>
          <p>• You'll receive email notifications for all payout updates</p>
        </div>
      </div>
    </div>
  );
}





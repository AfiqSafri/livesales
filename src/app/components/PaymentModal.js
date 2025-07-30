"use client";
import { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, orderDetails, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBillplzPayment = async () => {
    if (!orderDetails) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/billplz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderDetails.orderId,
          amount: orderDetails.total,
          description: `Payment for ${orderDetails.productName} - Order #${orderDetails.orderId}`,
          buyerName: orderDetails.buyerName,
          buyerEmail: orderDetails.buyerEmail,
          buyerPhone: orderDetails.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      if (data.success && data.paymentUrl) {
        // Redirect to Billplz payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {orderDetails && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{orderDetails.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{orderDetails.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-green-600">RM{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <h4 className="font-semibold text-blue-900">Test Payment Environment</h4>
              </div>
              <p className="text-blue-700 text-sm">
                This is a test payment environment. No real money will be charged. You'll be redirected to our test payment page.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleBillplzPayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Test Payment'
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
} 
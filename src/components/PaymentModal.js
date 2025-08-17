"use client";
import { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, plan, user, discount, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planPrices = {
    pro: 20
  };

  const planFeatures = {
    pro: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Custom branding', 'Express shipping', 'API access']
  };

  // Prevent rendering if plan is not a string or not valid
  if (!isOpen) return null;
  if (typeof plan !== "string" || !planPrices[plan]) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invalid plan selected</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/billplz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: plan,
          email: user.email,
          name: user.name,
          phone: user.phone,
          discount: discount // send discount info if needed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment');
        return;
      }

      window.location.href = data.billUrl;

    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Upgrade to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Plan Details */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-900">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h3>
              <span className="text-2xl font-bold text-blue-600">RM {planPrices[plan]}</span>
            </div>
            <p className="text-sm text-blue-700">per month</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Features included:</h4>
            <ul className="space-y-1">
              {planFeatures[plan].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Discount Info */}
        {discount && discount.isValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-900 mb-2">Discount Applied!</h4>
            <div className="space-y-1 text-sm text-yellow-800">
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-medium">{discount.discountLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span className="line-through">RM {discount.originalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounted Price:</span>
                <span className="font-bold text-green-700">RM {discount.discountedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings:</span>
                <span>RM {discount.savings}</span>
              </div>
              {discount.discountEndDate && (
                <div className="flex justify-between">
                  <span>Ends:</span>
                  <span>{discount.discountEndDate}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">
                RM {discount && discount.isValid ? discount.discountedPrice : planPrices[plan]}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-medium">Monthly</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        {/* Payment Security */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Secure payment powered by Billplz
          </div>
        </div>
      </div>
    </div>
  );
}
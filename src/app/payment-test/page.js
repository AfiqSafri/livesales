"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [testCard, setTestCard] = useState('4000 0000 0000 0002');
  const [expiry, setExpiry] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [name, setName] = useState('Test Customer');

  const billId = searchParams.get('billId');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const handlePayment = async () => {
    setLoading(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Simulate successful payment
      const response = await fetch('/api/payment/billplz/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billplz_id: billId,
          billplz_paid: 'true',
          billplz_paid_at: new Date().toISOString(),
          billplz_paid_amount: amount
        })
      });

      if (response.ok) {
        // Redirect to success page
        const successUrl = `/order-success?product=Test Product&quantity=1&total=${amount}&orderId=${orderId}`;
        router.push(successUrl);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Simulate failed payment
    fetch('/api/payment/billplz/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billplz_id: billId,
        billplz_paid: 'false'
      })
    });
    
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Test Payment</h1>
          <p className="text-gray-600 mt-2">Complete your payment securely</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill ID:</span>
              <span className="font-medium">{billId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-green-600">RM{amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <span>Credit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <span>Bank Transfer</span>
            </label>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === 'credit_card' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={testCard}
                onChange={(e) => setTestCard(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4000 0000 0000 0002"
              />
              <p className="text-xs text-gray-500 mt-1">Test card number</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cardholder Name"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'bank_transfer' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Bank:</strong> Test Bank Malaysia</p>
              <p><strong>Account Number:</strong> 1234-5678-9012-3456</p>
                              <p><strong>Account Name:</strong> Livesalez Test Account</p>
              <p><strong>Reference:</strong> {billId}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className="text-green-800 font-medium">Secure Test Payment</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            This is a test payment environment. No real money will be charged.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay RM${amount}`
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel Payment
          </button>
        </div>

        {/* Test Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Test Information</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Test Card:</strong> 4000 0000 0000 0002</p>
            <p><strong>Expiry:</strong> Any future date</p>
            <p><strong>CVV:</strong> Any 3 digits</p>
            <p><strong>Environment:</strong> Sandbox (No real charges)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTest() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentTestContent />
    </Suspense>
  );
} 
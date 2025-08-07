'use client';

import { useState } from 'react';

export default function AdminTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testSubscriptionNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/subscription-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          action: 'create_payment',
          plan: 'basic'
        })
      });
      
      const data = await response.json();
      setResult({
        success: response.ok,
        message: response.ok ? '✅ Subscription test completed! Check admin email.' : '❌ Test failed',
        data: data
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  const testPaymentNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/test-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: 'TEST_PAYMENT_' + Date.now()
        })
      });
      
      const data = await response.json();
      setResult({
        success: response.ok,
        message: response.ok ? '✅ Payment test completed! Check admin email.' : '❌ Test failed',
        data: data
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Admin Notification Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Admin Notifications</h2>
          <p className="text-gray-600 mb-6">
            This page tests the admin notification system. Admin emails will be sent to <strong>livesalez1@gmail.com</strong>
          </p>
          
          <div className="space-y-4">
            <button
              onClick={testSubscriptionNotification}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : '🧪 Test Seller Subscription Notification'}
            </button>
            
            <button
              onClick={testPaymentNotification}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : '💰 Test Buyer Payment Notification'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`bg-white rounded-lg shadow p-6 ${
            result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <h3 className="text-lg font-semibold mb-2">Test Result</h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>
            {result.data && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">View Response Data</summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📧 Email Notifications</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Seller Subscription:</strong> Admin gets notified when any seller subscribes to a plan</p>
            <p><strong>Buyer Payment:</strong> Admin gets notified when any buyer completes a payment</p>
            <p><strong>Admin Email:</strong> livesalez1@gmail.com</p>
            <p><strong>Check:</strong> Look in your email inbox and spam folder</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
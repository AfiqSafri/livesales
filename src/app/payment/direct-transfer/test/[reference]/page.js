"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DirectTransferTestPayment() {
  const params = useParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.reference) {
      fetchPaymentDetails(params.reference);
    }
  }, [params.reference]);

  const fetchPaymentDetails = async (reference) => {
    try {
      const res = await fetch('/api/payment/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPaymentDetails(data.payment);
      } else {
        alert('Payment not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Error loading payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDirectTransfer = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status to completed
      const res = await fetch('/api/payment/test-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: params.reference }),
      });
      
      if (res.ok) {
        // Redirect to success page
        router.push(`/payment/success?reference=${params.reference}`);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h2>
          <p className="text-gray-600">The payment you're looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Direct Bank Transfer</h1>
              <p className="text-gray-600">Complete your purchase with direct bank transfer to seller</p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">RM {paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{paymentDetails.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-600 capitalize">{paymentDetails.status}</span>
                </div>
              </div>
            </div>

            {/* Direct Transfer Info */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-green-900">Direct Bank Transfer</h4>
                  <p className="text-sm text-green-700 mt-1">
                    This payment will be transferred directly to the seller's bank account. 
                    The seller will receive the payment immediately after completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Payment Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900">Test Payment System</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a simulated direct bank transfer for testing purposes. 
                    In production, this would create a real Billplz payment link for direct transfer to seller's bank account.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="space-y-3">
              <button
                onClick={handleTestDirectTransfer}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Direct Transfer...
                  </div>
                ) : (
                  'Complete Direct Bank Transfer'
                )}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel Payment
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                This is a secure direct bank transfer system. In production, payments will be processed through Billplz.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
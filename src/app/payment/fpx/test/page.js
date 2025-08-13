'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FPXPaymentTestContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const bankCode = searchParams.get('bank');
  
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // FPX Bank mapping
  const fpxBanks = {
    'ABB0233': { name: 'Affin Bank', logo: '🏦' },
    'ABMB0212': { name: 'Alliance Bank', logo: '🏦' },
    'AMBB0209': { name: 'AmBank', logo: '🏦' },
    'BCBB0235': { name: 'CIMB Bank', logo: '🏦' },
    'BIMB0340': { name: 'Bank Islam', logo: '🏦' },
    'BKRM0602': { name: 'Bank Rakyat', logo: '🏦' },
    'BSNR0602': { name: 'BSN', logo: '🏦' },
    'CIT0219': { name: 'Citibank', logo: '🏦' },
    'HLB0224': { name: 'Hong Leong Bank', logo: '🏦' },
    'HSBC0223': { name: 'HSBC Bank', logo: '🏦' },
    'KFH0346': { name: 'Kuwait Finance House', logo: '🏦' },
    'MBB0228': { name: 'Maybank', logo: '🏦' },
    'MB2U0227': { name: 'Maybank2u', logo: '🏦' },
    'OCBC0229': { name: 'OCBC Bank', logo: '🏦' },
    'PBB0233': { name: 'Public Bank', logo: '🏦' },
    'RHB0218': { name: 'RHB Bank', logo: '🏦' },
    'SCB0216': { name: 'Standard Chartered', logo: '🏦' },
    'UOB0226': { name: 'UOB Bank', logo: '🏦' }
  };

  const selectedBank = fpxBanks[bankCode] || { name: 'Unknown Bank', logo: '🏦' };

  useEffect(() => {
    // Simulate loading payment details
    setTimeout(() => {
      setPaymentDetails({
        reference: reference || 'FPX_TEST_REF',
        amount: 28.00,
        currency: 'MYR',
        description: 'Test FPX Payment',
        merchant: 'Livesalez Test Store',
        timestamp: new Date().toISOString()
      });
    }, 1000);
  }, [reference]);

  const simulatePayment = async (status) => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus(status);
      setLoading(false);
      
      if (status === 'success') {
        // Simulate redirect after successful payment
        setTimeout(() => {
          window.location.href = '/payment/success?reference=' + reference;
        }, 2000);
      }
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏦 FPX Payment Test
            </h1>
            <p className="text-gray-600">
              Simulating FPX payment process for testing purposes
            </p>
          </div>

          {paymentDetails && (
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  Payment Details
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Reference:</span>
                    <p className="text-gray-900">{paymentDetails.reference}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900">RM {paymentDetails.amount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Currency:</span>
                    <p className="text-gray-900">{paymentDetails.currency}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Merchant:</span>
                    <p className="text-gray-900">{paymentDetails.merchant}</p>
                  </div>
                </div>
              </div>

              {/* Bank Selection */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Bank
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedBank.logo}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedBank.name}</h3>
                    <p className="text-sm text-gray-500">Bank Code: {bankCode}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className={`border rounded-lg p-4 ${getStatusColor(paymentStatus)}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(paymentStatus)}</span>
                  <div>
                    <h3 className="font-semibold">Payment Status: {paymentStatus.toUpperCase()}</h3>
                    <p className="text-sm">
                      {paymentStatus === 'pending' && 'Waiting for payment confirmation...'}
                      {paymentStatus === 'success' && 'Payment completed successfully!'}
                      {paymentStatus === 'failed' && 'Payment failed. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Controls */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-900 mb-4">
                  🧪 Test Controls
                </h2>
                <p className="text-yellow-700 mb-4">
                  Use these buttons to simulate different payment scenarios for testing.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => simulatePayment('success')}
                    disabled={loading || paymentStatus === 'success'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      loading || paymentStatus === 'success'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Processing...' : '✅ Simulate Success'}
                  </button>
                  <button
                    onClick={() => simulatePayment('failed')}
                    disabled={loading || paymentStatus === 'failed'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      loading || paymentStatus === 'failed'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {loading ? 'Processing...' : '❌ Simulate Failure'}
                  </button>
                </div>
              </div>

              {/* FPX Process Simulation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  FPX Payment Process
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span>Payment initiated</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span>Bank selected: {selectedBank.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span>Amount validated: RM {paymentDetails.amount}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={paymentStatus === 'pending' ? 'text-yellow-500' : 'text-green-500'}>
                      {paymentStatus === 'pending' ? '⏳' : '✅'}
                    </span>
                    <span>Payment processing...</span>
                  </div>
                  {paymentStatus !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <span className={paymentStatus === 'success' ? 'text-green-500' : 'text-red-500'}>
                        {paymentStatus === 'success' ? '✅' : '❌'}
                      </span>
                      <span>
                        {paymentStatus === 'success' 
                          ? 'Payment completed successfully' 
                          : 'Payment failed'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  ℹ️ About FPX Testing
                </h2>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• This is a simulation of the FPX payment process</li>
                  <li>• No real payments are processed in test mode</li>
                  <li>• Use the test controls to simulate different scenarios</li>
                  <li>• In production, this would redirect to the actual bank's payment page</li>
                </ul>
              </div>
            </div>
          )}

          {!paymentDetails && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FPXPaymentTest() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FPXPaymentTestContent />
    </Suspense>
  );
} 
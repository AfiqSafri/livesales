"use client";
import { useState } from 'react';
import BankSelectionModal from '@/components/BankSelectionModal';

export default function PaymentTestPage() {
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [testResults, setTestResults] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { timestamp, message, type }]);
  };

  const handleBankSelect = (bankId) => {
    addLog(`🏦 Bank selected: ${bankId}`, 'success');
    setSelectedBank(bankId);
    setShowBankSelection(false);
    
    // Simulate payment API call
    addLog('🚀 Calling payment API...', 'info');
    
    // Test the payment API
    testPaymentAPI(bankId);
  };

  const testPaymentAPI = async (bankId) => {
    try {
      addLog('📡 Making API request to /api/payment/buy-product', 'info');
      
      const testData = {
        productId: 11,
        quantity: 1,
        sellerId: 1,
        productName: 'Test Product',
        unitPrice: 1.99,
        totalAmount: 1.99,
        buyerEmail: 'test@example.com',
        buyerName: 'Test User',
        shippingAddress: '123 Test Street',
        phone: '0123456789',
        selectedBank: bankId
      };

      addLog(`📋 Test data: ${JSON.stringify(testData, null, 2)}`, 'info');

      const response = await fetch('/api/payment/buy-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      addLog(`📡 Response status: ${response.status}`, 'info');
      
      const data = await response.json();
      addLog(`📡 Response data: ${JSON.stringify(data, null, 2)}`, 'info');

      if (response.ok) {
        addLog('✅ Payment API call successful!', 'success');
        if (data.billUrl) {
          addLog(`🔗 Billplz URL: ${data.billUrl}`, 'success');
          addLog('🎯 Payment flow completed successfully!', 'success');
        } else {
          addLog('⚠️ No billUrl received', 'warning');
        }
      } else {
        addLog(`❌ Payment API failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ API call error: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Flow Test</h1>
          
          <div className="mb-6">
            <button
              onClick={() => setShowBankSelection(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏦 Test Bank Selection
            </button>
            
            <button
              onClick={clearLogs}
              className="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ Clear Logs
            </button>
          </div>

          {selectedBank && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">Selected Bank</h3>
              <p className="text-green-700">{selectedBank}</p>
            </div>
          )}

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <div className="mb-2 text-white">📋 Test Results:</div>
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet. Click "Test Bank Selection" to start.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`mb-1 ${
                  result.type === 'success' ? 'text-green-400' :
                  result.type === 'error' ? 'text-red-400' :
                  result.type === 'warning' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  [{result.timestamp}] {result.message}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
            <ol className="text-blue-700 text-sm space-y-1">
              <li>1. Click "Test Bank Selection" button</li>
              <li>2. Select a bank from the modal</li>
              <li>3. Watch the logs for payment flow</li>
              <li>4. Check browser console for additional logs</li>
              <li>5. Verify API response and Billplz integration</li>
            </ol>
          </div>
        </div>
      </div>

      <BankSelectionModal
        isOpen={showBankSelection}
        onClose={() => setShowBankSelection(false)}
        onBankSelect={handleBankSelect}
        orderDetails={{
          productName: 'Test Product',
          quantity: 1,
          totalAmount: 1.99
        }}
        loading={false}
      />
    </div>
  );
} 
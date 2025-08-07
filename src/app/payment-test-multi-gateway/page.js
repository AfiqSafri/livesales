'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MultiGatewayPaymentTest() {
  const router = useRouter();
  const [gateways, setGateways] = useState([]);
  const [fpxBanks, setFpxBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [selectedFpxBank, setSelectedFpxBank] = useState('');
  const [showFpxBanks, setShowFpxBanks] = useState(false);
  const [paymentData, setPaymentData] = useState({
    productId: 1,
    quantity: 1,
    buyerId: 1,
    buyerName: 'Test Buyer',
    buyerEmail: 'test@example.com',
    shippingAddress: '123 Test Street, Kuala Lumpur, Malaysia',
    phone: '+60123456789',
    totalAmount: 28.00
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/payment/test-multi-gateway');
      const data = await response.json();
      
      if (data.success) {
        setGateways(data.gateways);
        setFpxBanks(data.fpxBanks);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
    }
  };

  const handleGatewaySelect = (gatewayId) => {
    setSelectedGateway(gatewayId);
    setShowFpxBanks(gatewayId === 'fpx');
    if (gatewayId !== 'fpx') {
      setSelectedFpxBank('');
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...paymentData,
        paymentGateway: selectedGateway,
        ...(selectedGateway === 'fpx' && { fpxBankCode: selectedFpxBank })
      };

      console.log('🧪 Creating test payment with data:', requestData);

      const response = await fetch('/api/payment/test-multi-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Test payment created successfully:', result);
        
        // Redirect to payment URL or show success message
        if (result.paymentUrl) {
          window.open(result.paymentUrl, '_blank');
        }
        
        alert(`Test payment created successfully!\nGateway: ${result.gateway}\nReference: ${result.reference}\nAmount: RM ${result.amount}`);
      } else {
        console.error('❌ Failed to create test payment:', result.error);
        alert(`Failed to create test payment: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating test payment:', error);
      alert('Error creating test payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🧪 Multi-Gateway Payment Test
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Available Payment Gateways
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => handleGatewaySelect(gateway.id)}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedGateway === gateway.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{gateway.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                      <p className="text-sm text-gray-500">Click to select</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedGateway && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Selected Gateway: {gateways.find(g => g.id === selectedGateway)?.name}
                </h3>
                <p className="text-blue-700">
                  This is a test payment. No real charges will be made.
                </p>
              </div>

              {showFpxBanks && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    🏦 Select FPX Bank
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fpxBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedFpxBank(bank.code)}
                        className={`p-3 border rounded-lg transition-all duration-200 ${
                          selectedFpxBank === bank.code
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{bank.logo}</span>
                          <span className="font-medium text-gray-900">{bank.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📦 Product Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID
                    </label>
                    <input
                      type="number"
                      value={paymentData.productId}
                      onChange={(e) => handleInputChange('productId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={paymentData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount (RM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    👤 Buyer Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer ID
                    </label>
                    <input
                      type="number"
                      value={paymentData.buyerId}
                      onChange={(e) => handleInputChange('buyerId', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.buyerName}
                      onChange={(e) => handleInputChange('buyerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={paymentData.buyerEmail}
                      onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address
                </label>
                <textarea
                  value={paymentData.shippingAddress}
                  onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !selectedGateway || (selectedGateway === 'fpx' && !selectedFpxBank)}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading || !selectedGateway || (selectedGateway === 'fpx' && !selectedFpxBank)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Payment...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>🧪</span>
                      <span>Create Test Payment</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {!selectedGateway && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                Please select a payment gateway above to start testing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';

export default function PaymentTestDemo() {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [demoData, setDemoData] = useState({
    buyerName: 'John Doe',
    buyerEmail: 'john@example.com',
    phone: '0123456789',
    shippingAddress: '123 Test Street, Kuala Lumpur, Malaysia',
    quantity: 1
  });

  const handleInputChange = (field, value) => {
    setDemoData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentTest = async (paymentType) => {
    setSelectedMethod(paymentType);
    
    // Simulate payment processing
    console.log(`Testing ${paymentType} payment with data:`, demoData);
    
    // In a real scenario, this would call the actual payment API
    alert(`This would initiate a ${paymentType} payment with the provided data. Check the console for details.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Payment Methods Demo</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Payment Methods</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Test Payment */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">Test Payment</h3>
              <p className="text-sm text-blue-700 mb-3">Simulated payment for testing purposes</p>
              <button
                onClick={() => handlePaymentTest('test')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Test Payment
              </button>
            </div>

            {/* Billplz Test Payment */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold text-purple-900 mb-2">Billplz Test Payment</h3>
              <p className="text-sm text-purple-700 mb-3">Real Billplz sandbox payment</p>
              <button
                onClick={() => handlePaymentTest('billplz_test')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Billplz Test
              </button>
            </div>

            {/* Direct Transfer */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-900 mb-2">Direct Bank Transfer</h3>
              <p className="text-sm text-green-700 mb-3">Pay directly to seller's bank account</p>
              <button
                onClick={() => handlePaymentTest('direct')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Direct Transfer
              </button>
            </div>
          </div>

          {selectedMethod && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Selected Method: {selectedMethod}</h4>
              <p className="text-sm text-yellow-700">
                This would redirect to the appropriate payment page with the demo data below.
              </p>
            </div>
          )}
        </div>

        {/* Demo Data Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
              <input
                type="text"
                value={demoData.buyerName}
                onChange={(e) => handleInputChange('buyerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Email</label>
              <input
                type="email"
                value={demoData.buyerEmail}
                onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={demoData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={demoData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
              <textarea
                value={demoData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Payment Flow Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Flow Information</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-900">Test Payment Flow</h3>
              <p className="text-sm text-gray-600">
                1. Creates payment record in database<br/>
                2. Redirects to test payment page<br/>
                3. Simulates payment completion<br/>
                4. Sends email notifications to buyer, seller, and admin
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-purple-900">Billplz Test Payment Flow</h3>
              <p className="text-sm text-gray-600">
                1. Creates Billplz sandbox bill<br/>
                2. Creates payment record in database<br/>
                3. Redirects to Billplz payment page<br/>
                4. Sends email notifications to buyer, seller, and admin
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-900">Direct Transfer Flow</h3>
              <p className="text-sm text-gray-600">
                1. Creates Billplz direct transfer bill<br/>
                2. Creates payment record in database<br/>
                3. Redirects to Billplz direct transfer page<br/>
                4. Sends email notifications to buyer, seller, and admin
              </p>
            </div>
          </div>
        </div>

        {/* Links to Test Pages */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin-test"
              className="block p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-900">Admin Test Page</h3>
              <p className="text-sm text-blue-700">Test admin email notifications</p>
            </a>
            
            <a
              href="/seller/subscription"
              className="block p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-900">Seller Subscription</h3>
              <p className="text-sm text-green-700">Test seller subscription payments</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
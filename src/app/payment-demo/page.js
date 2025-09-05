"use client";
import { useState } from 'react';
import PaymentModal from '@/components/PaymentModal';
import BankSelectionModal from '@/components/BankSelectionModal';
import PaymentFlowGuide from '@/components/PaymentFlowGuide';

export default function PaymentDemoPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [showPaymentGuide, setShowPaymentGuide] = useState(false);

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+60123456789'
  };

  const mockOrderDetails = {
    productName: 'Premium Product',
    quantity: 2,
    totalAmount: 99.99
  };

  const handleBankSelect = (bankId) => {
    console.log('Selected bank:', bankId);
    setShowBankSelection(false);
    // Here you would typically proceed with payment creation
    alert(`Proceeding with ${bankId} payment...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Payment System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our modern, secure payment interface with bank selection, 
            payment flow guidance, and professional styling
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Payment Modal Demo */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Subscription Payment</h3>
              <p className="text-gray-600 text-sm">
                Modern payment modal with bank selection
              </p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Try Payment Modal
            </button>
          </div>

          {/* Bank Selection Demo */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Bank Selection</h3>
              <p className="text-gray-600 text-sm">
                Choose from Malaysian banks with search
              </p>
            </div>
            <button
              onClick={() => setShowBankSelection(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Select Bank
            </button>
          </div>

          {/* Payment Guide Demo */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Payment Guide</h3>
              <p className="text-gray-600 text-sm">
                Step-by-step payment process explanation
              </p>
            </div>
            <button
              onClick={() => setShowPaymentGuide(true)}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              View Guide
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Enhanced User Experience
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Modern, responsive design</li>
                <li>• Interactive bank selection</li>
                <li>• Smooth animations and transitions</li>
                <li>• Mobile-first approach</li>
                <li>• Professional color schemes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">🔒</span>
                Security & Trust
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Bank-level security</li>
                <li>• SSL encryption</li>
                <li>• SMS/Email verification</li>
                <li>• Fraud protection</li>
                <li>• Secure webhooks</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-500">🏦</span>
                Bank Integration
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 8+ Malaysian banks supported</li>
                <li>• Popular banks highlighted</li>
                <li>• Bank search functionality</li>
                <li>• Bank descriptions and logos</li>
                <li>• Seamless redirect flow</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-500">📱</span>
                User Guidance
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Step-by-step payment guide</li>
                <li>• Interactive tutorials</li>
                <li>• Security information</li>
                <li>• Process explanations</li>
                <li>• Visual step indicators</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Technical Implementation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Components</h3>
              <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <code className="text-blue-600">PaymentModal.js</code>
                  <span className="text-gray-500">- Enhanced subscription payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <code className="text-green-600">BankSelectionModal.js</code>
                  <span className="text-gray-500">- Bank selection interface</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <code className="text-purple-600">PaymentFlowGuide.js</code>
                  <span className="text-gray-500">- Payment process guide</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend APIs</h3>
              <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <code className="text-blue-600">/api/payment/billplz/create</code>
                  <span className="text-gray-500">- Create payment bills</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <code className="text-green-600">/api/payment/billplz/callback</code>
                  <span className="text-gray-500">- Handle webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <code className="text-purple-600">/api/payment/billplz</code>
                  <span className="text-gray-500">- Subscription payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan="pro"
        user={mockUser}
        onSuccess={() => console.log('Payment successful')}
      />

      <BankSelectionModal
        isOpen={showBankSelection}
        onClose={() => setShowBankSelection(false)}
        onBankSelect={handleBankSelect}
        orderDetails={mockOrderDetails}
      />

      <PaymentFlowGuide
        isOpen={showPaymentGuide}
        onClose={() => setShowPaymentGuide(false)}
      />
    </div>
  );
}





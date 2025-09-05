"use client";
import { useState } from 'react';

// Malaysian Banks with logos and colors
const MALAYSIAN_BANKS = [
  { 
    id: 'maybank', 
    name: 'Maybank', 
    logo: '🏦', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    description: 'Malaysia\'s largest bank'
  },
  { 
    id: 'cimb', 
    name: 'CIMB Bank', 
    logo: '🏛️', 
    color: 'bg-blue-600',
    textColor: 'text-white',
    description: 'Leading ASEAN universal bank'
  },
  { 
    id: 'public', 
    name: 'Public Bank', 
    logo: '🏢', 
    color: 'bg-green-600',
    textColor: 'text-white',
    description: 'Most efficient bank in Asia'
  },
  { 
    id: 'hongleong', 
    name: 'Hong Leong Bank', 
    logo: '🏦', 
    color: 'bg-red-600',
    textColor: 'text-white',
    description: 'Premier financial services'
  },
  { 
    id: 'rhb', 
    name: 'RHB Bank', 
    logo: '🏛️', 
    color: 'bg-purple-600',
    textColor: 'text-white',
    description: 'Your preferred banking partner'
  },
  { 
    id: 'ambank', 
    name: 'AmBank', 
    logo: '🏦', 
    color: 'bg-orange-500',
    textColor: 'text-white',
    description: 'Building relationships, delivering value'
  }
];

export default function PaymentModal({ isOpen, onClose, plan, user, discount, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankSelection, setShowBankSelection] = useState(false);

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
    if (!selectedBank) {
      setError('Please select a bank to continue');
      return;
    }

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
          discount: discount,
          selectedBank: selectedBank
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment');
        return;
      }

      // Redirect to Billplz payment page
      window.location.href = data.billUrl;

    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelection = (bankId) => {
    setSelectedBank(bankId);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upgrade to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </h2>
            <p className="text-gray-600 mt-1">Secure payment powered by Billplz</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Plan Details */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-blue-900">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h3>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">RM {planPrices[plan]}</span>
                <p className="text-sm text-blue-700">per month</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {planFeatures[plan].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Select Your Bank</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MALAYSIAN_BANKS.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleBankSelection(bank.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedBank === bank.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${bank.color} ${bank.textColor} w-12 h-12 rounded-full flex items-center justify-center mx-auto`}>
                    {bank.logo}
                  </div>
                  <h5 className="font-semibold text-gray-900 text-sm">{bank.name}</h5>
                  <p className="text-xs text-gray-500 mt-1">{bank.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-semibold text-green-800">Secure Payment</h5>
              <p className="text-sm text-green-700">
                Your payment will be processed securely through your selected bank's online banking system. 
                You'll need to approve the payment through your bank's security verification (SMS/Email).
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !selectedBank}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading || !selectedBank
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </div>
            ) : (
              `Pay RM ${planPrices[plan]}`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payment powered by Billplz
          </div>
        </div>
      </div>
    </div>
  );
}
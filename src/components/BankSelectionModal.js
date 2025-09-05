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
    description: 'Malaysia\'s largest bank',
    popular: true
  },
  { 
    id: 'cimb', 
    name: 'CIMB Bank', 
    logo: '🏛️', 
    color: 'bg-blue-600',
    textColor: 'text-white',
    description: 'Leading ASEAN universal bank',
    popular: true
  },
  { 
    id: 'public', 
    name: 'Public Bank', 
    logo: '🏢', 
    color: 'bg-green-600',
    textColor: 'text-white',
    description: 'Most efficient bank in Asia',
    popular: true
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
  },
  { 
    id: 'alliance', 
    name: 'Alliance Bank', 
    logo: '🏛️', 
    color: 'bg-teal-600',
    textColor: 'text-white',
    description: 'Building relationships, delivering value'
  },
  { 
    id: 'bsn', 
    name: 'BSN', 
    logo: '🏦', 
    color: 'bg-indigo-600',
    textColor: 'text-white',
    description: 'Bank Simpanan Nasional'
  }
];

export default function BankSelectionModal({ 
  isOpen, 
  onClose, 
  onBankSelect, 
  orderDetails,
  loading = false 
}) {
  const [selectedBank, setSelectedBank] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleBankSelection = (bankId) => {
    setSelectedBank(bankId);
  };

  const handleConfirm = () => {
    console.log('🔘 Confirm button clicked');
    console.log('📋 Selected bank:', selectedBank);
    console.log('📋 Order details:', orderDetails);
    console.log('📋 onBankSelect function:', onBankSelect);
    
    if (selectedBank) {
      console.log('✅ Bank selection confirmed:', selectedBank);
      if (typeof onBankSelect === 'function') {
        console.log('✅ Calling onBankSelect function...');
        onBankSelect(selectedBank);
      } else {
        console.error('❌ onBankSelect is not a function:', onBankSelect);
      }
    } else {
      console.log('❌ No bank selected');
    }
  };

  const filteredBanks = MALAYSIAN_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularBanks = MALAYSIAN_BANKS.filter(bank => bank.popular);
  const otherBanks = MALAYSIAN_BANKS.filter(bank => !bank.popular);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Select Your Bank</h2>
              <p className="text-blue-100 mt-1">
                Choose your bank to complete the secure payment
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-blue-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-600">
                  {orderDetails.productName} x {orderDetails.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-600">
                  RM {orderDetails.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for your bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Popular Banks */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              Popular Banks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelection(bank.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedBank === bank.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-3 ${bank.color} ${bank.textColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md`}>
                      {bank.logo}
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{bank.name}</h5>
                    <p className="text-xs text-gray-500">{bank.description}</p>
                    {selectedBank === bank.id && (
                      <div className="mt-2">
                        <svg className="w-5 h-5 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Other Banks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Banks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelection(bank.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedBank === bank.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-3 ${bank.color} ${bank.textColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md`}>
                      {bank.logo}
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{bank.name}</h5>
                    <p className="text-xs text-gray-500">{bank.description}</p>
                    {selectedBank === bank.id && (
                      <div className="mt-2">
                        <svg className="w-5 h-5 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border-t border-green-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-semibold text-green-800">Secure Payment Process</h5>
              <p className="text-sm text-green-700">
                After selecting your bank, you'll be redirected to your bank's secure online banking page. 
                You'll need to log in and approve the payment through your bank's security verification (SMS/Email).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
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
                `Continue with ${selectedBank ? MALAYSIAN_BANKS.find(b => b.id === selectedBank)?.name : 'Bank'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

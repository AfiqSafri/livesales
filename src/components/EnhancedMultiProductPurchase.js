"use client";
import { useState } from 'react';
import BankSelectionModal from './BankSelectionModal';
import PaymentFlowGuide from './PaymentFlowGuide';

export default function EnhancedMultiProductPurchase({ 
  products, 
  onPurchase, 
  loading = false 
}) {
  const [quantities, setQuantities] = useState({});
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: ''
  });
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [showPaymentGuide, setShowPaymentGuide] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0 && newQuantity <= products.find(p => p.id === productId)?.quantity) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const handleInputChange = (field, value) => {
    setBuyerInfo(prev => ({ ...prev, [field]: value }));
  };

  const calculateProductTotal = (product) => {
    const quantity = quantities[product.id] || 0;
    const basePrice = product.discountPrice || product.price;
    return basePrice * quantity;
  };

  const calculateGrandTotal = () => {
    return products.reduce((total, product) => {
      return total + calculateProductTotal(product);
    }, 0);
  };

  const getSelectedProducts = () => {
    return products.filter(product => (quantities[product.id] || 0) > 0);
  };

  const handleProceedToPayment = () => {
    // Validate form
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.shippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedProducts = getSelectedProducts();
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    // Show bank selection
    setShowBankSelection(true);
  };

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setShowBankSelection(false);
    
    // Call the purchase function with all details
    const selectedProducts = getSelectedProducts();
    onPurchase({
      ...buyerInfo,
      products: selectedProducts.map(product => ({
        id: product.id,
        quantity: quantities[product.id] || 0,
        price: product.discountPrice || product.price
      })),
      selectedBank,
      totalAmount: calculateGrandTotal()
    });
  };

  const handleShowPaymentGuide = () => {
    setShowPaymentGuide(true);
  };

  const isFormValid = buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.shippingAddress && getSelectedProducts().length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Products</h3>
        <p className="text-gray-600">Complete your multi-product purchase with secure bank payment</p>
      </div>

      {/* Product Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Products & Quantities</h4>
        <div className="space-y-4">
          {products.map((product) => {
            const quantity = quantities[product.id] || 0;
            const productTotal = calculateProductTotal(product);
            
            return (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{product.name}</h5>
                    <p className="text-sm text-gray-600">#{product.code || product.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      RM {productTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      RM {(product.discountPrice || product.price).toFixed(2)} each
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(product.id, quantity - 1)}
                      disabled={quantity <= 0}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, quantity + 1)}
                      disabled={quantity >= product.quantity}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.quantity} available
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          {getSelectedProducts().map((product) => {
            const quantity = quantities[product.id] || 0;
            const productTotal = calculateProductTotal(product);
            
            return (
              <div key={product.id} className="flex justify-between">
                <span className="text-gray-600">{product.name} (x{quantity})</span>
                <span className="font-medium">RM {productTotal.toFixed(2)}</span>
              </div>
            );
          })}
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">RM {calculateGrandTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Information Form */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={buyerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={buyerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={buyerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={buyerInfo.shippingAddress}
            onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your complete shipping address"
            rows={3}
            required
          />
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h5 className="font-semibold text-blue-800">Secure Bank Payment</h5>
            <p className="text-sm text-blue-700 mb-2">
              After placing your order, you'll select your bank and be redirected to complete the payment securely.
            </p>
            <button
              onClick={handleShowPaymentGuide}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              How does payment work?
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleProceedToPayment}
          disabled={!isFormValid || loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            !isFormValid || loading
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
            <>
              <span>🛒</span>
              <span>
                Purchase {getSelectedProducts().length} Product{getSelectedProducts().length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our terms and conditions
        </p>
      </div>

      {/* Bank Selection Modal */}
      <BankSelectionModal
        isOpen={showBankSelection}
        onClose={() => setShowBankSelection(false)}
        onBankSelect={handleBankSelect}
        orderDetails={{
          productName: `${getSelectedProducts().length} Product${getSelectedProducts().length !== 1 ? 's' : ''}`,
          quantity: getSelectedProducts().reduce((total, p) => total + (quantities[p.id] || 0), 0),
          totalAmount: calculateGrandTotal()
        }}
        loading={loading}
      />

      {/* Payment Flow Guide */}
      <PaymentFlowGuide
        isOpen={showPaymentGuide}
        onClose={() => setShowPaymentGuide(false)}
      />
    </div>
  );
}





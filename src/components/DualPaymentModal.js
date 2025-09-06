"use client";
import { useState, useEffect } from 'react';

export default function DualPaymentModal({ isOpen, onClose, order, seller, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setMessage('');
      setShowQRCode(false);
    }
  }, [isOpen]);

  const handleChipPayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/payment/chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.totalAmount,
          buyerId: order.buyerId,
          buyerName: order.buyerName,
          buyerEmail: order.buyerEmail,
          productId: order.productId,
          quantity: order.quantity,
          shippingAddress: order.shippingAddress,
          phone: order.phone
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Chip payment page
        window.location.href = data.paymentUrl;
      } else {
        setMessage(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Chip payment error:', error);
      setMessage('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleQRPayment = () => {
    setShowQRCode(true);
    setSelectedMethod('qr');
  };

  const handleReceiptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('orderId', order.id);
      formData.append('sellerId', seller.id);
      formData.append('buyerId', order.buyerId);
      formData.append('amount', order.totalAmount);

      const response = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Receipt uploaded successfully! The seller will review it shortly.');
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        setMessage(data.error || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Receipt upload error:', error);
      setMessage('Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Product: {order.product?.name}</div>
              <div>Quantity: {order.quantity}</div>
              <div>Total: RM {order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {!showQRCode ? (
            /* Payment Method Selection */
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Choose Payment Method</h3>
              
              {/* Chip Payment Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === 'chip' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('chip')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMethod === 'chip' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'chip' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Chip Payment Gateway</div>
                    <div className="text-sm text-gray-600">Pay securely with credit card or online banking</div>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* QR Code Payment Option */}
              {seller?.qrCodeImage && (
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod === 'qr' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod('qr')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === 'qr' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'qr' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">QR Code Payment</div>
                      <div className="text-sm text-gray-600">Scan QR code and upload receipt</div>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* QR Code Payment Interface */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">QR Code Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan the QR code below to make payment, then upload your receipt
                </p>
                
                {seller?.qrCodeImage && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                    <img
                      src={seller.qrCodeImage}
                      alt="Payment QR Code"
                      className="mx-auto max-w-xs max-h-64 object-contain"
                      onError={(e) => {
                        console.error('QR code image failed to load:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                    {seller.qrCodeDescription && (
                      <p className="text-sm text-gray-600 mt-2">
                        {seller.qrCodeDescription}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Amount to pay:</strong> RM {order.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Receipt
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a screenshot or photo of your payment receipt
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            {!showQRCode ? (
              <>
                <button
                  onClick={handleChipPayment}
                  disabled={selectedMethod !== 'chip' || loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Pay with Chip'}
                </button>
                {seller?.qrCodeImage && (
                  <button
                    onClick={handleQRPayment}
                    disabled={selectedMethod !== 'qr' || loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay with QR Code
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Payment Options
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

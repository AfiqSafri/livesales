"use client";
import { useState, useEffect } from 'react';
import PaymentFlowGuide from './PaymentFlowGuide';

export default function EnhancedProductPurchase({ 
  product, 
  onPurchase, 
  loading = false,
  showPaymentGuide = false 
}) {
  console.log('🔧 EnhancedProductPurchase component rendered');
  console.log('🔧 onPurchase prop received:', typeof onPurchase);
  console.log('🔧 onPurchase function:', onPurchase);
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: ''
  });
  const [showPaymentGuideModal, setShowPaymentGuideModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState('form'); // 'form', 'processing'
  
  // QR Payment state
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [sellerQRCode, setSellerQRCode] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // Payment session state
  const [paymentSession, setPaymentSession] = useState(null);
  const [showPaymentRecovery, setShowPaymentRecovery] = useState(false);

  // Check for existing payment session on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('qrPaymentSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Check if session is not expired (24 hours) and is for single product
        const now = Date.now();
        if (session.timestamp && (now - session.timestamp) < 24 * 60 * 60 * 1000 && session.pageType === 'single-product') {
          setPaymentSession(session);
          setShowPaymentRecovery(true);
        } else {
          // Clear expired or wrong page type session
          localStorage.removeItem('qrPaymentSession');
        }
      } catch (error) {
        console.error('Error parsing saved payment session:', error);
        localStorage.removeItem('qrPaymentSession');
      }
    }
  }, []);

  const calculateTotal = () => {
    const basePrice = product.discountPrice || product.price;
    const shippingCost = product.shippingPrice || 0;
    return (basePrice * quantity) + shippingCost;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleInputChange = (field, value) => {
    setBuyerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = () => {
    // Validate form
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.shippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    if (quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    // Proceed directly to payment (same as multi-products page)
    setPurchaseStep('processing');
    
    console.log('🚀 Proceeding with purchase...');
    const purchaseData = {
      ...buyerInfo,
      quantity,
      selectedBank: 'auto', // Let CHIP Collect choose the bank (same as multi-products)
      totalAmount: calculateTotal()
    };
    console.log('📋 Purchase data:', purchaseData);
    
    // Call the purchase function with all details
    if (typeof onPurchase === 'function') {
      console.log('✅ Calling onPurchase function...');
      onPurchase(purchaseData);
    } else {
      console.error('❌ onPurchase is not a function:', onPurchase);
    }
  };



  const handleShowPaymentGuide = () => {
    setShowPaymentGuideModal(true);
  };

  // Payment session recovery functions
  const recoverPaymentSession = () => {
    if (paymentSession) {
      setSellerQRCode(paymentSession.sellerData);
      setBuyerInfo(paymentSession.buyerInfo);
      setQuantity(paymentSession.quantity || 1);
      setShowQRPayment(true);
      setShowPaymentRecovery(false);
    }
  };

  const clearPaymentSession = () => {
    localStorage.removeItem('qrPaymentSession');
    setPaymentSession(null);
    setShowPaymentRecovery(false);
  };

  const handleQRPayment = async () => {
    // Validate form first
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.shippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    if (quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    try {
      // Fetch seller QR code
      const sellerResponse = await fetch(`/api/seller/public-profile?id=${product.seller.id}`);
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        if (sellerData.seller?.qrCodeImage) {
          // Create payment session
          const session = {
            timestamp: Date.now(),
            sellerData: sellerData.seller,
            buyerInfo: buyerInfo,
            quantity: quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.discountPrice || product.price,
              shippingPrice: product.shippingPrice || 0
            },
            totalAmount: calculateTotal(),
            pageType: 'single-product',
            pageUrl: window.location.href
          };
          
          // Save to localStorage
          localStorage.setItem('qrPaymentSession', JSON.stringify(session));
          setPaymentSession(session);
          
          setSellerQRCode(sellerData.seller);
          setShowQRPayment(true);
        } else {
          alert('Seller has not uploaded a QR code yet. Please use the regular payment method.');
        }
      } else {
        alert('Failed to load seller QR code. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching seller QR code:', error);
      alert('Failed to load seller QR code. Please try again.');
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      alert('Please select a receipt file');
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('orderId', `temp-${Date.now()}`);
      formData.append('sellerId', product.seller.id);
      formData.append('buyerId', 4); // Use Mike Chen (valid buyer ID)
      formData.append('amount', calculateTotal());
      
      // Add actual buyer and product data for QR payments
      formData.append('buyerName', buyerInfo.name);
      formData.append('buyerEmail', buyerInfo.email);
      formData.append('buyerPhone', buyerInfo.phone);
      formData.append('productName', product.name);
      formData.append('productId', product.id);
      formData.append('quantity', quantity);
      formData.append('shippingAddress', buyerInfo.shippingAddress);

      const response = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Receipt uploaded successfully! The seller will review it shortly.');
        setShowQRPayment(false);
        setReceiptFile(null);
        
        // Clear payment session after successful upload
        clearPaymentSession();
        
        // Reset form
        setBuyerInfo({ name: '', email: '', phone: '', shippingAddress: '' });
        setQuantity(1);
      } else {
        alert(data.error || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Receipt upload error:', error);
      alert('Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const isFormValid = buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.shippingAddress && quantity > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase This Product</h3>
        <p className="text-gray-600">Complete your purchase with secure bank payment</p>
      </div>

      {/* Product Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Order Summary</h4>
          <span className="text-sm text-gray-500">#{product.code || product.id}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Product:</span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Unit Price:</span>
            <span className="font-medium">
              RM {product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}
            </span>
          </div>
          {product.discountPrice && (
            <div className="flex justify-between text-red-600">
              <span>Original Price:</span>
              <span className="line-through">RM {product.price.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">RM {(product.shippingPrice || 0).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">RM {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span className="text-lg font-semibold min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.quantity}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {product.quantity} items available
        </p>
      </div>

      {/* Buyer Information Form */}
      <div className="space-y-4 mb-6">
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

      {/* Action Button - Coming Soon */}
      <button
        onClick={() => alert('Coming Soon! Use QR Code Payment instead.')}
        disabled={true}
        className="w-full bg-gray-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
      >
        <span>🚧</span>
        <span>Coming Soon ({quantity} Product{quantity !== 1 ? 's' : ''})</span>
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Only products with quantity &gt; 0 will be ordered. Use QR Code Payment for checkout.
      </p>

      {/* QR Payment Button */}
      <button
        onClick={handleQRPayment}
        disabled={loading || quantity === 0}
        className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base mt-3"
      >
        <span>📱</span>
        <span>Purchase with QR Code</span>
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Scan seller's QR code and upload payment receipt for manual verification.
      </p>

      {/* QR Payment Modal */}
      {showQRPayment && sellerQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">QR Code Payment</h2>
                <button
                  onClick={() => setShowQRPayment(false)}
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
                  <div>Product: {product.name}</div>
                  <div>Quantity: {quantity}</div>
                  <div>Total: RM {calculateTotal().toFixed(2)}</div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="text-center mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Scan QR Code to Pay</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan the QR code below to make payment, then upload your receipt
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                  <img
                    src={sellerQRCode.qrCodeImage}
                    alt="Payment QR Code"
                    className="mx-auto max-w-xs max-h-64 object-contain"
                  />
                  {sellerQRCode.qrCodeDescription && (
                    <p className="text-sm text-gray-600 mt-2">
                      {sellerQRCode.qrCodeDescription}
                    </p>
                  )}
                  
                  {/* Download QR Code with Amount Button */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={async () => {
                        try {
                          // Create a canvas to combine QR code and amount
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          
                          // Set canvas size
                          canvas.width = 400;
                          canvas.height = 500;
                          
                          // Load QR code image
                          const qrImg = new Image();
                          qrImg.crossOrigin = 'anonymous';
                          
                          qrImg.onload = () => {
                            // Draw white background
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // Draw QR code (centered, smaller)
                            const qrSize = 300;
                            const qrX = (canvas.width - qrSize) / 2;
                            const qrY = 50;
                            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
                            
                            // Draw amount text
                            ctx.fillStyle = '#1f2937';
                            ctx.font = 'bold 24px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('Amount to Pay:', canvas.width / 2, qrY + qrSize + 40);
                            
                            ctx.fillStyle = '#dc2626';
                            ctx.font = 'bold 32px Arial';
                            ctx.fillText(`RM ${calculateTotal().toFixed(2)}`, canvas.width / 2, qrY + qrSize + 80);
                            
                            // Draw seller info
                            ctx.fillStyle = '#6b7280';
                            ctx.font = '16px Arial';
                            ctx.fillText(`Seller: ${sellerQRCode.name}`, canvas.width / 2, qrY + qrSize + 120);
                            
                            // Draw date
                            ctx.font = '14px Arial';
                            ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, qrY + qrSize + 150);
                            
                            // Mobile-friendly download approach
                            canvas.toBlob((blob) => {
                              if (blob) {
                                const url = URL.createObjectURL(blob);
                                
                                // Method 1: Try direct download first
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `qr-payment-${sellerQRCode.name || 'seller'}-${calculateTotal().toFixed(2)}.png`;
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                // Method 2: Open in new tab for mobile browsers (backup method)
                                setTimeout(() => {
                                  const newWindow = window.open();
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>QR Payment - Save Image</title>
                                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        </head>
                                        <body style="margin:0; padding:20px; text-align:center; background:#f0f0f0; font-family:Arial,sans-serif;">
                                          <h3 style="color:#333; margin-bottom:20px;">Save this QR payment image</h3>
                                          <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                            <img src="${url}" style="max-width:100%; height:auto; border:1px solid #ddd;" />
                                          </div>
                                          <div style="margin-top:20px; padding:15px; background:#e3f2fd; border-radius:8px;">
                                            <p style="margin:0; color:#1976d2; font-weight:bold;">📱 How to save:</p>
                                            <p style="margin:10px 0 0 0; color:#666; font-size:14px;">
                                              <strong>iPhone:</strong> Long press image → "Save to Photos"<br>
                                              <strong>Android:</strong> Long press image → "Save image" or "Download"
                                            </p>
                                          </div>
                                          <button onclick="window.close()" style="margin-top:20px; padding:12px 24px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer; font-size:16px;">
                                            Close
                                          </button>
                                        </body>
                                      </html>
                                    `);
                                  }
                                }, 200);
                                
                                // Clean up after 30 seconds
                                setTimeout(() => {
                                  URL.revokeObjectURL(url);
                                }, 30000);
                                
                                // Show success message
                                alert('QR payment image generated! If it didn\'t download automatically, check the new tab that opened for instructions on how to save it to your phone.');
                              } else {
                                alert('Failed to generate image. Please try again.');
                              }
                            }, 'image/png', 0.9);
                          };
                          
                          qrImg.onerror = () => {
                            alert('Failed to load QR code image. Please try again.');
                          };
                          
                          qrImg.src = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}${sellerQRCode.qrCodeImage}`;
                        } catch (error) {
                          console.error('Error creating combined image:', error);
                          alert('Failed to create download image. Please try again.');
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📥 Download QR + Amount
                    </button>
                  </div>
                </div>

                {/* Bank Account Information */}
                {sellerQRCode.bankName && sellerQRCode.bankAccountNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      Bank Account Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{sellerQRCode.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Holder:</span>
                        <span className="font-medium">{sellerQRCode.bankAccountHolder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium font-mono">{sellerQRCode.bankAccountNumber}</span>
                      </div>
                      {sellerQRCode.bankCode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank Code:</span>
                          <span className="font-medium">{sellerQRCode.bankCode}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      ✅ Seller has verified bank account for secure payments
                    </div>
                    
                    {/* Download Bank Info Button */}
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => {
                          const bankInfo = `Bank Account Information\n\nBank: ${sellerQRCode.bankName}\nAccount Holder: ${sellerQRCode.bankAccountHolder}\nAccount Number: ${sellerQRCode.bankAccountNumber}${sellerQRCode.bankCode ? `\nBank Code: ${sellerQRCode.bankCode}` : ''}\n\nAmount to Pay: RM ${calculateTotal().toFixed(2)}\n\nPayment Date: ${new Date().toLocaleString()}`;
                          
                          const blob = new Blob([bankInfo], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `bank-info-${sellerQRCode.name || 'seller'}.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        📥 Download Bank Info
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Amount to pay:</strong> RM {calculateTotal().toFixed(2)}
                  </p>
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Receipt
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <p className="text-xs text-gray-500">
                    Upload a screenshot or photo of your payment receipt
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQRPayment(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReceiptUpload}
                  disabled={!receiptFile || uploadingReceipt}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Flow Guide */}
      <PaymentFlowGuide
        isOpen={showPaymentGuideModal}
        onClose={() => setShowPaymentGuideModal(false)}
      />

      {/* Payment Recovery Modal */}
      {showPaymentRecovery && paymentSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Continue Payment</h2>
                <button
                  onClick={clearPaymentSession}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Recovery Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">📱 Payment Session Detected</h3>
                <p className="text-sm text-blue-800 mb-3">
                  We found an incomplete QR payment session. You can continue where you left off or start fresh.
                </p>
                <div className="text-sm text-blue-700">
                  <p><strong>Amount:</strong> RM {paymentSession.totalAmount?.toFixed(2)}</p>
                  <p><strong>Product:</strong> {paymentSession.product?.name}</p>
                  <p><strong>Quantity:</strong> {paymentSession.quantity}</p>
                  <p><strong>Started:</strong> {new Date(paymentSession.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={clearPaymentSession}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Start Fresh
                </button>
                <button
                  onClick={recoverPaymentSession}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    // Get order details from URL parameters
    const productName = searchParams.get('product');
    const quantity = searchParams.get('quantity');
    const total = searchParams.get('total');
    const orderId = searchParams.get('orderId');

    if (productName && quantity && total) {
      setOrderDetails({
        productName,
        quantity: parseInt(quantity),
        total: parseFloat(total),
        orderId
      });
    }
    // Fetch latest order status
    if (orderId) {
      fetch(`/api/buyer/orders?orderId=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.orders && data.orders.length > 0) {
            setLatestOrder(data.orders[0]);
          }
        });
    }
  }, [searchParams]);

  const handleContinueShopping = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.userType === 'buyer') {
      router.push('/buyer/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleViewOrders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.userType === 'buyer') {
      router.push('/buyer/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      setUploadError('Please select a receipt file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('orderId', orderDetails.orderId);
      formData.append('receipt', receiptFile);
      const res = await fetch('/api/buyer/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Failed to upload receipt.');
      } else {
        setUploadSuccess(true);
      }
    } catch (err) {
      setUploadError('Failed to upload receipt.');
    } finally {
      setUploading(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Thank You for Your Order!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your order has been successfully placed and is being processed.
        </p>
        
        {/* Payment Status Message */}
        {latestOrder && (
          <div className="mb-4">
            <div className={`rounded-lg p-4 border ${
              latestOrder.paymentStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' :
              latestOrder.paymentStatus === 'paid' ? 'bg-green-50 border-green-200' :
              latestOrder.paymentStatus === 'failed' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {latestOrder.paymentStatus === 'pending' && (
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                {latestOrder.paymentStatus === 'paid' && (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                {latestOrder.paymentStatus === 'failed' && (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
                <span className={`font-semibold ${
                  latestOrder.paymentStatus === 'pending' ? 'text-yellow-800' :
                  latestOrder.paymentStatus === 'paid' ? 'text-green-800' :
                  latestOrder.paymentStatus === 'failed' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Payment Status: {latestOrder.paymentStatus.toUpperCase()}
                </span>
              </div>
              
              {latestOrder.paymentStatus === 'pending' && latestOrder.receiptUrl && (
                <p className="text-yellow-700 text-sm">
                  📄 Receipt uploaded successfully! The seller is reviewing your payment. You'll receive an email notification once approved.
                </p>
              )}
              {latestOrder.paymentStatus === 'pending' && !latestOrder.receiptUrl && (
                <p className="text-yellow-700 text-sm">
                  ⚠️ Please upload your payment receipt below to proceed with the order.
                </p>
              )}
              {latestOrder.paymentStatus === 'paid' && (
                <p className="text-green-700 text-sm">
                  ✅ Payment approved! Your order is now being processed and will be shipped soon.
                </p>
              )}
              {latestOrder.paymentStatus === 'failed' && (
                <p className="text-red-700 text-sm">
                  ❌ Payment rejected. Please upload a valid receipt or contact support for assistance.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Email Notification */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p className="text-green-800 font-medium">Email Confirmation Sent</p>
              <p className="text-green-700 text-sm">Check your email for order details and updates</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{orderDetails.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{orderDetails.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-green-600">RM{orderDetails.total.toFixed(2)}</span>
              </div>
              {orderDetails.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-blue-600">#{orderDetails.orderId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receipt Upload Section - Only show for manual payments */}
        {latestOrder && latestOrder.paymentStatus !== 'paid' && latestOrder.paymentMethod !== 'billplz' && (
          <div className={`rounded-lg p-4 mb-6 ${
            latestOrder.paymentStatus === 'failed' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              latestOrder.paymentStatus === 'failed' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {latestOrder.paymentStatus === 'failed' ? 'Re-upload Payment Receipt' : 'Upload Payment Receipt'}
            </h3>
            <p className={`text-sm mb-2 ${
              latestOrder.paymentStatus === 'failed' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {latestOrder.paymentStatus === 'failed' 
                ? 'Your previous receipt was rejected. Please upload a valid payment receipt to proceed.'
                : 'Please upload your payment receipt to proceed. Your order will only be processed after the seller approves your payment.'
              }
            </p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mb-2"
              disabled={uploading || uploadSuccess}
            />
            {uploadError && <p className="text-red-600 text-sm mb-2">{uploadError}</p>}
            {uploadSuccess && <p className="text-green-600 text-sm mb-2">Receipt uploaded successfully!</p>}
            <button
              onClick={handleUploadReceipt}
              className={`w-full text-white py-2 px-4 rounded-lg transition-colors font-medium mb-2 ${
                latestOrder.paymentStatus === 'failed' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
              disabled={uploading || uploadSuccess}
            >
              {uploading ? 'Uploading...' : uploadSuccess ? 'Uploaded' : (latestOrder.paymentStatus === 'failed' ? 'Re-upload Receipt' : 'Upload Receipt')}
            </button>
          </div>
        )}

        {/* Payment Approved Message */}
        {latestOrder && latestOrder.paymentStatus === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="font-semibold text-green-900">
                {latestOrder.paymentMethod === 'billplz' ? 'Payment Successful!' : 'Payment Approved!'}
              </h3>
            </div>
            <p className="text-green-700 text-sm">
              {latestOrder.paymentMethod === 'billplz' 
                ? 'Your payment has been processed successfully through Billplz. Your order is now being processed and will be shipped soon.'
                : 'Your payment has been verified and approved by the seller. Your order is now being processed and will be shipped soon.'
              }
            </p>
          </div>
        )}

        {/* Billplz Payment Pending */}
        {latestOrder && latestOrder.paymentStatus === 'pending' && latestOrder.paymentMethod === 'billplz' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="font-semibold text-blue-900">Payment Processing</h3>
            </div>
            <p className="text-blue-700 text-sm">
              Your payment is being processed through Billplz. You will receive a confirmation email once the payment is completed.
            </p>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• The seller will review your order</li>
            <li>• You'll receive updates on your order status</li>
            <li>• The seller will contact you for shipping details</li>
            <li>• Your order will be shipped to your address</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinueShopping}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            disabled={!uploadSuccess}
          >
            Continue Shopping
          </button>
          
          <button
            onClick={handleViewOrders}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={!uploadSuccess}
          >
            View My Orders
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@livesales.com" className="text-blue-600 hover:underline">
              support@livesales.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 
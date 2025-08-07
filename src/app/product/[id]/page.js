"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { calculateDiscountedPrice, formatDiscountInfo } from '@/utils/productUtils';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProductDetails(params.id);
    }
  }, [params.id]);

  const fetchProductDetails = async (productId) => {
    try {
      const res = await fetch('/api/product/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!product) return;
    
    // Validate required fields
    if (!buyerEmail || !buyerName || !shippingAddress || !phone) {
      alert('Please provide all required information (name, email, shipping address, and phone) to continue');
      return;
    }

    if (quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }
    
    setPaymentLoading(true);
    try {
      const totalAmount = calculateDiscountedPrice(product) * quantity + (product.shippingPrice || 0);
      
      const requestBody = {
        productId: product.id,
        quantity: quantity,
        sellerId: product.seller.id,
        productName: product.name,
        unitPrice: calculateDiscountedPrice(product),
        totalAmount: totalAmount,
        buyerEmail: buyerEmail,
        buyerName: buyerName,
        shippingAddress: shippingAddress,
        phone: phone
      };

      console.log('🧪 Creating test payment:', requestBody);

      const res = await fetch('/api/payment/buy-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Test payment created successfully:', data);
        
        if (data.testPaymentUrl) {
          // Redirect to test payment page
          window.location.href = data.testPaymentUrl;
        } else {
          alert('Test payment created successfully! Check your email for confirmation.');
        }
      } else {
        alert(data.error || 'Failed to create test payment');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Payment error. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const discountInfo = formatDiscountInfo(product);
  const finalPrice = calculateDiscountedPrice(product);
  const totalPrice = finalPrice * quantity + (product.shippingPrice || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-500 mt-2">Product Code: {product.code || 'N/A'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  RM {finalPrice.toFixed(2)}
                </div>
                {discountInfo && (
                  <div className="text-sm text-gray-500 line-through">
                    RM {product.price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Product Info */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {discountInfo && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-800 font-medium">{discountInfo}</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium capitalize">{product.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className="font-medium">{product.quantity} units</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Condition:</span>
                      <p className="font-medium capitalize">{product.condition}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Shipping:</span>
                      <p className="font-medium">RM {(product.shippingPrice || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                {product.images && product.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Images</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Purchase Form */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                  
                  {/* Quantity Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= product.quantity}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.quantity} units available
                    </p>
                  </div>

                  {/* Price Summary */}
                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="flex justify-between mb-2">
                      <span>Unit Price:</span>
                      <span>RM {finalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>RM {(finalPrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>RM {(product.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>RM {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Buyer Information Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address *
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your complete shipping address"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  {/* Single Test Payment Button */}
                  <button
                    onClick={handleTestPayment}
                    disabled={product.quantity === 0 || paymentLoading || !buyerEmail || !buyerName || !shippingAddress || !phone}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {paymentLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>🧪</span>
                        <span>{product.quantity === 0 ? 'Out of Stock' : 'Test Payment'}</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This is a test payment. No real charges will be made.
                  </p>
                </div>

                {/* Seller Information */}
                <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Seller:</span>
                      <p className="font-medium">{product.seller.name}</p>
                    </div>
                    {product.seller.companyName && (
                      <div>
                        <span className="text-sm text-gray-600">Company:</span>
                        <p className="font-medium">{product.seller.companyName}</p>
                      </div>
                    )}
                    {product.seller.businessType && (
                      <div>
                        <span className="text-sm text-gray-600">Business Type:</span>
                        <p className="font-medium capitalize">{product.seller.businessType}</p>
                      </div>
                    )}
                    {product.seller.bio && (
                      <div>
                        <span className="text-sm text-gray-600">About:</span>
                        <p className="text-sm">{product.seller.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Bank Account Information */}
                  {product.seller.bankName && product.seller.bankAccountNumber && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                        Bank Account Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank:</span>
                          <span className="font-medium">{product.seller.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Holder:</span>
                          <span className="font-medium">{product.seller.bankAccountHolder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="font-medium font-mono">{product.seller.bankAccountNumber}</span>
                        </div>
                        {product.seller.bankCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bank Code:</span>
                            <span className="font-medium">{product.seller.bankCode}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        ✅ Seller has verified bank account for direct transfers
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-3">
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Contact Seller
                    </button>
                    <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                      Share Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
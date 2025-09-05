"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { calculateDiscountedPrice, formatDiscountInfo } from '@/utils/productUtils';
import EnhancedProductPurchase from '@/components/EnhancedProductPurchase';
import ImageCarousel from '@/components/ImageCarousel';

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  const handleEnhancedPurchase = async (purchaseData) => {
    console.log('🚀🚀🚀 handleEnhancedPurchase FUNCTION CALLED! 🚀🚀🚀');
    console.log('🛒 Purchase initiated with data:', purchaseData);
    console.log('📋 Product available:', !!product);
    console.log('📋 Product details:', product);
    
    if (!product) {
      console.log('❌ No product available');
      return;
    }
    
    setPaymentLoading(true);
    
    try {
      // Use the exact same logic as the working multi-products page
      const totalAmount = calculateDiscountedPrice(product) * purchaseData.quantity + (product.shippingPrice || 0);
      
      console.log('🧮 Frontend calculation (same as multi-products):');
      console.log('   - Unit Price:', calculateDiscountedPrice(product));
      console.log('   - Quantity:', purchaseData.quantity);
      console.log('   - Shipping Cost:', product.shippingPrice || 0);
      console.log('   - Calculation:', `${calculateDiscountedPrice(product)} × ${purchaseData.quantity} + ${product.shippingPrice || 0}`);
      console.log('   - Total Amount:', totalAmount);
      
      // Create payment through the CHIP Collect API (exact same structure as multi-products)
      const paymentResponse = await fetch('/api/payment/buy-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: purchaseData.quantity,
          sellerId: product.seller.id,
          productName: product.name,
          unitPrice: calculateDiscountedPrice(product),
          totalAmount: totalAmount,
          buyerEmail: purchaseData.email,
          buyerName: purchaseData.name,
          shippingAddress: purchaseData.shippingAddress,
          phone: purchaseData.phone,
          selectedBank: purchaseData.selectedBank
        })
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('✅ Payment created successfully:', paymentData);
        
        // Store order details for success page
        localStorage.setItem('pendingOrder', JSON.stringify({
          orderId: paymentData.orderIds?.[0] || paymentData.reference,
          totalAmount: totalAmount,
          productName: product.name,
          quantity: purchaseData.quantity,
          selectedBank: purchaseData.selectedBank
        }));
        
        // Redirect to CHIP Collect payment page (same as multi-products)
        if (paymentData.paymentUrl) {
          console.log('🔗 Redirecting to CHIP Collect payment page:', paymentData.paymentUrl);
          window.location.href = paymentData.paymentUrl;
        } else if (paymentData.checkoutUrl) {
          console.log('🔗 Redirecting to CHIP Collect checkout:', paymentData.checkoutUrl);
          window.location.href = paymentData.checkoutUrl;
        } else {
          console.log('⚠️ No payment URL received, showing alert');
          alert('Payment created successfully! Check your email for confirmation.');
        }
      } else {
        const errorData = await paymentResponse.json();
        console.error('❌ Payment creation failed:', errorData);
        alert(errorData.error || 'Failed to create payment');
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
  const totalPrice = finalPrice * 1 + (product.shippingPrice || 0);

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
                                {/* Main Product Image with Carousel */}
                <div className="mb-6">
                  <div className="w-full h-64 sm:h-80 rounded-lg border border-gray-200 shadow-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <ImageCarousel 
                        images={product.images} 
                        productName={product.name}
                        autoSlideInterval={4000}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-gray-500 text-sm">No product image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {discountInfo && discountInfo.isValid && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="font-semibold text-red-800">Special Offer!</p>
                        <p className="text-red-700 text-sm">{discountInfo.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                

                {/* Product Specifications */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{product.category || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Available:</span>
                      <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity > 0 ? `${product.quantity} units` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Cost:</span>
                      <span className="font-medium">RM {(product.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Enhanced Payment Form */}
              <div>
                {product.quantity > 0 ? (
                  <EnhancedProductPurchase
                    product={product}
                    onPurchase={handleEnhancedPurchase}
                    loading={paymentLoading}
                    showPaymentGuide={true}
                  />
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Out of Stock</h3>
                    <p className="text-red-700">This product is currently unavailable. Please check back later.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { calculateDiscountedPrice, formatDiscountInfo } from '@/utils/productUtils';
import ImageCarousel from '@/components/ImageCarousel';
import DualPaymentModal from '@/components/DualPaymentModal';

export default function MultiProductPage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [buyerInfo, setBuyerInfo] = useState({
    name: '', email: '', phone: '', shippingAddress: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [hasFetched, setHasFetched] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [orderData, setOrderData] = useState(null);
  
  // QR Payment state
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [sellerQRCode, setSellerQRCode] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // Payment session state
  const [paymentSession, setPaymentSession] = useState(null);
  const [showPaymentRecovery, setShowPaymentRecovery] = useState(false);

  // Check for existing payment session on page load
  useEffect(() => {
    const savedSession = localStorage.getItem('qrPaymentSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Check if session is not expired (24 hours)
        const now = Date.now();
        if (session.timestamp && (now - session.timestamp) < 24 * 60 * 60 * 1000) {
          setPaymentSession(session);
          setShowPaymentRecovery(true);
        } else {
          // Clear expired session
          localStorage.removeItem('qrPaymentSession');
        }
      } catch (error) {
        console.error('Error parsing saved payment session:', error);
        localStorage.removeItem('qrPaymentSession');
      }
    }
  }, []);

  const fetchProducts = useCallback(async (productIds) => {
    // Prevent multiple fetches
    if (hasFetched) {
      console.log('🔒 Already fetched products, skipping...');
      return;
    }
    
    try {
      console.log('🔍 Fetching products for IDs:', productIds);
      setHasFetched(true);
      
      // First, try to fetch products by specific IDs
      const specificProductsResponse = await fetch(`/api/products?ids=${productIds.join(',')}`);
      
      if (specificProductsResponse.ok) {
        const specificData = await specificProductsResponse.json();
        console.log('📦 Specific products response:', specificData);
        
        if (specificData.products && specificData.products.length > 0) {
          console.log('✅ Found products by specific IDs:', specificData.products);
          setProducts(specificData.products);
          const initialQuantities = {};
          specificData.products.forEach(product => {
            initialQuantities[product.id] = 1;
          });
          setQuantities(initialQuantities);
          setLoading(false);
          return;
        }
      }
      
      // Fallback: fetch all products and filter
      console.log('🔄 Fallback: fetching all products and filtering...');
      const response = await fetch('/api/products');
      const data = await response.json();
      
      console.log('📦 All products from API:', data.products);
      console.log('🔍 Available product IDs:', data.products?.map(p => p.id) || []);
      
      // Filter to only the requested products
      const requestedProducts = data.products?.filter(product => {
        const productIdStr = product.id.toString();
        const isMatch = productIds.some(id => id.toString() === productIdStr);
        
        console.log(`🔍 Checking product ID: ${product.id} (${productIdStr}) against requested: ${productIds.join(', ')}`);
        console.log(`🔍 Match result: ${isMatch}`);
        
        return isMatch;
      }) || [];
      
      console.log('✅ Requested products found:', requestedProducts);
      console.log('🔍 Requested IDs:', productIds);
      console.log('🔍 Found product IDs:', requestedProducts.map(p => p.id));

      if (requestedProducts.length === 0) {
        console.log('❌ No requested products found');
        setDebugInfo({
          requestedIds: productIds,
          availableIds: data.products?.map(p => p.id) || [],
          totalProducts: data.products?.length || 0
        });
        setError(`No products found with IDs: ${productIds.join(', ')}`);
        setLoading(false);
        return;
      }

      setProducts(requestedProducts);
      const initialQuantities = {};
      requestedProducts.forEach(product => {
        initialQuantities[product.id] = 0; // Start with 0 quantity
      });
      setQuantities(initialQuantities);
      console.log('🎯 Products loaded successfully:', requestedProducts.length);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [hasFetched]);

  useEffect(() => {
    console.log('🔍 Multi-Product Route params:', params);
    console.log('🔍 IDs string:', params.ids);
    
    if (params.ids && !hasFetched) {
      const ids = params.ids.split(',').map(id => id.trim());
      console.log('🔍 Parsed IDs:', ids);
      fetchProducts(ids);
    } else if (!params.ids) {
      console.log('❌ No product IDs provided');
      setError('No product IDs provided');
      setLoading(false);
    }
  }, [params.ids, fetchProducts, hasFetched]);

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (product && newQuantity >= 0 && newQuantity <= product.quantity) {
      setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const calculateProductTotal = (product) => {
    const quantity = quantities[product.id] || 1;
    const finalPrice = calculateDiscountedPrice(product);
    return finalPrice * quantity + (product.shippingPrice || 0);
  };

  const calculateGrandTotal = () => {
    return products
      .filter(product => (quantities[product.id] || 0) > 0)
      .reduce((total, product) => total + calculateProductTotal(product), 0);
  };

  const handlePurchase = async () => {
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.shippingAddress) {
      alert('Please provide all required information');
      return;
    }

    // Filter products with quantity > 0
    const productsToOrder = products.filter(product => (quantities[product.id] || 0) > 0);
    
    if (productsToOrder.length === 0) {
      alert('Please select at least one product with quantity > 0');
      return;
    }

    // For multi-product orders, we'll use the first product's seller as the main seller
    const mainProduct = productsToOrder[0];
    const sellerId = mainProduct.seller.id;
    
    // Fetch seller information including QR code
    try {
      const sellerResponse = await fetch(`/api/seller/public-profile?id=${sellerId}`);
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSelectedSeller(sellerData);
        
        // Create order data for the modal
        const totalAmount = calculateGrandTotal();
        const orderData = {
          id: `temp-${Date.now()}`, // Temporary ID for the modal
          product: {
            name: productsToOrder.length === 1 
              ? mainProduct.name 
              : `${mainProduct.name} + ${productsToOrder.length - 1} other product(s)`,
            seller: mainProduct.seller
          },
          quantity: productsToOrder.reduce((total, product) => total + (quantities[product.id] || 0), 0),
          totalAmount: totalAmount,
          buyerId: 1, // Temporary buyer ID
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          productId: mainProduct.id,
          shippingAddress: buyerInfo.shippingAddress,
          phone: buyerInfo.phone,
          // Store additional products info
          additionalProducts: productsToOrder.slice(1).map(product => ({
            id: product.id,
            name: product.name,
            quantity: quantities[product.id] || 0,
            price: calculateDiscountedPrice(product),
            shippingPrice: product.shippingPrice || 0
          }))
        };
        
        setOrderData(orderData);
        setShowPaymentModal(true);
      } else {
        throw new Error('Failed to fetch seller information');
      }
    } catch (error) {
      console.error('Error fetching seller info:', error);
      alert('Failed to load payment options. Please try again.');
    }
  };

  const handlePaymentSuccess = (result) => {
    setShowPaymentModal(false);
    setSelectedSeller(null);
    setOrderData(null);
    
    // Reset form
    setBuyerInfo({ name: '', email: '', phone: '', shippingAddress: '' });
    const newQuantities = {};
    products.forEach(product => {
      newQuantities[product.id] = 0;
    });
    setQuantities(newQuantities);
    
    alert('Payment processed successfully! Check your email for confirmation.');
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setSelectedSeller(null);
    setOrderData(null);
  };

  const handleQRPayment = async () => {
    if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone || !buyerInfo.shippingAddress) {
      alert('Please provide all required information');
      return;
    }

    // Filter products with quantity > 0
    const productsToOrder = products.filter(product => (quantities[product.id] || 0) > 0);
    
    if (productsToOrder.length === 0) {
      alert('Please select at least one product with quantity > 0');
      return;
    }

    // For multi-product orders, we'll use the first product's seller as the main seller
    const mainProduct = productsToOrder[0];
    
    console.log('Main product:', mainProduct);
    console.log('Seller object:', mainProduct.seller);
    
    if (!mainProduct.seller) {
      console.error('No seller object found for product:', mainProduct);
      alert('Unable to find seller information. Please try again.');
      return;
    }
    
    const sellerId = mainProduct.seller.id;
    console.log('Seller ID:', sellerId);
    
    if (!sellerId) {
      console.error('No seller ID found for product:', mainProduct);
      console.error('Product structure:', JSON.stringify(mainProduct, null, 2));
      alert('Unable to find seller information. Please try again.');
      return;
    }
    
    try {
      console.log('Fetching QR code for seller ID:', sellerId);
      // Fetch seller QR code
      const sellerResponse = await fetch(`/api/seller/public-profile?id=${sellerId}`);
      console.log('Response status:', sellerResponse.status);
      
      if (sellerResponse.ok) {
        const responseData = await sellerResponse.json();
        console.log('Response data:', responseData);
        const sellerData = responseData.seller; // Extract seller from response
        console.log('Seller data:', sellerData);
        
        // Create payment session
        const session = {
          timestamp: Date.now(),
          sellerData: sellerData,
          buyerInfo: buyerInfo,
          products: productsToOrder.map(product => ({
            id: product.id,
            name: product.name,
            quantity: quantities[product.id] || 0,
            price: calculateDiscountedPrice(product),
            shippingPrice: product.shippingPrice || 0
          })),
          totalAmount: calculateGrandTotal(),
          pageType: 'multi-product',
          pageUrl: window.location.href
        };
        
        // Save to localStorage
        localStorage.setItem('qrPaymentSession', JSON.stringify(session));
        setPaymentSession(session);
        
        setSellerQRCode(sellerData);
        setShowQRPayment(true);
      } else {
        const errorText = await sellerResponse.text();
        console.error('API Error:', sellerResponse.status, errorText);
        throw new Error(`Failed to fetch seller QR code: ${sellerResponse.status}`);
      }
    } catch (error) {
      console.error('Error fetching seller QR code:', error);
      alert('Failed to load QR code. Please try again.');
    }
  };

  // Payment session recovery functions
  const recoverPaymentSession = () => {
    if (paymentSession) {
      setSellerQRCode(paymentSession.sellerData);
      setBuyerInfo(paymentSession.buyerInfo);
      setShowQRPayment(true);
      setShowPaymentRecovery(false);
    }
  };

  const clearPaymentSession = () => {
    localStorage.removeItem('qrPaymentSession');
    setPaymentSession(null);
    setShowPaymentRecovery(false);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      alert('Please select a receipt file');
      return;
    }

    setUploadingReceipt(true);

    try {
      // Filter products with quantity > 0
      const productsToOrder = products.filter(product => (quantities[product.id] || 0) > 0);
      const mainProduct = productsToOrder[0];
      const sellerId = mainProduct.seller.id;
      const totalAmount = calculateGrandTotal();

      // Create form data for receipt upload
      const formData = new FormData();
      formData.append('orderId', `temp-${Date.now()}`);
      formData.append('sellerId', sellerId);
      formData.append('buyerId', 4); // Using buyer ID 4 (Mike Chen)
      formData.append('amount', totalAmount);
      formData.append('receipt', receiptFile);
      
      // Add buyer and product information for QR payments
      formData.append('buyerName', buyerInfo.name);
      formData.append('buyerEmail', buyerInfo.email);
      formData.append('buyerPhone', buyerInfo.phone);
      formData.append('productName', productsToOrder.length === 1 
        ? mainProduct.name 
        : `${mainProduct.name} + ${productsToOrder.length - 1} other product(s)`);
      formData.append('productId', mainProduct.id);
      formData.append('quantity', productsToOrder.reduce((total, product) => total + (quantities[product.id] || 0), 0));
      formData.append('shippingAddress', buyerInfo.shippingAddress);

      const response = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData
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
        const newQuantities = {};
        products.forEach(product => {
          newQuantities[product.id] = 0;
        });
        setQuantities(newQuantities);
      } else {
        alert(data.error || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Receipt upload error:', error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 mb-2">Loading products...</p>
          <p className="text-sm text-gray-500">Requested IDs: {params.ids}</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Products Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The products you are looking for do not exist.'}</p>
          
          {debugInfo.requestedIds && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left text-sm">
              <p className="font-semibold mb-2">Debug Information:</p>
              <p><strong>Requested IDs:</strong> {debugInfo.requestedIds.join(', ')}</p>
              <p><strong>Available IDs:</strong> {debugInfo.availableIds.join(', ') || 'None'}</p>
              <p><strong>Total Products:</strong> {debugInfo.totalProducts}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Go to Homepage
            </a>
            <a href="/products" className="block text-blue-600 hover:text-blue-800 underline">
              Browse All Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Selected Products</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            You have {products.length} product(s) available • {products.filter(p => (quantities[p.id] || 0) > 0).length} in cart
          </p>
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const discountInfo = formatDiscountInfo(product);
                const finalPrice = calculateDiscountedPrice(product);
                const quantity = quantities[product.id] || 0;
                const productTotal = finalPrice * quantity + (product.shippingPrice || 0);
                const isExcluded = quantity === 0;

                return (
                  <div key={product.id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 ${isExcluded ? 'opacity-60 border-2 border-gray-200' : 'hover:scale-[1.02] hover:border-gray-200'}`}>
                    <div className="h-48 sm:h-56 overflow-hidden bg-gray-50">
                      {product.images && product.images.length > 0 ? (
                        <ImageCarousel 
                          images={product.images} 
                          productName={product.name}
                          autoSlideInterval={4000}
                          compact={true}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-xs">No image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="mb-2">
                        <div className="text-base font-bold text-orange-600">
                          RM {finalPrice.toFixed(2)}
                        </div>
                        {discountInfo && discountInfo.isValid && (
                          <div className="text-xs text-gray-500 line-through">
                            RM {product.price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            disabled={quantity <= 0}
                          >-</button>
                          <span className={`w-8 text-center font-medium text-xs ${quantity === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            disabled={quantity >= product.quantity}
                          >+</button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{product.quantity} units available</p>
                          {quantity === 0 && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                              Not included
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 bg-gray-50 rounded border text-xs">
                        <div className="flex justify-between mb-1">
                          <span>Unit Price:</span>
                          <span>RM {finalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Quantity:</span>
                          <span>{quantity}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Shipping:</span>
                          <span>RM {(product.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm border-t pt-1">
                          <span>Total:</span>
                          <span>RM {productTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchase Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Purchase Summary</h3>
              
              {/* Instructions */}
              <div className="mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  <i className="fas fa-info-circle mr-1 sm:mr-2"></i>
                  Set quantity to 0 to exclude items from your order. Only products with quantity &gt; 0 will be processed.
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => {
                    const newQuantities = {};
                    products.forEach(product => {
                      newQuantities[product.id] = 1;
                    });
                    setQuantities(newQuantities);
                  }}
                  className="flex-1 px-2 sm:px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Add All
                </button>
                <button
                  onClick={() => {
                    const newQuantities = {};
                    products.forEach(product => {
                      newQuantities[product.id] = 0;
                    });
                    setQuantities(newQuantities);
                  }}
                  className="flex-1 px-2 sm:px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <i className="fas fa-minus mr-1"></i>
                  Remove All
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Order Summary</h4>
                <div className="space-y-1 sm:space-y-2">
                  {products.filter(product => (quantities[product.id] || 0) > 0).map((product) => {
                    const quantity = quantities[product.id] || 0;
                    const finalPrice = calculateDiscountedPrice(product);
                    const productTotal = finalPrice * quantity + (product.shippingPrice || 0);
                    
                    return (
                      <div key={product.id} className="flex justify-between text-xs sm:text-sm">
                        <span className="truncate">{product.name} (x{quantity})</span>
                        <span>RM {productTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Grand Total:</span>
                    <span>RM {calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={buyerInfo.name}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={buyerInfo.phone}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
                  <textarea
                    value={buyerInfo.shippingAddress}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your complete shipping address"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => alert('Coming Soon! Use QR Code Payment instead.')}
                disabled={true}
                className="w-full bg-gray-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>🚧</span>
                <span>
                  Coming Soon ({products.filter(p => (quantities[p.id] || 0) > 0).length} Product{products.filter(p => (quantities[p.id] || 0) > 0).length !== 1 ? 's' : ''})
                </span>
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Only products with quantity &gt; 0 will be ordered. Use QR Code Payment for checkout.
              </p>


              {/* QR Payment Button */}
              <button
                onClick={handleQRPayment}
                disabled={paymentLoading || products.filter(p => (quantities[p.id] || 0) > 0).length === 0}
                className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base mt-3"
                style={{ zIndex: 10, position: 'relative' }}
              >
                <span>📱</span>
                <span>Purchase with QR Code</span>
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Scan seller's QR code and upload payment receipt for manual verification.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dual Payment Modal */}
      {showPaymentModal && orderData && selectedSeller && (
        <DualPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          order={orderData}
          seller={selectedSeller}
          onSuccess={handlePaymentSuccess}
        />
      )}


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
                  {products.filter(product => (quantities[product.id] || 0) > 0).map((product) => {
                    const quantity = quantities[product.id] || 0;
                    const finalPrice = calculateDiscountedPrice(product);
                    const productTotal = finalPrice * quantity + (product.shippingPrice || 0);
                    
                    return (
                      <div key={product.id}>
                        <div>Product: {product.name}</div>
                        <div>Quantity: {quantity}</div>
                        <div>Total: RM {productTotal.toFixed(2)}</div>
                      </div>
                    );
                  })}
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
                    onError={(e) => {
                      console.error('QR code image failed to load:', e);
                      e.target.style.display = 'none';
                    }}
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
        ctx.fillText(`RM ${calculateGrandTotal().toFixed(2)}`, canvas.width / 2, qrY + qrSize + 80);

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
            link.download = `qr-payment-${sellerQRCode.name || 'seller'}-${calculateGrandTotal().toFixed(2)}.png`;
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
                          <strong>iPhone:</strong> Long press image → "Add to Photos" or "Save Image"<br>
                          <strong>Android:</strong> Long press image → "Download Image" or "Save image"<br>
                          <span style="color:#1976d2;">The image will appear in your phone's Photos/Gallery app.</span>
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
        }, 'image/png', 0.95);
      };

      qrImg.onerror = () => {
        alert('Failed to load QR code image. Please try again.');
      };

      qrImg.src = sellerQRCode.qrCodeImage;
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
                          const bankInfo = `Bank Account Information\n\nBank: ${sellerQRCode.bankName}\nAccount Holder: ${sellerQRCode.bankAccountHolder}\nAccount Number: ${sellerQRCode.bankAccountNumber}${sellerQRCode.bankCode ? `\nBank Code: ${sellerQRCode.bankCode}` : ''}\n\nAmount to Pay: RM ${calculateGrandTotal().toFixed(2)}\n\nPayment Date: ${new Date().toLocaleString()}`;
                          
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
                    <strong>Amount to pay:</strong> RM {calculateGrandTotal().toFixed(2)}
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
                  <p><strong>Products:</strong> {paymentSession.products?.length || 0} items</p>
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

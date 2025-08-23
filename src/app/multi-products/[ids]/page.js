"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { calculateDiscountedPrice, formatDiscountInfo } from '@/utils/productUtils';
import ImageCarousel from '@/components/ImageCarousel';

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

    setPaymentLoading(true);
    try {
      // Create orders for each product with quantity > 0
      const orderPromises = productsToOrder.map(product => {
        const quantity = quantities[product.id] || 0;
        
        return fetch('/api/buyer/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            buyerName: buyerInfo.name,
            quantity: quantity,
            shippingAddress: buyerInfo.shippingAddress,
            phone: buyerInfo.phone,
            email: buyerInfo.email
          }),
        });
      });

      const responses = await Promise.all(orderPromises);
      const results = await Promise.all(responses.map(res => res.json()));
      const successfulOrders = results.filter((result, index) => responses[index].ok);
      
      if (successfulOrders.length === productsToOrder.length) {
        // For multi-product orders, redirect to a combined payment confirmation
        const firstOrder = results[0];
        if (firstOrder.redirectUrl) {
          // Modify the redirect URL to include multi-product information
          const multiProductUrl = firstOrder.redirectUrl.replace('/payment-confirmation', '/payment-confirmation-multi');
          window.location.href = multiProductUrl;
        } else {
          alert(`All ${productsToOrder.length} orders created successfully! Check your email for confirmation.`);
          setBuyerInfo({ name: '', email: '', phone: '', shippingAddress: '' });
        }
      } else {
        alert(`Created ${successfulOrders.length} out of ${productsToOrder.length} orders.`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase error. Please try again.');
    } finally {
      setPaymentLoading(false);
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {products.map((product) => {
                const discountInfo = formatDiscountInfo(product);
                const finalPrice = calculateDiscountedPrice(product);
                const quantity = quantities[product.id] || 0;
                const productTotal = finalPrice * quantity + (product.shippingPrice || 0);
                const isExcluded = quantity === 0;

                return (
                  <div key={product.id} className={`bg-white rounded-lg shadow-lg overflow-hidden ${isExcluded ? 'opacity-60 border-2 border-gray-200' : ''}`}>
                    <div className="aspect-square overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <ImageCarousel 
                          images={product.images} 
                          productName={product.name}
                          autoSlideInterval={4000}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p>No image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{product.description}</p>
                      
                      <div className="mb-3">
                        <div className="text-lg sm:text-xl font-bold text-orange-600">
                          RM {finalPrice.toFixed(2)}
                        </div>
                        {discountInfo && discountInfo.isValid && (
                          <div className="text-xs sm:text-sm text-gray-500 line-through">
                            RM {product.price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            disabled={quantity <= 0}
                          >-</button>
                          <span className={`w-10 sm:w-12 text-center font-medium text-sm sm:text-base ${quantity === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            disabled={quantity >= product.quantity}
                          >+</button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs sm:text-sm text-gray-500">{product.quantity} units available</p>
                          {quantity === 0 && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                              Not included in order
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 sm:p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between mb-1 sm:mb-2 text-xs sm:text-sm">
                          <span>Unit Price:</span>
                          <span>RM {finalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1 sm:mb-2 text-xs sm:text-sm">
                          <span>Quantity:</span>
                          <span>{quantity}</span>
                        </div>
                        <div className="flex justify-between mb-1 sm:mb-2 text-xs sm:text-sm">
                          <span>Shipping:</span>
                          <span>RM {(product.shippingPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-1 sm:pt-2">
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
                onClick={handlePurchase}
                disabled={paymentLoading || products.filter(p => (quantities[p.id] || 0) > 0).length === 0}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
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
                    <span>🛒</span>
                    <span>
                      Purchase {products.filter(p => (quantities[p.id] || 0) > 0).length} Product{products.filter(p => (quantities[p.id] || 0) > 0).length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Only products with quantity &gt; 0 will be ordered. You will be redirected to complete your payment after order creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


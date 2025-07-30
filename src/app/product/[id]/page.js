"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PaymentModal from '../../components/PaymentModal';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [images, setImages] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('currentUser')));
    if (!productId) return;
    fetch('/api/product/detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setSeller(data.seller);
          setImages(data.images || []);
        } else {
          setNotFound(true);
        }
      });
  }, [productId]);

  const quantityLeft = product ? product.quantity : 0;
  const shippingPrice = product ? product.shippingPrice : 0;
  const price = product ? product.price : 0;
  const outOfStock = quantityLeft === 0;
  const orderQty = Math.max(1, Math.min(quantity, quantityLeft));
  const total = price * orderQty + shippingPrice;
  const allValid =
    buyerName.trim() &&
    orderQty > 0 &&
    orderQty <= quantityLeft &&
    shippingAddress.trim() &&
    phone.trim() &&
    email.trim() &&
    !outOfStock;

  const handleOrder = async () => {
    setLoading(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/buyer/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          buyerName,
          quantity: orderQty,
          shippingAddress,
          phone,
          email,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Set order details for payment modal
        setOrderDetails({
          orderId: data.orderId,
          productName: product.name,
          quantity: orderQty,
          total: total,
          buyerName: buyerName,
          buyerEmail: email,
          phone: phone
        });
        
        // Show payment modal instead of redirecting
        setShowPaymentModal(true);
      } else {
        const errorData = await res.json();
        setMsg(errorData.error || 'Failed to place order.');
      }
    } catch (error) {
      setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl sm:text-6xl mb-4">😕</div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Browse Products
        </button>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.userType === 'seller') {
                  router.push('/seller/dashboard');
                } else {
                  router.push('/');
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Products
            </button>
            <div className="text-sm text-gray-500">
              Product ID: {productId}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left Column - Product Images */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {images.length > 0 ? (
                <img 
                  src={images[selectedImage]?.url || '/placeholder-product.jpg'} 
                  alt={product.name}
                  className="w-full h-64 sm:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-64 sm:h-96 bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img.url} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info & Order Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span>SKU: {productId}</span>
                <span className="hidden sm:inline">•</span>
                <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-green-600">RM{price.toFixed(2)}</span>
                <span className="text-gray-500">per unit</span>
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    outOfStock ? 'bg-red-500' : quantityLeft <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className={`font-medium ${
                    outOfStock ? 'text-red-700' : quantityLeft <= 5 ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {outOfStock ? 'Out of Stock' : quantityLeft <= 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                <span className="text-gray-600">
                  {quantityLeft} units available
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Information */}
            {/* {seller && (
              <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{seller.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{seller.name}</p>
                    <button 
                      onClick={() => router.push(`/seller/${seller.id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Seller Profile →
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {/* Order Form */}
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Place Your Order</h3>
                <button 
                  onClick={() => router.push('/order-tracking')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Track Order
                </button>
              </div>
              
              {outOfStock ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <div>
                      <p className="text-red-800 font-medium">Currently Out of Stock</p>
                      <p className="text-red-600 text-sm">This product is temporarily unavailable</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleOrder(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buyer Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={buyerName} 
                        onChange={e => setBuyerName(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        placeholder="Enter your full name"
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        placeholder="Enter your phone number"
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="Enter your email address"
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll send order updates to this email</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max={quantityLeft} 
                        value={orderQty} 
                        onChange={e => setQuantity(Number(e.target.value))} 
                        className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        required 
                      />
                      <span className="text-sm text-gray-500">(max: {quantityLeft})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={shippingAddress} 
                      onChange={e => setShippingAddress(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="Enter your complete shipping address"
                      rows="3"
                      required 
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Unit Price:</span>
                        <span>RM{price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{orderQty} × RM{price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>RM{shippingPrice.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">RM{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      loading || !allValid
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                    disabled={loading || !allValid}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing Order...
                      </div>
                    ) : (
                      'Place Order Now'
                    )}
                  </button>
                </form>
              )}
            </div>

            {msg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">{msg}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderDetails={orderDetails}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          // Redirect to success page after payment
          const successUrl = `/order-success?product=${encodeURIComponent(product.name)}&quantity=${orderQty}&total=${total.toFixed(2)}&orderId=${orderDetails?.orderId}`;
          router.push(successUrl);
        }}
      />
    </div>
  );
} 
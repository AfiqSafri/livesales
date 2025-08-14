"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDiscountInfo } from '@/utils/productUtils';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'GET',
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch products');
        return;
      }
      
      setProducts(data.products);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (showDiscountsOnly) {
        const discountInfo = formatDiscountInfo(product);
        return matchesSearch && discountInfo && discountInfo.isValid;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const getProductCard = (product) => {
    const discountInfo = formatDiscountInfo(product);
    const finalPrice = discountInfo ? discountInfo.discountedPrice : product.price;

    return (
      <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.productImages && product.productImages.length > 0 ? (
            <img
              src={product.productImages[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          )}
          
          {/* Discount Badge */}
          {discountInfo && discountInfo.isValid && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {discountInfo.discountLabel}
            </div>
          )}
          
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          {/* Price Section */}
          <div className="mb-3">
            {discountInfo && discountInfo.isValid ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    RM {finalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    RM {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Save RM {discountInfo.savings.toFixed(2)}!
                </p>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                RM {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>by {product.seller.name}</span>
            {product.seller.companyName && (
              <span>{product.seller.companyName}</span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push(`/product/${product.id}`)}
            disabled={product.quantity === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              product.quantity > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.quantity > 0 ? 'View Details' : 'Out of Stock'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Livesalez</h1>
              <p className="text-gray-600">Discover amazing products from local sellers</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Become a Seller
              </button>
              <button
                onClick={() => router.push('/login')}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Discount Filter */}
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showDiscountsOnly}
                onChange={(e) => setShowDiscountsOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show discounts only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No products available at the moment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {showDiscountsOnly && ' with active discounts'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(getProductCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate the discounted price for a product
 * @param {Object} product - Product object with discount fields
 * @returns {number} - The discounted price
 */
export function calculateDiscountedPrice(product) {
  if (!product.hasDiscount || !product.discountPercentage) {
    return product.price;
  }

  const discountAmount = product.discountType === 'percentage' 
    ? (product.price * product.discountPercentage / 100)
    : product.discountPercentage;

  return Math.max(0, product.price - discountAmount);
}

/**
 * Format discount information for display
 * @param {Object} product - Product object with discount fields
 * @returns {Object|null} - Formatted discount info or null if no valid discount
 */
export function formatDiscountInfo(product) {
  if (!product.hasDiscount || !product.discountPercentage) {
    return null;
  }

  // Check if discount has expired
  if (product.discountEndDate) {
    const now = new Date();
    const endDate = new Date(product.discountEndDate);
    if (now > endDate) {
      return null; // Discount has expired
    }
  }

  const originalPrice = product.price;
  const discountedPrice = calculateDiscountedPrice(product);
  const savings = originalPrice - discountedPrice;

  // Create discount label
  let discountLabel = '';
  if (product.discountType === 'percentage') {
    discountLabel = `${product.discountPercentage}% OFF`;
  } else {
    discountLabel = `RM ${product.discountPercentage} OFF`;
  }

  return {
    isValid: true,
    discountedPrice,
    originalPrice,
    savings,
    discountLabel,
    discountType: product.discountType,
    discountPercentage: product.discountPercentage,
    discountEndDate: product.discountEndDate
  };
}

/**
 * Check if a product has an active discount
 * @param {Object} product - Product object
 * @returns {boolean} - True if product has active discount
 */
export function hasActiveDiscount(product) {
  const discountInfo = formatDiscountInfo(product);
  return discountInfo !== null && discountInfo.isValid;
}

/**
 * Get discount percentage for display
 * @param {Object} product - Product object
 * @returns {number|null} - Discount percentage or null
 */
export function getDiscountPercentage(product) {
  if (!product.hasDiscount || product.discountType !== 'percentage') {
    return null;
  }
  return product.discountPercentage;
}

/**
 * Format price with currency
 * @param {number} price - Price amount
 * @param {string} currency - Currency code (default: 'MYR')
 * @returns {string} - Formatted price string
 */
export function formatPrice(price, currency = 'MYR') {
  return `${currency} ${price.toFixed(2)}`;
}

/**
 * Calculate savings amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} - Amount saved
 */
export function calculateSavings(originalPrice, discountedPrice) {
  return Math.max(0, originalPrice - discountedPrice);
}

/**
 * Get discount status text
 * @param {Object} product - Product object
 * @returns {string} - Status text
 */
export function getDiscountStatus(product) {
  if (!product.hasDiscount) {
    return 'No Discount';
  }

  if (product.discountEndDate) {
    const now = new Date();
    const endDate = new Date(product.discountEndDate);
    if (now > endDate) {
      return 'Expired';
    }
  }

  return 'Active';
}

/**
 * Get days remaining for discount
 * @param {Object} product - Product object
 * @returns {number|null} - Days remaining or null
 */
export function getDiscountDaysRemaining(product) {
  if (!product.discountEndDate) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(product.discountEndDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
} 

export function generateMultiProductUrl(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return null;
  }
  
  // Create a shorter URL format: /multi-products/15,14 for the new multi-product page
  const idsString = productIds.join(',');
  return `/multi-products/${idsString}`;
}

export function generateMultiProductUrlWithQuery(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return null;
  }
  
  // Create a query parameter format: /products?ids=15,14
  const idsString = productIds.join(',');
  return `/products?ids=${idsString}`;
} 
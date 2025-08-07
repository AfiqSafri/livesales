/**
 * Calculate the discounted price for a product
 * @param {number} originalPrice - The original price of the product
 * @param {boolean} hasDiscount - Whether the product has a discount
 * @param {number} discountPercentage - The discount percentage or fixed amount
 * @param {string} discountType - 'percentage' or 'fixed'
 * @param {Date} discountEndDate - When the discount expires (optional)
 * @returns {number} The discounted price
 */
export function calculateDiscountedPrice(originalPrice, hasDiscount, discountPercentage, discountType, discountEndDate = null) {
  if (!hasDiscount || !discountPercentage) {
    return originalPrice;
  }

  // Check if discount has expired
  if (discountEndDate && new Date() > new Date(discountEndDate)) {
    return originalPrice;
  }

  const price = parseFloat(originalPrice);
  const discount = parseFloat(discountPercentage);

  if (discountType === 'percentage') {
    return Math.max(0, price * (1 - discount / 100));
  } else {
    return Math.max(0, price - discount);
  }
}

/**
 * Check if a discount is still valid
 * @param {boolean} hasDiscount - Whether the product has a discount
 * @param {Date} discountEndDate - When the discount expires
 * @returns {boolean} Whether the discount is still valid
 */
export function isDiscountValid(hasDiscount, discountEndDate = null) {
  if (!hasDiscount) return false;
  if (!discountEndDate) return true;
  return new Date() <= new Date(discountEndDate);
}

/**
 * Format discount information for display
 * @param {Object} product - The product object
 * @returns {Object} Formatted discount information
 */
export function formatDiscountInfo(product) {
  if (!product.hasDiscount || !product.discountPercentage) {
    return null;
  }

  const isValid = isDiscountValid(product.hasDiscount, product.discountEndDate);
  const discountedPrice = calculateDiscountedPrice(
    product.price,
    product.hasDiscount,
    product.discountPercentage,
    product.discountType,
    product.discountEndDate
  );

  return {
    isValid,
    originalPrice: product.price,
    discountedPrice,
    savings: product.price - discountedPrice,
    discountPercentage: product.discountPercentage,
    discountType: product.discountType,
    discountEndDate: product.discountEndDate,
    discountLabel: product.discountType === 'percentage' 
      ? `${product.discountPercentage}% OFF`
      : `RM ${product.discountPercentage} OFF`
  };
} 
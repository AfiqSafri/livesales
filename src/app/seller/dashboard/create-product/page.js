"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProduct() {
  const router = useRouter();
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    shippingPrice: '',
    hasDiscount: false,
    discountPercentage: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountEndDate: '',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    const maxFiles = 3;
    const currentCount = images.length;
    const remainingSlots = maxFiles - currentCount;
    
    if (remainingSlots <= 0) {
      alert('Maximum 3 images allowed. Please remove some images first.');
      e.target.value = '';
      return;
    }
    
    const newFiles = files.slice(0, remainingSlots);
    setImages([...images, ...newFiles]);
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleChooseFiles = e => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const calculateDiscountedPrice = () => {
    if (!form.hasDiscount || !form.price || !form.discountPercentage) return form.price;
    
    const originalPrice = parseFloat(form.price);
    const discountPercent = parseFloat(form.discountPercentage);
    
    if (form.discountType === 'percentage') {
      return (originalPrice * (1 - discountPercent / 100)).toFixed(2);
    } else {
      return Math.max(0, originalPrice - discountPercent).toFixed(2);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Form submission already in progress, ignoring duplicate click');
      return;
    }
    
    // Add a small delay to prevent accidental double-clicks
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setError('');
    setSuccess('');
    setIsSubmitting(true); // Set loading state
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.userType !== 'seller') {
      router.push('/login');
      setIsSubmitting(false);
      return;
    }
    if (!form.name || !form.description || !form.price || !form.quantity || !form.shippingPrice) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
    if (images.length === 0) {
      setError('Please upload at least 1 image.');
      setIsSubmitting(false);
      return;
    }
    
    // Validate discount fields
    if (form.hasDiscount) {
      if (!form.discountPercentage || parseFloat(form.discountPercentage) <= 0) {
        setError('Please enter a valid discount amount.');
        setIsSubmitting(false);
        return;
      }
      if (form.discountType === 'percentage' && parseFloat(form.discountPercentage) > 100) {
        setError('Discount percentage cannot exceed 100%.');
        setIsSubmitting(false);
        return;
      }
      if (form.discountType === 'fixed' && parseFloat(form.discountPercentage) >= parseFloat(form.price)) {
        setError('Fixed discount cannot be greater than or equal to the original price.');
        setIsSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('quantity', form.quantity);
    formData.append('shippingPrice', form.shippingPrice);
    formData.append('sellerId', user.id);
    formData.append('hasDiscount', form.hasDiscount);
    formData.append('discountPercentage', form.discountPercentage);
    formData.append('discountType', form.discountType);
    formData.append('discountEndDate', form.discountEndDate);
    images.forEach((img, i) => formData.append('images', img));
    
    try {
      const res = await fetch('/api/seller/create-product', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || data.details || 'Failed to create product');
        setIsSubmitting(false);
        return;
      }
      
      // Show success message
      setSuccess('Product created successfully!');
      
      // Show additional message if there's one
      if (data.message) {
        setSuccess(prev => prev + ' ' + data.message);
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Submit error:', error);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-2">Create Product</h2>
        
        <label className="block font-semibold">Product Name <span className="text-red-600">*</span></label>
        <input 
          name="name" 
          placeholder="Product Name" 
          className="w-full border p-2 rounded" 
          value={form.name} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <label className="block font-semibold">Description <span className="text-red-600">*</span></label>
        <textarea 
          name="description" 
          placeholder="Description" 
          className="w-full border p-2 rounded" 
          value={form.description} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <label className="block font-semibold">Price (RM) <span className="text-red-600">*</span></label>
        <input 
          name="price" 
          type="number" 
          step="0.01" 
          placeholder="Price in RM" 
          className="w-full border p-2 rounded" 
          value={form.price} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        {/* Discount Section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              name="hasDiscount"
              checked={form.hasDiscount}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
              disabled={isSubmitting}
            />
            <label className="font-semibold">Add Discount</label>
          </div>
          
          {form.hasDiscount && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  disabled={isSubmitting}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (RM)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount {form.discountType === 'percentage' ? 'Percentage' : 'Amount'} <span className="text-red-600">*</span>
                </label>
                <input
                  name="discountPercentage"
                  type="number"
                  step={form.discountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={form.discountType === 'percentage' ? '100' : ''}
                  placeholder={form.discountType === 'percentage' ? 'Enter percentage (e.g., 20)' : 'Enter amount (e.g., 10.50)'}
                  className="w-full border p-2 rounded"
                  value={form.discountPercentage}
                  onChange={handleChange}
                  required={form.hasDiscount}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount End Date</label>
                <input
                  name="discountEndDate"
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  value={form.discountEndDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
              
              {/* Price Preview */}
              {form.price && form.discountPercentage && (
                <div className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Original Price:</span>
                    <span className="text-gray-900 font-medium">RM {parseFloat(form.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discounted Price:</span>
                    <span className="text-green-600 font-bold">RM {discountedPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You Save:</span>
                    <span className="text-red-600 font-medium">
                      RM {(parseFloat(form.price) - parseFloat(discountedPrice)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <label className="block font-semibold">Product Images <span className="text-red-600">*</span> <span className="text-gray-500 text-xs">(max 3)</span></label>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          type="button"
          className={`px-4 py-2 rounded transition-all duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleChooseFiles}
          disabled={isSubmitting}
        >
          Choose Images
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {images.length}/3 images selected
          {images.length >= 3 && <span className="text-orange-600 font-medium"> (Maximum reached)</span>}
        </span>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {images.length > 0 && images.map((img, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-24 object-cover rounded" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, index) => index !== i))}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <label className="block font-semibold">Quantity <span className="text-red-600">*</span></label>
        <input 
          name="quantity" 
          type="number" 
          min="0" 
          placeholder="Quantity in stock" 
          className="w-full border p-2 rounded" 
          value={form.quantity} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        <label className="block font-semibold">Shipping Price (RM) <span className="text-red-600">*</span></label>
        <input 
          name="shippingPrice" 
          type="number" 
          step="0.01" 
          min="0" 
          placeholder="Shipping price in RM" 
          className="w-full border p-2 rounded" 
          value={form.shippingPrice} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
        
        {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {success && <div className="text-green-600 bg-green-50 p-3 rounded">{success}</div>}
        
        <button 
          type="submit" 
          className={`w-full p-3 rounded font-semibold transition-all duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]'
          }`} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating Product...
            </div>
          ) : (
            'Create Product'
          )}
        </button>
        
        <button 
          type="button" 
          className={`w-full p-3 rounded font-semibold transition-all duration-200 ${
            isSubmitting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-[1.02]'
          }`} 
          onClick={() => router.push('/seller/dashboard')} 
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
} 
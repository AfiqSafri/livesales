"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    shippingPrice: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.userType !== 'seller') {
      router.push('/login');
      return;
    }
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/product/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.product) {
        setForm({
          name: data.product.name,
          description: data.product.description,
          price: data.product.price.toString(),
          quantity: data.product.quantity.toString(),
          shippingPrice: data.product.shippingPrice.toString(),
        });
        setExistingImages(data.images || []);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter(img => img.id !== imageId));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.userType !== 'seller') {
      router.push('/login');
      return;
    }

    if (!form.quantity || !form.shippingPrice) {
      setError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('quantity', form.quantity);
    formData.append('shippingPrice', form.shippingPrice);
    formData.append('sellerId', user.id);
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    
    images.forEach((img, i) => formData.append('images', img));

    const res = await fetch('/api/seller/products/update', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update product');
      return;
    }
    
    setSuccess('Product updated! Redirecting...');
    setTimeout(() => router.push('/seller/dashboard'), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-2">Edit Product</h2>
        
        <label className="block font-semibold">Product Name <span className="text-red-600">*</span></label>
        <input 
          name="name" 
          placeholder="Product Name" 
          className="w-full border p-2 rounded" 
          value={form.name} 
          onChange={handleChange} 
          required 
        />
        
        <label className="block font-semibold">Description <span className="text-red-600">*</span></label>
        <textarea 
          name="description" 
          placeholder="Description" 
          className="w-full border p-2 rounded" 
          value={form.description} 
          onChange={handleChange} 
          required 
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
        />
        
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
        />

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block font-semibold">Current Images</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img 
                    src={img.url} 
                    alt="product" 
                    className="w-full h-24 object-cover rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <label className="block font-semibold">Add New Images <span className="text-gray-500 text-xs">(max 3)</span></label>
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleChooseFiles}
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

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Update Product</button>
        <button 
          type="button" 
          className="w-full bg-gray-200 text-gray-800 p-2 rounded mt-2" 
          onClick={() => router.push('/seller/dashboard')}
        >
          Cancel
        </button>
      </form>
    </div>
  );
} 
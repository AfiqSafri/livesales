"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useSellerLanguage } from '../SellerLanguageContext';
import { generateMultiProductUrl } from '@/utils/productUtils';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import QRCodeManager from '@/components/QRCodeManager';

export default function SellerProfile() {
  const router = useRouter();

  const { language } = useSellerLanguage();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', email: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    setForm({ 
      name: u.name, 
      bio: u.bio || '', 
      email: u.email || '',
      phone: u.phone || '',
      address: u.address || ''
    });
    setProfileImage(u.profileImage || null);
    fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: u.id }),
    })
      .then(res => res.json())
      .then(data => {
        const productsData = data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      });
  }, [router]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const selectAllProducts = () => {
    setSelectedProducts(filteredProducts.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  const generateMultiProductLink = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }
    
    const multiProductUrl = generateMultiProductUrl(selectedProducts);
    const fullUrl = `${window.location.origin}${multiProductUrl}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Multi-product link copied to clipboard!\nSelected ${selectedProducts.length} product(s)`);
  };

  const handleQRCodeUpdate = (qrData) => {
    // Update the user state with new QR code data
    setUser(prev => ({
      ...prev,
      qrCodeImage: qrData.qrCodeImage,
      qrCodeDescription: qrData.qrCodeDescription
    }));
    
    // Update localStorage
    const updatedUser = { ...user, ...qrData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('name', form.name);
      formData.append('bio', form.bio);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('address', form.address || '');
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await fetch('/api/seller/update-profile', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setMsg(data.error || data.details || 'Failed to update profile');
        return;
      }

      setMsg('Profile updated successfully!');
      
      // Update local storage with new data
      const updatedUser = { 
        ...user, 
        ...form,
        profileImage: data.profileImageUrl || user.profileImage
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('Profile update error:', error);
      setMsg('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.25rem;
          }
        }
        @media (max-width: 480px) {
          .mobile-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.25rem;
          }
        }
        @media (max-width: 360px) {
          .mobile-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem;
          }
        }
      `}</style>
      <ModernHeader />
      
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Responsive Seller Profile Header */}
          <div className="mb-8 lg:mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              {/* Seller Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 mb-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 border-4 border-white shadow-lg">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-2xl lg:text-3xl font-bold">{user.name?.charAt(0)?.toUpperCase() || 'S'}</span>
                      </div>
                    )}
                  </div>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                      title="Change Photo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Seller Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        {user.name}
              </h1>
                      <p className="text-gray-600 mb-2">
                        <i className="fas fa-envelope mr-2 text-purple-500"></i>
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-gray-600 mb-2">
                          <i className="fas fa-phone mr-2 text-purple-500"></i>
                          {user.phone}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          <i className="fas fa-check-circle mr-1"></i>
                          Verified Seller
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          <i className="fas fa-box mr-1"></i>
                          {products.length} Products
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!editing ? (
                        <button 
                          onClick={() => setEditing(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              {user.bio && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}
              
              {/* Address Section */}
              {user.address && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
                  <p className="text-gray-700 leading-relaxed">{user.address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Section */}
            <div className="lg:col-span-2">
              <div className="card card-hover p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Edit Profile Information</h2>
                </div>

                {editing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                            {previewImage ? (
                              <img 
                                src={previewImage} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          {previewImage && (
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline"
                          >
                            {previewImage ? 'Change Image' : 'Upload Image'}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG or GIF. Max 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name Field */}
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Bio Field */}
                    <div>
                      <label className="form-label">Bio</label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows="4"
                        className="form-input"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="+60 12-345 6789"
                      />
                    </div>

                    {/* Address Field */}
                    <div>
                      <label className="form-label">Address</label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows="3"
                        className="form-input"
                        placeholder="Enter your address..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 pt-4">
                                          <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-lg btn-primary group hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn btn-outline group hover:scale-105 transition-all duration-200"
                    >
                      <i className="fas fa-times mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                      Cancel
                    </button>
                    </div>

                    {/* Message Display */}
                    {msg && (
                      <div className={`p-4 rounded-lg text-sm ${
                        msg.includes('successfully') 
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {msg}
                      </div>
                    )}
                  </form>
                ) : null}
              </div>
            </div>

            {/* Mobile Responsive Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              {/* Account Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Account Information</h3>
                <div className="space-y-3 lg:space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-gray-900 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Seller</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Products:</span>
                    <span className="font-medium text-gray-900 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{products.length}</span>
                  </div>
                </div>
              </div>

              {/* Bank Account Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                  <i className="fas fa-university text-blue-600 mr-2"></i>
                  Bank Account
                </h3>
                
                {user?.bankAccountNumber && user?.bankName ? (
                  <div className="space-y-3 lg:space-y-4 text-sm">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-800">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span className="font-medium text-xs">Configured</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium text-gray-900">{user.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-medium text-gray-900 font-mono text-xs">{user.bankAccountNumber}</span>
                      </div>
                      {user.bankCode && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Bank Code:</span>
                          <span className="font-medium text-gray-900">{user.bankCode}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => router.push('/seller/bank-account')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 text-xs"
                      >
                        <i className="fas fa-edit"></i>
                        Update Bank Info
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center text-yellow-800">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        <span className="font-medium text-xs">Not Configured</span>
                      </div>
                      <p className="text-yellow-700 text-xs mt-2">
                        Buyers need your bank information to make payments
                      </p>
                    </div>
                    
                    <button
                      onClick={() => router.push('/seller/bank-account')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-university"></i>
                      Setup Bank Account
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Quick Actions</h3>
                <div className="space-y-3 lg:space-y-4">
                  <button 
                    onClick={() => router.push('/seller/dashboard/create-product')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Product
                  </button>
                  <button 
                    onClick={() => router.push('/seller/dashboard')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    View Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Browse Products
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Payment Section */}
          <div className="mt-8">
            <QRCodeManager seller={user} onUpdate={handleQRCodeUpdate} />
          </div>

          {/* Products Section */}
          <div className="mt-12">
            <div className="card card-hover p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Products</h2>
                  <p className="text-gray-600">Manage and share your product catalog</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="text-sm text-gray-500">{filteredProducts.length} of {products.length} products</span>
                  {products.length > 1 && (
                    <div className="flex items-center space-x-2">
                                        <button 
                    onClick={() => setShowProductSelector(!showProductSelector)}
                    className="btn btn-outline group hover:scale-105 transition-all duration-200"
                  >
                    <i className={`fas ${showProductSelector ? 'fa-times' : 'fa-link'} mr-2 group-hover:scale-110 transition-transform duration-200`}></i>
                    {showProductSelector ? 'Close Selector' : 'Select Products for Link'}
                  </button>
                  {selectedProducts.length > 0 && (
                    <button 
                      onClick={generateMultiProductLink}
                      className="btn btn-success ml-2 group hover:scale-105 transition-all duration-200"
                    >
                      <i className="fas fa-magic mr-2 group-hover:rotate-12 transition-transform duration-200"></i>
                      Generate Link ({selectedProducts.length})
                    </button>
                  )}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-4">Start selling by creating your first product</p>
                                     <button 
                     onClick={() => router.push('/seller/dashboard/create-product')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                   >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                     Create Product
                   </button>
                </div>
              ) : (
                <>
                  {/* Product Selection Interface */}
                  {showProductSelector && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-purple-900">Select Products for Multi-Product Link</h3>
                        <div className="flex items-center space-x-2">
                                                     <button 
                             onClick={selectAllProducts}
                             className="btn btn-sm btn-primary group hover:scale-105 transition-all duration-200"
                           >
                             <i className="fas fa-check-double mr-1 group-hover:scale-110 transition-transform duration-200"></i>
                             Select All
                           </button>
                           <button 
                             onClick={clearSelection}
                             className="btn btn-sm btn-outline ml-2 group hover:scale-105 transition-all duration-200"
                           >
                             <i className="fas fa-times mr-1 group-hover:scale-110 transition-transform duration-200"></i>
                             Clear All
                           </button>
                        </div>
                      </div>
                      <p className="text-sm text-purple-700 mb-4">
                        Selected: {selectedProducts.length} of {filteredProducts.length} products
                      </p>
                    </div>
                  )}

                  {/* Mobile Responsive Product Grid - Shows 4+ products per row */}
                  <div className="lg:hidden">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 text-center">
                        📱 Mobile View: {filteredProducts.length} products • 4 per row
                      </p>
                    </div>
                    <div className="mobile-grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 pb-4 min-w-0">
                      {filteredProducts.map(p => (
                        <div key={p.id} className={`bg-white rounded-lg border border-gray-200 shadow-sm p-1 sm:p-2 text-center transition-all duration-200 hover:scale-105 hover:shadow-md ${
                          showProductSelector && selectedProducts.includes(p.id) 
                            ? 'ring-2 ring-purple-500 bg-purple-50' 
                            : ''
                        }`}>
                          {/* Product Selection Checkbox */}
                          {showProductSelector && (
                            <div className="flex justify-center mb-1">
                              <input
                                type="checkbox"
                                id={`product-mobile-${p.id}`}
                                checked={selectedProducts.includes(p.id)}
                                onChange={() => toggleProductSelection(p.id)}
                                className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                            </div>
                          )}
                          
                          <div className="text-center mb-1">
                            <h3 className="font-semibold text-gray-900 text-xs truncate mb-1" title={p.name}>{p.name}</h3>
                            <span className="text-xs font-bold text-blue-600">RM{p.price}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1 text-center">Qty: {p.quantity}</p>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/product/${p.id}`);
                                alert('Product link copied to clipboard!');
                              }}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-1 py-1 rounded transition-colors"
                              title="Copy Link"
                            >
                              <i className="fas fa-share-alt text-xs"></i>
                            </button>
                            <button 
                              onClick={() => router.push(`/product/${p.id}`)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-1 py-1 rounded transition-colors"
                              title="View Product"
                            >
                              <i className="fas fa-eye text-xs"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Grid (hidden on mobile) */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                      <div key={p.id} className={`card card-hover p-6 ${
                        showProductSelector && selectedProducts.includes(p.id) 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : ''
                      }`}>
                        {/* Product Selection Checkbox */}
                        {showProductSelector && (
                          <div className="flex items-center mb-4">
                            <input
                              type="checkbox"
                              id={`product-desktop-${p.id}`}
                              checked={selectedProducts.includes(p.id)}
                              onChange={() => toggleProductSelection(p.id)}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label htmlFor={`product-desktop-${p.id}`} className="ml-2 text-sm font-medium text-purple-900">
                              Select for multi-product link
                            </label>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">{p.name}</h3>
                          <span className="text-lg font-bold text-blue-600">RM{p.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Quantity: {p.quantity}</p>
                        <div className="flex gap-3">
                                                   <button 
                           onClick={() => {
                             navigator.clipboard.writeText(`${window.location.origin}/product/${p.id}`);
                             alert('Product link copied to clipboard!');
                           }}
                           className="flex-1 btn btn-sm btn-outline group hover:scale-105 transition-all duration-200"
                         >
                           <i className="fas fa-share-alt mr-1 group-hover:scale-110 transition-transform duration-200"></i>
                           Share
                         </button>
                         <button 
                           onClick={() => router.push(`/product/${p.id}`)}
                           className="flex-1 btn btn-sm btn-primary group hover:scale-105 transition-all duration-200"
                         >
                           <i className="fas fa-eye mr-1 group-hover:scale-110 transition-transform duration-200"></i>
                           View
                         </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
} 
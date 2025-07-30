"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'buyer') {
      router.push('/login');
      return;
    }
    setUser(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      bio: u.bio || '',
    });
  }, [router]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = e => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('id', user.id);
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('bio', form.bio);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await fetch('/api/buyer/update-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to update profile');
        return;
      }

      // Update localStorage with new user data
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setMessage('Profile updated successfully!');
      setUser(updatedUser);
      
      // Clear form changes
      setProfileImage(null);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setProfileImage(null);
    setPreviewImage(null);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600">Update your account information</p>
            </div>
            <button
              onClick={() => router.push('/buyer/dashboard')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                        {previewImage ? (
                          <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover"/>
                        ) : user.profileImage ? (
                          <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover"/>
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
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {previewImage ? 'Change Image' : 'Upload Image'}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input 
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea 
                    name="bio"
                    rows="4"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Message */}
                {message && (
                  <div className={`px-4 py-3 rounded-lg ${
                    message.includes('successfully') 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium text-gray-900">Buyer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/buyer/dashboard')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Back to Dashboard
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Browse Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
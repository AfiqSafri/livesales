"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'seller',
    bio: '',
    phone: '',
    address: '',
    companyName: '',
    businessType: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user came from a seller link and set account type to buyer
  useEffect(() => {
    const fromSeller = searchParams.get('from');
    const sellerId = searchParams.get('seller');
    
    if (fromSeller === 'seller' || sellerId) {
      setForm(prev => ({ ...prev, userType: 'buyer' }));
    }
  }, [searchParams]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password strength
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl sm:text-2xl">L</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Livesalez</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Create your account</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input 
              name="name" 
              placeholder="Enter your full name"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input 
              name="email" 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                name="password" 
                type="password" 
                placeholder="Create a password"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                value={form.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm your password"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <label className="flex items-center p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="userType" 
                  value="seller" 
                  checked={form.userType === 'seller'} 
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Seller</div>
                  <div className="text-xs sm:text-sm text-gray-500">Sell your products</div>
                </div>
              </label>
              <label className="flex items-center p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="userType" 
                  value="buyer" 
                  checked={form.userType === 'buyer'} 
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Buyer</div>
                  <div className="text-xs sm:text-sm text-gray-500">Buy products</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input 
              name="phone" 
              type="tel" 
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea 
              name="address" 
              placeholder="Enter your complete address"
              rows="3"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-base"
              value={form.address} 
              onChange={handleChange} 
              required 
            />
          </div>

          {form.userType === 'seller' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <input 
                  name="companyName" 
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                  value={form.companyName} 
                  onChange={handleChange} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type (Optional)
                </label>
                <select 
                  name="businessType" 
                  className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                  value={form.businessType} 
                  onChange={handleChange} 
                >
                  <option value="">Select business type</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea 
              name="bio" 
              placeholder="Tell us about yourself..."
              rows="3"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-base"
              value={form.bio} 
              onChange={handleChange} 
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2025 MyTech Padu Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 
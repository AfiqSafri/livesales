"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'seller', // Fixed to seller only
    bio: '',
    phone: '',
    address: '',
    companyName: '',
    businessType: '',
    agreeToTerms: false,
    agreeToSubscription: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
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

    // Validate terms agreement
    if (!form.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    // Validate subscription agreement
    if (!form.agreeToSubscription) {
      setError('You must agree to the subscription terms to create a seller account');
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
      
      setSuccess('Registration successful! Your 3-month free trial has started. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl sm:text-2xl">L</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Livesalez</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Create your seller account</p>
          <p className="text-blue-600 text-xs mt-1">Start selling your products online</p>
        </div>

        {/* Trial Benefits Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">🎉 3-Month Free Trial</h3>
              <p className="text-sm text-green-700">Get full access to all seller features for 3 months, no credit card required!</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Register Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    name="name" 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                      value={form.confirmPassword} 
                      onChange={handleChange} 
                      required 
                    />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-base"
                    value={form.address} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input 
                    name="companyName" 
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea 
                    name="bio" 
                    placeholder="Tell us about your business..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-base"
                    value={form.bio} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription & Trial</h2>
              
              {/* Trial Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">✨ What&apos;s Included in Your Free Trial:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited product listings
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Advanced analytics & sales reports
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Order management system
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Discount & promotion tools
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Customer support
                  </li>
                </ul>
              </div>

              {/* Subscription Plans */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📋 After Trial - Choose Your Plan:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Basic Plan</span>
                    <span className="font-semibold text-gray-900">RM 29/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Premium Plan</span>
                    <span className="font-semibold text-gray-900">RM 59/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Enterprise Plan</span>
                    <span className="font-semibold text-gray-900">RM 99/month</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">* Prices shown are after trial period</p>
              </div>

              {/* Agreements */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={form.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 mt-1"
                    required
                  />
                  <div>
                    <label className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToSubscription"
                    checked={form.agreeToSubscription}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 mt-1"
                    required
                  />
                  <div>
                    <label className="text-sm text-gray-700">
                      I understand that after the 3-month free trial, I will be charged according to the selected subscription plan. I can cancel anytime.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mt-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mt-6">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
            >
              {loading ? 'Creating Seller Account...' : 'Start Free Trial - Create Account'}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Already have a seller account?{' '}
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
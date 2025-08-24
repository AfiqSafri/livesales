"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';

export default function RegisterPage() {
  const router = useRouter();
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
    agreeToTerms: false,
    agreeToSubscription: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setLoading(false);
        return;
      }
      
      setSuccess('🎉 Registration successful! Your 3-month free trial has started. Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Complete features for professional sellers',
      price: 20.00,
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Custom branding', 'Express shipping', 'API access'],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">L</span>
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Livesalez
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Create Your Seller Account
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Start selling your products online with our powerful platform
            </p>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Account Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input 
                        name="name" 
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input 
                          name="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                          value={form.password} 
                          onChange={handleChange} 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input 
                          name="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                          value={form.confirmPassword} 
                          onChange={handleChange} 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input 
                        name="phone" 
                        type="tel" 
                        placeholder="+60 12-345 6789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                        value={form.phone} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Business Type
                      </label>
                      <select 
                        name="businessType" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                        value={form.businessType} 
                        onChange={handleChange} 
                      >
                        <option value="">Select business type</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="services">Services</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address and Company */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea 
                      name="address" 
                      placeholder="Enter your complete address"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-base shadow-sm"
                      value={form.address} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input 
                      name="companyName" 
                      placeholder="Enter your company name (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base shadow-sm"
                      value={form.companyName} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea 
                      name="bio" 
                      placeholder="Tell us about your business..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-base shadow-sm"
                      value={form.bio} 
                      onChange={handleChange} 
                    />
                  </div>

                  {/* Agreements */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={form.agreeToTerms}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 mt-1 rounded focus:ring-blue-500"
                        required
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I agree to the{' '}
                          <a href="/terms" className="text-blue-600 hover:text-blue-700 underline font-medium">Terms of Service</a>
                          {' '}and{' '}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline font-medium">Privacy Policy</a>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="agreeToSubscription"
                        checked={form.agreeToSubscription}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 mt-1 rounded focus:ring-blue-500"
                        required
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I understand that after the 3-month free trial, I will be charged RM 20/month for the Pro Plan. I can cancel anytime.
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Error and Success Messages */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {success}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Creating Your Account...
                      </div>
                    ) : (
                      '🎉 Start Free Trial - Create Account'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Trial Benefits */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    What's Included in Your Free Trial
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      Unlimited product listings
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      Advanced analytics & sales reports
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      Order management system
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      Discount & promotion tools
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      Priority customer support
                    </li>
                  </ul>
                </div>

                {/* After Trial Plans */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    After Trial - Choose Your Plan
                  </h3>
                  <div className="space-y-4">
                    {currentPlans.map((plan) => (
                      <div key={plan.id} className={`p-4 rounded-xl border-2 ${
                        plan.popular 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        {plan.popular && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Most Popular
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">RM {plan.price}</div>
                            <div className="text-sm text-gray-500">/month</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">* Prices shown are after trial period</p>
                </div>

                {/* Login Link */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center">
                  <p className="text-gray-600 text-sm mb-3">
                    Already have a seller account?
                  </p>
                  <a 
                    href="/login" 
                    className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Sign in here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
} 
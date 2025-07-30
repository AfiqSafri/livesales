"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      // Redirect to original URL if available, otherwise to dashboard
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.userType === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/buyer/dashboard');
      }
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
          <p className="text-gray-600 text-sm sm:text-base">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input 
              name="password" 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
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
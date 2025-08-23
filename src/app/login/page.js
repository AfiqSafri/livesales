"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ModernFooter from '@/components/ModernFooter';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Redirect based on user type
        if (data.user.userType === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.userType === 'seller') {
          router.push('/seller/dashboard');
        } else {
          router.push('/buyer/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage('Password reset link has been sent to your email. Please check your inbox.');
        setForgotPasswordEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage('');
        }, 5000);
      } else {
        setForgotPasswordMessage(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setForgotPasswordMessage('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header with Logo */}
      <div className="flex justify-center pt-8 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Livesalez
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-lg text-gray-600 mb-2">
            Sign in to your account
          </p>
          <p className="text-center text-sm text-gray-500">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20">
            {!showForgotPassword ? (
              <>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors duration-200"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                          </svg>
                          Sign in
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 font-medium">Quick Login</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setFormData({ email: 'admin@livesalez.com', password: 'admin123' })}
                      className="w-full inline-flex justify-center items-center py-3 px-6 border border-gray-200 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="w-5 h-5 mr-3 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      Admin Login
                    </button>
                    <button
                      onClick={() => setFormData({ email: 'seller1@example.com', password: 'password123' })}
                      className="w-full inline-flex justify-center items-center py-3 px-6 border border-gray-200 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="w-5 h-5 mr-3 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      Seller Login
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Forgot Password Form */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h3>
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {forgotPasswordMessage && (
                  <div className={`px-4 py-3 rounded-lg shadow-sm flex items-center space-x-2 ${
                    forgotPasswordMessage.includes('sent') 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      forgotPasswordMessage.includes('sent') ? 'text-green-500' : 'text-red-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-sm font-medium">{forgotPasswordMessage}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                      </div>
                      <input
                        id="reset-email"
                        name="reset-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordMessage('');
                      }}
                      className="flex-1 py-3 px-6 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                    >
                      {forgotPasswordLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <ModernFooter />
      </div>
    </div>
  );
} 
"use client";
import { useState } from 'react';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testForgotPassword = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ModernHeader />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              🧪 Email Testing Page
            </h1>
            <p className="text-lg text-gray-600">
              Test your email configuration and forgot password functionality
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address to test"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={testEmail}
                disabled={loading || !email}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Testing...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-envelope mr-2"></i>
                    Test Email
                  </>
                )}
              </button>

              <button
                onClick={testForgotPassword}
                disabled={loading || !email}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Testing...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-key mr-2"></i>
                    Test Forgot Password
                  </>
                )}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-xl border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Success!' : '❌ Error'}
                </h3>
                <div className="text-sm space-y-1">
                  {result.message && <p><strong>Message:</strong> {result.message}</p>}
                  {result.error && <p><strong>Error:</strong> {result.error}</p>}
                  {result.details && (
                    <div>
                      <strong>Details:</strong>
                      <pre className="mt-2 p-2 bg-white/50 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">📧 Email Configuration Status</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email Service:</strong> Gmail SMTP</p>
                <p><strong>From Email:</strong> livesalez1@gmail.com</p>
                <p><strong>Status:</strong> Configured with App Password</p>
                <p><strong>Note:</strong> Check your email inbox (and spam folder) for test emails</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
}

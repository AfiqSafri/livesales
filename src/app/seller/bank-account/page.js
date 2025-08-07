"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BankAccountSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    bankCode: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          bankName: data.user.bankName || '',
          bankAccountNumber: data.user.bankAccountNumber || '',
          bankAccountHolder: data.user.bankAccountHolder || '',
          bankCode: data.user.bankCode || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/seller/update-bank-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Bank account information updated successfully!');
        router.push('/seller/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update bank account information');
      }
    } catch (error) {
      console.error('Error updating bank account:', error);
      alert('Error updating bank account information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bank Account Setup</h1>
              <p className="text-gray-600">Set up your bank account to receive payments from buyers</p>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900">Important Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Buyers will make payments directly to your bank account through Billplz. 
                    Please ensure your bank account information is accurate to receive payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Maybank, CIMB, Public Bank"
                />
              </div>

              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1234567890"
                />
              </div>

              <div>
                <label htmlFor="bankAccountHolder" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  id="bankAccountHolder"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Code (for Billplz) *
                </label>
                <select
                  id="bankCode"
                  name="bankCode"
                  value={formData.bankCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Bank Code</option>
                  <option value="MBBEMYKL">Maybank (MBBEMYKL)</option>
                  <option value="CIBBMYKL">CIMB Bank (CIBBMYKL)</option>
                  <option value="PBBEMYKL">Public Bank (PBBEMYKL)</option>
                  <option value="RHBEMYKL">RHB Bank (RHBEMYKL)</option>
                  <option value="HLBBMYKL">Hong Leong Bank (HLBBMYKL)</option>
                  <option value="UOVBMYKL">UOB Bank (UOVBMYKL)</option>
                  <option value="AMEXMYKL">AmBank (AMEXMYKL)</option>
                  <option value="BIMBMYKL">Bank Islam (BIMBMYKL)</option>
                  <option value="BKCHMYKL">Bank of China (BKCHMYKL)</option>
                  <option value="BMMBMYKL">Bank Muamalat (BMMBMYKL)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Bank Account Information'
                  )}
                </button>
              </div>
            </form>

            {/* Back Button */}
            <div className="mt-4">
              <button
                onClick={() => router.push('/seller/dashboard')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
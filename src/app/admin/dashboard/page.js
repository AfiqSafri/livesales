'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateSellerModal, setShowCreateSellerModal] = useState(false);
  const [newSellerData, setNewSellerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    businessType: 'individual'
  });

  useEffect(() => {
    // Check if user is admin (you should implement proper authentication)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || currentUser.userType !== 'admin') {
      router.push('/login');
      return;
    }
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/create-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSellerData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Seller account created successfully!');
        setShowCreateSellerModal(false);
        setNewSellerData({
          name: '',
          email: '',
          password: '',
          phone: '',
          companyName: '',
          businessType: 'individual'
        });
        fetchUsers(); // Refresh the user list
      } else {
        alert(data.error || 'Failed to create seller account');
      }
    } catch (error) {
      alert('Error creating seller account');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          status: currentStatus === 'active' ? 'inactive' : 'active' 
        })
      });

      if (response.ok) {
        alert('User status updated successfully!');
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleMakeLifetimeFree = async (userId) => {
    if (!confirm('Are you sure you want to make this seller lifetime free? This will override their current subscription.')) return;

    try {
      const response = await fetch('/api/admin/make-lifetime-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('Seller made lifetime free successfully!');
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to make seller lifetime free');
      }
    } catch (error) {
      alert('Error making seller lifetime free');
    }
  };

  const handleCancelLifetime = async (userId) => {
    if (!confirm('Are you sure you want to cancel this seller\'s lifetime free subscription? They will revert to free status.')) return;

    try {
      const response = await fetch('/api/admin/cancel-lifetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('Lifetime subscription cancelled successfully!');
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel lifetime subscription');
      }
    } catch (error) {
      alert('Error cancelling lifetime subscription');
    }
  };

  const getSubscriptionBadge = (user) => {
    if (user.userType !== 'seller') return null;
    
    // Check lifetime free first (highest priority)
    if (user.subscriptionTier === 'lifetime_free') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Lifetime Free
        </span>
      );
    }
    
    // Check other subscription statuses
    if (user.isSubscribed && user.subscriptionStatus === 'active' && user.subscriptionTier !== 'lifetime_free') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {user.subscriptionTier || 'Premium'}
        </span>
      );
    } else if (user.subscriptionStatus === 'inactive') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Free
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Trial
        </span>
      );
    }
  };

  const getSubscriptionDetails = (user) => {
    if (user.userType !== 'seller') return null;
    
    if (user.subscriptionTier === 'lifetime_free') {
      return (
        <div className="text-xs text-gray-500">
          <div>Plan: Lifetime Free</div>
          <div>Never expires</div>
        </div>
      );
    } else if (user.isSubscribed && user.subscriptionStatus === 'active') {
      return (
        <div className="text-xs text-gray-500">
          <div>Plan: {user.subscriptionTier || 'Premium'}</div>
          {user.subscriptionEndDate && (
            <div>Expires: {new Date(user.subscriptionEndDate).toLocaleDateString()}</div>
          )}
        </div>
      );
    } else if (user.subscriptionStatus === 'inactive') {
      return (
        <div className="text-xs text-gray-500">
          <div>Plan: Free</div>
          <div>No active subscription</div>
        </div>
      );
    } else {
      return (
        <div className="text-xs text-gray-500">
          <div>Plan: Trial</div>
          {user.trialEndDate && (
            <div>Trial ends: {new Date(user.trialEndDate).toLocaleDateString()}</div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and seller accounts</p>
            </div>
            <button
              onClick={() => setShowCreateSellerModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Create Seller Account</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sellers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'seller').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Buyers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'buyer').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium Sellers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'seller' && user.isSubscribed && user.subscriptionStatus === 'active' && user.subscriptionTier !== 'lifetime_free').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lifetime Free</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'seller' && user.subscriptionTier === 'lifetime_free').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Free Sellers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'seller' && (!user.isSubscribed || user.subscriptionStatus === 'inactive') && user.subscriptionTier !== 'lifetime_free').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trial Sellers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.userType === 'seller' && user.isTrialActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === 'admin' ? 'bg-red-100 text-red-800' :
                        user.userType === 'seller' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        {getSubscriptionBadge(user)}
                        {getSubscriptionDetails(user)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.status === 'active' 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.userType === 'seller' && user.subscriptionTier !== 'lifetime_free' && (
                          <button
                            onClick={() => handleMakeLifetimeFree(user.id)}
                            className="px-3 py-1 rounded text-xs bg-purple-100 text-purple-700 hover:bg-purple-200"
                          >
                            Make Lifetime Free
                          </button>
                        )}
                        {user.userType === 'seller' && user.subscriptionTier === 'lifetime_free' && (
                          <button
                            onClick={() => handleCancelLifetime(user.id)}
                            className="px-3 py-1 rounded text-xs bg-orange-100 text-orange-700 hover:bg-orange-200"
                          >
                            Cancel Lifetime
                          </button>
                        )}
                        {user.userType !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Seller Modal */}
      {showCreateSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Seller Account</h3>
            
            <form onSubmit={handleCreateSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newSellerData.name}
                  onChange={(e) => setNewSellerData({...newSellerData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newSellerData.email}
                  onChange={(e) => setNewSellerData({...newSellerData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newSellerData.password}
                  onChange={(e) => setNewSellerData({...newSellerData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newSellerData.phone}
                  onChange={(e) => setNewSellerData({...newSellerData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newSellerData.companyName}
                  onChange={(e) => setNewSellerData({...newSellerData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={newSellerData.businessType}
                  onChange={(e) => setNewSellerData({...newSellerData, businessType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Seller
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSellerModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
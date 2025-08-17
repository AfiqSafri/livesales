"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useSellerLanguage } from '../SellerLanguageContext';

export default function SalesReports() {
  const router = useRouter();
  const { language } = useSellerLanguage();
  
  const [user, setUser] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if (!u || u.userType !== 'seller') {
      router.push('/login');
      return;
    }
    setUser(u);
    fetchSalesData(u.id);
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSalesData(user.id);
    }
  }, [dateRange, selectedProduct, selectedStatus, user]);

  function fetchSalesData(sellerId) {
    setLoading(true);
    fetch('/api/seller/sales-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sellerId,
        dateRange,
        productId: selectedProduct,
        status: selectedStatus
      }),
    })
      .then(res => res.json())
      .then(data => {
        setSalesData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sales data:', err);
        setLoading(false);
      });
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'RM 0.00';
    }
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getDateRangeLabel() {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      case 'all': return 'All Time';
      default: return 'This Month';
    }
  }

  function calculateGrowthRate(current, previous) {
    if (current === null || current === undefined || isNaN(current)) current = 0;
    if (previous === null || previous === undefined || isNaN(previous)) previous = 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="p-1 sm:p-2 lg:p-6">
        {/* Header */}
        <div className="mb-1 sm:mb-2 lg:mb-4">
          <h1 className="text-base sm:text-lg lg:text-2xl font-bold mb-0.5 sm:mb-1 lg:mb-2 text-gray-900">Sales Reports</h1>
          <p className="text-xs text-gray-600">Detailed revenue analytics and business insights</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4 mb-1.5 sm:mb-2 lg:mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                {salesData.products && salesData.products.length > 0 ? salesData.products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                )) : null}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchSalesData(user.id)}
                className="w-full bg-blue-600 text-white px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-4 mb-1.5 sm:mb-2 lg:mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">{formatCurrency(salesData.totalRevenue || 0)}</p>
                <p className="text-xs text-green-600">
                  +{calculateGrowthRate(salesData.currentRevenue || 0, salesData.previousRevenue || 0)}% vs previous period
                </p>
              </div>
              <div className="p-1 sm:p-1.5 bg-green-100 rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Orders</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">{salesData.totalOrders || 0}</p>
                <p className="text-xs text-blue-600">
                  +{calculateGrowthRate(salesData.currentOrders || 0, salesData.previousOrders || 0)}% vs previous period
                </p>
              </div>
              <div className="p-1 sm:p-1.5 bg-blue-100 rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Avg Order Value</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">{formatCurrency(salesData.averageOrderValue || 0)}</p>
                <p className="text-xs text-purple-600">
                  {(salesData.averageOrderValue || 0) > (salesData.previousAverageOrderValue || 0) ? '+' : ''}
                  {calculateGrowthRate(salesData.averageOrderValue || 0, salesData.previousAverageOrderValue || 0)}% vs previous period
                </p>
              </div>
              <div className="p-1 sm:p-1.5 bg-purple-100 rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Conversion Rate</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">{(salesData.conversionRate || 0).toFixed(1)}%</p>
                <p className="text-xs text-orange-600">
                  {(salesData.conversionRate || 0) > (salesData.previousConversionRate || 0) ? '+' : ''}
                  {calculateGrowthRate(salesData.conversionRate || 0, salesData.previousConversionRate || 0)}% vs previous period
                </p>
              </div>
              <div className="p-1 sm:p-1.5 bg-orange-100 rounded-lg">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 lg:gap-4 mb-1.5 sm:mb-2 lg:mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Revenue Trend</h3>
            <div className="h-20 sm:h-24 lg:h-40 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-16 lg:h-16 mx-auto mb-1 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p className="text-xs sm:text-sm">Revenue chart will be displayed here</p>
                <p className="text-xs text-gray-400">Chart integration coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Top Performing Products</h3>
            <div className="space-y-1 sm:space-y-2">
              {salesData.topProducts && salesData.topProducts.length > 0 ? salesData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 w-3 sm:w-4 lg:w-5">{index + 1}</span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-gray-500">{product.percentage}% of total</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-2 sm:py-3 lg:py-6">
                  <p className="text-xs sm:text-sm">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-4 mb-1.5 sm:mb-2 lg:mb-4">
          {/* Order Status Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Order Status</h3>
            <div className="space-y-1 sm:space-y-2">
              {salesData.orderStatus && salesData.orderStatus.length > 0 ? salesData.orderStatus.map(status => (
                <div key={status.status} className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                      status.status === 'delivered' ? 'bg-green-500' :
                      status.status === 'pending' ? 'bg-yellow-500' :
                      status.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{status.count}</p>
                    <p className="text-xs text-gray-500">{status.percentage}%</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-2 sm:py-3 lg:py-4">
                  <p className="text-xs sm:text-sm">No order status data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Month */}
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Revenue by Month</h3>
            <div className="space-y-1 sm:space-y-2">
              {salesData.monthlyRevenue && salesData.monthlyRevenue.length > 0 ? salesData.monthlyRevenue.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{month.month}</span>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</p>
                    <p className="text-xs text-gray-500">{month.orders} orders</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-2 sm:py-3 lg:py-4">
                  <p className="text-xs sm:text-sm">No monthly revenue data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4">
            <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Customer Insights</h3>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">New Customers</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{salesData.newCustomers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Repeat Customers</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{salesData.repeatCustomers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Customer LTV</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{formatCurrency(salesData.customerLifetimeValue || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-1 sm:p-1.5 lg:p-2 bg-gray-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Retention Rate</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{(salesData.retentionRate || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 lg:p-4 mb-1.5 sm:mb-2 lg:mb-4">
          <h3 className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-1 sm:px-2 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.recentTransactions && salesData.recentTransactions.length > 0 ? salesData.recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap text-xs font-medium text-gray-900">#{transaction.id}</td>
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap text-xs text-gray-900">{transaction.productName}</td>
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap text-xs text-gray-900">{transaction.customerName}</td>
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap text-xs font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap">
                      <span className={`px-1 py-0.5 sm:px-1.5 sm:py-0.5 text-xs font-medium rounded-full ${
                        transaction.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-1 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(transaction.date)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 lg:py-6 text-center text-gray-500">
                      <p className="text-xs sm:text-sm">No recent transactions available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-1.5 sm:mt-2 lg:mt-4 flex flex-col sm:flex-row justify-end gap-1 sm:gap-1.5 lg:gap-3">
          <button className="w-full sm:w-auto bg-green-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs rounded-lg font-medium hover:bg-green-700 transition-colors">
            Export to Excel
          </button>
          <button className="w-full sm:w-auto bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Generate PDF Report
          </button>
        </div>
      </div>
    </div>
  );
} 
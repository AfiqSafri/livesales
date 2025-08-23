"use client";
import { useState, useEffect } from 'react';

export default function TestMultiProducts() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const results = [];
    
    try {
      // Test 1: Check if products API works
      console.log('🧪 Test 1: Testing products API...');
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (response.ok && data.products) {
        results.push({
          test: 'Products API',
          status: '✅ PASS',
          details: `Found ${data.products.length} products: ${data.products.map(p => p.id).join(', ')}`
        });
      } else {
        results.push({
          test: 'Products API',
          status: '❌ FAIL',
          details: `Response: ${response.status} - ${JSON.stringify(data)}`
        });
      }
      
      // Test 2: Check specific products by IDs
      console.log('🧪 Test 2: Testing specific products API...');
      const specificResponse = await fetch('/api/products?ids=15,14');
      const specificData = await specificResponse.json();
      
      if (specificResponse.ok && specificData.products) {
        results.push({
          test: 'Specific Products API',
          status: '✅ PASS',
          details: `Found ${specificData.products.length} products: ${specificData.products.map(p => `${p.id}(${p.name})`).join(', ')}`
        });
      } else {
        results.push({
          test: 'Specific Products API',
          status: '❌ FAIL',
          details: `Response: ${specificResponse.status} - ${JSON.stringify(specificData)}`
        });
      }
      
      // Test 3: Check if products have required fields
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const requiredFields = ['id', 'name', 'price', 'seller'];
        const missingFields = requiredFields.filter(field => !product[field]);
        
        if (missingFields.length === 0) {
          results.push({
            test: 'Product Structure',
            status: '✅ PASS',
            details: 'All required fields present'
          });
        } else {
          results.push({
            test: 'Product Structure',
            status: '❌ FAIL',
            details: `Missing fields: ${missingFields.join(', ')}`
          });
        }
      }
      
    } catch (error) {
      results.push({
        test: 'API Tests',
        status: '❌ ERROR',
        details: error.message
      });
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Multi-Products Test Page</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Results:</h2>
            {testResults.map((result, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <span className={result.status.includes('PASS') ? 'text-green-600' : 'text-red-600'}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{result.details}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Testing</h3>
          <p className="text-gray-600 mb-4">
            You can also test the multi-products page manually by navigating to:
          </p>
          <div className="space-y-2">
            <a 
              href="/multi-products/15,14" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              /multi-products/15,14
            </a>
            <a 
              href="/multi-products/15" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              /multi-products/15
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



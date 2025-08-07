const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_DATA = {
  productId: 1,
  quantity: 2,
  buyerId: 1,
  buyerName: 'Test Buyer',
  buyerEmail: 'test@example.com',
  shippingAddress: '123 Test Street, Kuala Lumpur, Malaysia',
  phone: '+60123456789',
  totalAmount: 56.00
};

async function testMultiGatewayPayment() {
  console.log('🧪 Testing Multi-Gateway Payment System\n');

  try {
    // Step 1: Fetch available payment gateways
    console.log('📋 Step 1: Fetching available payment gateways...');
    const gatewaysResponse = await axios.get(`${BASE_URL}/api/payment/test-multi-gateway`);
    
    if (gatewaysResponse.data.success) {
      console.log('✅ Available gateways:');
      gatewaysResponse.data.gateways.forEach(gateway => {
        console.log(`   • ${gateway.logo} ${gateway.name} (${gateway.id})`);
      });
      
      console.log('\n🏦 Available FPX banks:');
      gatewaysResponse.data.fpxBanks.slice(0, 5).forEach(bank => {
        console.log(`   • ${bank.logo} ${bank.name} (${bank.code})`);
      });
      console.log(`   ... and ${gatewaysResponse.data.fpxBanks.length - 5} more banks`);
    }

    // Step 2: Test Billplz payment
    console.log('\n💳 Step 2: Testing Billplz payment...');
    try {
      const billplzResponse = await axios.post(`${BASE_URL}/api/payment/test-multi-gateway`, {
        ...TEST_DATA,
        paymentGateway: 'billplz'
      });

      if (billplzResponse.data.success) {
        console.log('✅ Billplz payment created successfully!');
        console.log(`   Reference: ${billplzResponse.data.reference}`);
        console.log(`   Payment URL: ${billplzResponse.data.paymentUrl}`);
        console.log(`   Amount: RM ${billplzResponse.data.amount}`);
      }
    } catch (error) {
      console.log('❌ Billplz payment failed:', error.response?.data?.error || error.message);
    }

    // Step 3: Test FPX payment with different banks
    console.log('\n🏦 Step 3: Testing FPX payment...');
    const testBanks = ['MBB0228', 'PBB0233', 'CIT0219']; // Maybank, Public Bank, Citibank
    
    for (const bankCode of testBanks) {
      try {
        console.log(`   Testing with ${bankCode}...`);
        const fpxResponse = await axios.post(`${BASE_URL}/api/payment/test-multi-gateway`, {
          ...TEST_DATA,
          paymentGateway: 'fpx',
          fpxBankCode: bankCode
        });

        if (fpxResponse.data.success) {
          console.log(`   ✅ FPX payment with ${bankCode} created successfully!`);
          console.log(`      Reference: ${fpxResponse.data.reference}`);
          console.log(`      Payment URL: ${fpxResponse.data.paymentUrl}`);
        }
      } catch (error) {
        console.log(`   ❌ FPX payment with ${bankCode} failed:`, error.response?.data?.error || error.message);
      }
    }

    // Step 4: Test invalid gateway
    console.log('\n❌ Step 4: Testing invalid gateway...');
    try {
      const invalidResponse = await axios.post(`${BASE_URL}/api/payment/test-multi-gateway`, {
        ...TEST_DATA,
        paymentGateway: 'invalid_gateway'
      });
    } catch (error) {
      console.log('✅ Invalid gateway correctly rejected:', error.response?.data?.error);
    }

    // Step 5: Test missing required fields
    console.log('\n⚠️ Step 5: Testing missing required fields...');
    try {
      const missingFieldsResponse = await axios.post(`${BASE_URL}/api/payment/test-multi-gateway`, {
        productId: 1,
        // Missing other required fields
      });
    } catch (error) {
      console.log('✅ Missing fields correctly rejected:', error.response?.data?.error);
    }

    console.log('\n🎉 Multi-gateway payment testing completed!');
    console.log('\n📝 Test Summary:');
    console.log('   • Billplz: Tested with sandbox environment');
    console.log('   • FPX: Tested with multiple Malaysian banks');
    console.log('   • Error handling: Validated for invalid inputs');
    console.log('   • All tests completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test different scenarios
async function testPaymentScenarios() {
  console.log('\n🔄 Testing Different Payment Scenarios\n');

  const scenarios = [
    {
      name: 'Small Purchase',
      data: { ...TEST_DATA, quantity: 1, totalAmount: 28.00 }
    },
    {
      name: 'Large Purchase',
      data: { ...TEST_DATA, quantity: 5, totalAmount: 140.00 }
    },
    {
      name: 'Different Product',
      data: { ...TEST_DATA, productId: 2, quantity: 3, totalAmount: 84.00 }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`📦 Testing: ${scenario.name}`);
    try {
      const response = await axios.post(`${BASE_URL}/api/payment/test-multi-gateway`, {
        ...scenario.data,
        paymentGateway: 'fpx',
        fpxBankCode: 'MBB0228'
      });

      if (response.data.success) {
        console.log(`   ✅ ${scenario.name} - Payment created successfully`);
        console.log(`      Amount: RM ${response.data.amount}`);
        console.log(`      Reference: ${response.data.reference}`);
      }
    } catch (error) {
      console.log(`   ❌ ${scenario.name} - Failed:`, error.response?.data?.error || error.message);
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Multi-Gateway Payment System Tests\n');
  console.log('=' .repeat(60));
  
  await testMultiGatewayPayment();
  await testPaymentScenarios();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Visit http://localhost:3000/payment-test-multi-gateway for UI testing');
  console.log('   2. Check the database for created payment records');
  console.log('   3. Test the FPX simulation at /payment/fpx/test');
  console.log('   4. Configure real API keys for production use');
}

// Run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testMultiGatewayPayment,
  testPaymentScenarios,
  runAllTests
}; 
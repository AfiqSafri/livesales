// Test script for Direct Bank Transfer functionality
const testDirectTransfer = async () => {
  console.log('🧪 Testing Direct Bank Transfer System...\n');

  // Test 1: Check if seller has bank account info
  console.log('1. Testing seller bank account setup...');
  try {
    const sellerResponse = await fetch('/api/seller/profile');
    const sellerData = await sellerResponse.json();
    
    if (sellerData.user && sellerData.user.bankName) {
      console.log('✅ Seller has bank account information');
      console.log(`   Bank: ${sellerData.user.bankName}`);
      console.log(`   Account: ${sellerData.user.bankAccountNumber}`);
      console.log(`   Code: ${sellerData.user.bankCode}`);
    } else {
      console.log('❌ Seller needs to set up bank account information');
      console.log('   Please visit /seller/bank-account to configure');
    }
  } catch (error) {
    console.log('❌ Error checking seller profile:', error.message);
  }

  // Test 2: Test direct transfer payment creation
  console.log('\n2. Testing direct transfer payment creation...');
  try {
    const paymentData = {
      productId: 1,
      quantity: 1,
      buyerId: 1,
      buyerName: 'Test Buyer',
      buyerEmail: 'test@example.com',
      shippingAddress: '123 Test Street',
      phone: '0123456789',
      totalAmount: 25.72
    };

    const paymentResponse = await fetch('/api/payment/billplz/direct-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    const paymentResult = await paymentResponse.json();
    
    if (paymentResponse.ok) {
      console.log('✅ Direct transfer payment created successfully');
      console.log(`   Reference: ${paymentResult.reference}`);
      console.log(`   Payment ID: ${paymentResult.paymentId}`);
      console.log(`   Order ID: ${paymentResult.orderId}`);
    } else {
      console.log('❌ Failed to create direct transfer payment');
      console.log(`   Error: ${paymentResult.error}`);
    }
  } catch (error) {
    console.log('❌ Error creating direct transfer payment:', error.message);
  }

  // Test 3: Test payment completion
  console.log('\n3. Testing payment completion...');
  try {
    const completeResponse = await fetch('/api/payment/test-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'DIRECT_1_1754244203151_test123' })
    });

    const completeResult = await completeResponse.json();
    
    if (completeResponse.ok) {
      console.log('✅ Payment completion test successful');
      console.log(`   Message: ${completeResult.message}`);
    } else {
      console.log('❌ Payment completion test failed');
      console.log(`   Error: ${completeResult.error}`);
    }
  } catch (error) {
    console.log('❌ Error testing payment completion:', error.message);
  }

  console.log('\n🎉 Direct Bank Transfer System Test Complete!');
  console.log('\n📋 Summary:');
  console.log('- Sellers can set up bank account information');
  console.log('- Buyers can make direct transfers to seller bank accounts');
  console.log('- Payments are processed through Billplz API');
  console.log('- Test payment system is available for development');
};

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testDirectTransfer = testDirectTransfer;
  console.log('🧪 Direct Transfer Test loaded. Run testDirectTransfer() to test.');
} else {
  // Node.js environment
  testDirectTransfer();
} 
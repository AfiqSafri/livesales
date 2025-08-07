// Test script for complete payment flow
const testPaymentFlow = async () => {
  console.log('🧪 Testing Complete Payment Flow...\n');

  try {
    // Step 1: Create a test payment
    console.log('1️⃣ Creating test payment...');
    const paymentData = {
      productId: 1,
      quantity: 1,
      sellerId: 1,
      productName: 'Test Product',
      unitPrice: 20.00,
      totalAmount: 25.72,
      buyerEmail: 'test@example.com',
      buyerName: 'Test Buyer',
      shippingAddress: '123 Test Street',
      phone: '0123456789'
    };

    const createResponse = await fetch('/api/payment/buy-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ Failed to create payment:', error);
      return;
    }

    const createResult = await createResponse.json();
    console.log('✅ Payment created:', createResult);
    const reference = createResult.reference;

    // Step 2: Complete the payment
    console.log('\n2️⃣ Completing payment...');
    const completeResponse = await fetch('/api/payment/test-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference })
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      console.log('❌ Failed to complete payment:', error);
      return;
    }

    const completeResult = await completeResponse.json();
    console.log('✅ Payment completed:', completeResult);

    // Step 3: Check the results
    console.log('\n3️⃣ Checking results...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit

    const debugResponse = await fetch('/api/payment/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check_payments' })
    });

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('📊 Recent payments:', debugData.payments);
    }

    console.log('\n🎉 Payment flow test completed!');
    console.log('\n📋 Expected Results:');
    console.log('- Payment status should be "completed"');
    console.log('- Order status should be "paid"');
    console.log('- Product stock should be decremented');
    console.log('- Email notifications should be logged');
    console.log('- Database notifications should be created');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run test if in browser
if (typeof window !== 'undefined') {
  window.testPaymentFlow = testPaymentFlow;
  console.log('🧪 Payment flow test loaded. Run testPaymentFlow() to test.');
} else {
  console.log('🔧 Payment flow test script loaded.');
} 
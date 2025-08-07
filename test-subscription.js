// Test subscription system
async function testSubscription() {
  console.log('🧪 Testing subscription system...');
  
  try {
    // Test 1: Fetch current subscription
    console.log('\n📋 Test 1: Fetching current subscription...');
    const subscriptionResponse = await fetch('/api/seller/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 })
    });
    
    if (subscriptionResponse.ok) {
      const subscriptionData = await subscriptionResponse.json();
      console.log('✅ Current subscription:', subscriptionData.subscription);
    } else {
      console.log('❌ Failed to fetch subscription');
    }
    
    // Test 2: Create subscription payment
    console.log('\n💳 Test 2: Creating subscription payment...');
    const paymentResponse = await fetch('/api/seller/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        action: 'create_payment',
        plan: 'basic'
      })
    });
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ Payment created:', paymentData.payment);
      console.log('🔗 Billplz URL:', paymentData.payment.billplzUrl);
    } else {
      const errorData = await paymentResponse.json();
      console.log('❌ Failed to create payment:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run test if in browser environment
if (typeof window !== 'undefined') {
  window.testSubscription = testSubscription;
  console.log('🧪 Test function available as window.testSubscription()');
} else {
  console.log('🧪 Test script loaded');
} 
// Test Billplz Production Credentials
const BILLPLZ_API_KEY = "73eb57f0-7d4e-42b9-a544-aeac6e4b0f81";
const BILLPLZ_COLLECTION_ID = "inbmmepb";
const BILLPLZ_API_BASE_URL = "https://www.billplz.com/api/v3";

async function testBillplzCredentials() {
  console.log('🧪 Testing Billplz Production Credentials...');
  console.log('🔑 API Key:', BILLPLZ_API_KEY);
  console.log('🏦 Collection ID:', BILLPLZ_COLLECTION_ID);
  console.log('🌐 API URL:', BILLPLZ_API_BASE_URL);
  
  // Test 1: Check collection details
  console.log('\n📋 Test 1: Checking collection details...');
  try {
    const authHeader = `Basic ${Buffer.from(BILLPLZ_API_KEY + ':').toString('base64')}`;
    console.log('🔐 Auth header:', authHeader);
    
    const response = await fetch(`${BILLPLZ_API_BASE_URL}/collections/${BILLPLZ_COLLECTION_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Collection found:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Collection error:', errorData);
    }
  } catch (error) {
    console.log('❌ Collection test failed:', error.message);
  }
  
  // Test 2: Try to create a minimal bill
  console.log('\n📋 Test 2: Creating minimal bill...');
  try {
    const authHeader = `Basic ${Buffer.from(BILLPLZ_API_KEY + ':').toString('base64')}`;
    
    const billData = {
      collection_id: BILLPLZ_COLLECTION_ID,
      description: 'Test bill for credential verification',
      email: 'test@example.com',
      name: 'Test User',
      amount: 100, // RM 1.00
      callback_url: 'https://livesales.vercel.app/api/payment/callback',
      redirect_url: 'https://livesales.vercel.app/payment/success'
    };
    
    const response = await fetch(`${BILLPLZ_API_BASE_URL}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billData)
    });
    
    console.log('📡 Bill creation status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bill created successfully:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Bill creation error:', errorData);
    }
  } catch (error) {
    console.log('❌ Bill creation test failed:', error.message);
  }
}

// Run the test
testBillplzCredentials().catch(console.error);



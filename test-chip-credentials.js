// Test CHIP Collect Sandbox Credentials
const CHIP_API_KEY = "zNfpfOUDGNDQZ-eLBcbzLDESdf6YMiun1HONM5iWXq96COvLuSylpd3J61re3o4m0gg-tu3hd3iVvJqS2d9w3Q==";
const CHIP_BRAND_ID = "f648bdd6-f5ed-404b-adf0-4bc3391036d4";
const CHIP_API_BASE_URL = "https://gate.chip-in.asia/api/v1";

async function testChipCredentials() {
     console.log('🧪 Testing CHIP Collect Sandbox Credentials...');
   console.log('🔑 API Key:', CHIP_API_KEY);
   console.log('🏦 Brand ID:', CHIP_BRAND_ID);
   console.log('🌐 API URL:', CHIP_API_BASE_URL);
  
     // Test 1: Check brand details
   console.log('\n📋 Test 1: Checking brand details...');
   try {
     const authHeader = `Bearer ${CHIP_API_KEY}`;
     console.log('🔐 Auth header:', authHeader);
     
     const response = await fetch(`${CHIP_API_BASE_URL}/brands/${CHIP_BRAND_ID}`, {
       method: 'GET',
       headers: {
         'Authorization': authHeader,
         'Content-Type': 'application/json'
       }
     });
     
     console.log('📡 Response status:', response.status);
     
     if (response.ok) {
       const data = await response.json();
       console.log('✅ Brand found:', data);
     } else {
       const errorData = await response.text();
       console.log('❌ Brand error:', errorData);
     }
   } catch (error) {
     console.log('❌ Brand test failed:', error.message);
   }
  
  // Test 2: Try to create a minimal payment
  console.log('\n📋 Test 2: Creating minimal payment...');
  try {
    const authHeader = `Bearer ${CHIP_API_KEY}`;
    
         const paymentData = {
       brand_id: CHIP_BRAND_ID,
       client: {
         id: CHIP_BRAND_ID,
         name: "LiveSales Platform",
         email: "admin@livesales.com"
       },
       purchase: {
         description: 'Test payment for credential verification',
         email: 'test@example.com',
         name: 'Test User',
         amount: 100, // RM 1.00
         callback_url: 'https://livesales.vercel.app/api/payment/callback',
         redirect_url: 'https://livesales.az/payment/success',
         products: [
           {
             name: 'Test Product',
             quantity: 1,
             price: 100
           }
         ]
       }
     };
    
         const response = await fetch(`${CHIP_API_BASE_URL}/purchases/`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    console.log('📡 Payment creation status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment created successfully:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Payment creation error:', errorData);
    }
  } catch (error) {
    console.log('❌ Payment creation test failed:', error.message);
  }
}

// Run the test
testChipCredentials().catch(console.error);

// Test database connection
const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const response = await fetch('http://localhost:3000/api/database/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database health check passed');
      console.log('   Status:', data.status);
      console.log('   Database:', data.database);
      console.log('   Response time:', data.responseTime);
      console.log('   Environment:', data.environment);
    } else {
      console.log('❌ Database health check failed');
      console.log('   Status:', data.status);
      console.log('   Error:', data.error);
      if (data.suggestions) {
        console.log('   Suggestions:');
        data.suggestions.forEach(suggestion => console.log('   -', suggestion));
      }
    }
    
    console.log('\n2️⃣ Testing direct database operations...');
    
    // Test 2: Direct database operations
    const testResponse = await fetch('http://localhost:3000/api/payment/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 1 })
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Direct database operations working');
      console.log('   Order found:', testData.debugInfo.order ? 'Yes' : 'No');
    } else {
      console.log('❌ Direct database operations failed');
      const errorData = await testResponse.json();
      console.log('   Error:', errorData.error);
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
  
  console.log('\n3️⃣ Environment check...');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');
  
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const host = url.match(/@([^:]+):/)?.[1] || 'unknown';
    const port = url.match(/:(\d+)\//)?.[1] || 'unknown';
    console.log('   Host:', host);
    console.log('   Port:', port);
  }
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Check if your database server is running');
  console.log('   2. Verify your DATABASE_URL environment variable');
  console.log('   3. Check network connectivity to the database');
  console.log('   4. Restart your application if needed');
};

// Run the test
testDatabaseConnection().catch(console.error);






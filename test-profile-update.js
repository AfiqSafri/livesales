// Test script for profile update functionality
const testProfileUpdate = async () => {
  console.log('🧪 Testing Profile Update Functionality...\n');

  try {
    // Test 1: Update with valid data
    console.log('1️⃣ Testing valid profile update...');
    const formData = new FormData();
    formData.append('id', '1');
    formData.append('name', 'Updated Test User');
    formData.append('email', 'updated@example.com');
    formData.append('phone', '0123456789');
    formData.append('bio', 'Updated bio');

    const response = await fetch('/api/seller/update-profile', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);
    } else {
      const error = await response.json();
      console.log('❌ Profile update failed:', error);
    }

    // Test 2: Try to update with duplicate email
    console.log('\n2️⃣ Testing duplicate email...');
    const formData2 = new FormData();
    formData2.append('id', '2'); // Different user
    formData2.append('name', 'Another User');
    formData2.append('email', 'updated@example.com'); // Same email as above

    const response2 = await fetch('/api/seller/update-profile', {
      method: 'POST',
      body: formData2
    });

    if (!response2.ok) {
      const error = await response2.json();
      console.log('✅ Correctly rejected duplicate email:', error);
    } else {
      console.log('❌ Should have rejected duplicate email');
    }

    // Test 3: Update with invalid email
    console.log('\n3️⃣ Testing invalid email...');
    const formData3 = new FormData();
    formData3.append('id', '1');
    formData3.append('name', 'Test User');
    formData3.append('email', 'invalid-email');

    const response3 = await fetch('/api/seller/update-profile', {
      method: 'POST',
      body: formData3
    });

    if (!response3.ok) {
      const error = await response3.json();
      console.log('✅ Correctly rejected invalid email:', error);
    } else {
      console.log('❌ Should have rejected invalid email');
    }

    console.log('\n🎉 Profile update tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run test if in browser
if (typeof window !== 'undefined') {
  window.testProfileUpdate = testProfileUpdate;
  console.log('🧪 Profile update test loaded. Run testProfileUpdate() to test.');
} else {
  console.log('🔧 Profile update test script loaded.');
} 
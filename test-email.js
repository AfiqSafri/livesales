// Test script for email functionality
const testEmail = async () => {
  console.log('🧪 Testing Email Functionality...\n');

  try {
    // Test 1: Test email sending
    console.log('1️⃣ Testing email sending...');
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email from Livesalez',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745;">Test Email</h2>
          <p>This is a test email from the Livesalez system.</p>
          <p>If you receive this, the email functionality is working correctly!</p>
        </div>
      `,
      text: 'This is a test email from the Livesalez system.'
    };

    const response = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email test successful:', result);
    } else {
      const error = await response.json();
      console.log('❌ Email test failed:', error);
    }

    console.log('\n🎉 Email functionality test completed!');
    console.log('\n📋 Next Steps:');
    console.log('- Try making a payment to see real emails sent');
    console.log('- Check your email inbox for notifications');
    console.log('- Verify email templates are working correctly');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run test if in browser
if (typeof window !== 'undefined') {
  window.testEmail = testEmail;
  console.log('🧪 Email test loaded. Run testEmail() to test.');
} else {
  console.log('🔧 Email test script loaded.');
} 
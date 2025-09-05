// Test email functionality
require('dotenv').config();

async function testEmail() {
  try {
    // Import the email utility using dynamic import for ES6 modules
    const { sendEmail } = await import('./src/utils/email.js');
    
    console.log('📧 Testing email functionality...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
    
    const result = await sendEmail({
      to: 'livesalez1@gmail.com',
      subject: 'Test Email - Payment System',
      html: `
        <h2>🧪 Email Test</h2>
        <p>This is a test email to verify that the email system is working correctly.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Time: ${new Date().toLocaleString()}</li>
          <li>System: Livesalez Payment System</li>
          <li>Purpose: Verify email notifications</li>
        </ul>
        <p>If you receive this email, the system is working correctly!</p>
      `,
      text: 'This is a test email to verify that the email system is working correctly.'
    });
    
    console.log('📧 Email result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testEmail();
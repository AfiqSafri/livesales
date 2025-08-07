import { sendEmail, emailTemplates } from '../../../utils/email.js';

export async function POST(req) {
  try {
    const { to } = await req.json();
    
    console.log('🧪 Testing email sending to:', to);
    console.log('📧 Email credentials check:', {
      hasUser: !!process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS,
      emailUser: process.env.EMAIL_USER
    });

    const testEmail = emailTemplates.subscriptionActivated({
      sellerName: 'Test Seller',
      planName: 'Test Plan',
      planPrice: 29.90,
      subscriptionEndDate: new Date().toLocaleDateString(),
      features: ['Test Feature 1', 'Test Feature 2', 'Test Feature 3']
    });

    const result = await sendEmail({
      to: to || 'livesalez1@gmail.com',
      subject: testEmail.subject,
      html: testEmail.html,
      text: testEmail.text
    });

    console.log('📧 Test email result:', result);

    return new Response(JSON.stringify({
      success: true,
      message: 'Test email sent successfully',
      result: result
    }), { status: 200 });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: {
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER
      }
    }), { status: 500 });
  }
} 
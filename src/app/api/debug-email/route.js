import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get('email') || 'test@example.com';
    
    console.log('🔍 Email Debug Check Starting...');
    
    // Check environment variables
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS;
    
    console.log('📧 Environment Variables Check:');
    console.log('EMAIL_SERVER_USER:', emailUser ? '✅ Set' : '❌ Not Set');
    console.log('EMAIL_SERVER_PASSWORD:', emailPass ? '✅ Set' : '❌ Not Set');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
    
    if (!emailUser || !emailPass) {
      return NextResponse.json({
        success: false,
        error: 'Email credentials not configured',
        message: 'Email environment variables are missing',
        required: {
          EMAIL_SERVER_USER: 'Your Gmail address',
          EMAIL_SERVER_PASSWORD: 'Your Gmail app password'
        },
        current: {
          EMAIL_SERVER_USER: emailUser ? 'Set' : 'Missing',
          EMAIL_SERVER_PASSWORD: emailPass ? 'Set' : 'Missing',
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
        }
      }, { status: 400 });
    }
    
    // Try to send a test email
    console.log('📧 Attempting to send test email to:', testEmail);
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Livesalez Production',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">✅ Email Test Successful!</h2>
          <p>This is a test email from your Livesalez production environment.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> Production</p>
          <p>If you received this email, your email configuration is working correctly!</p>
        </div>
      `,
      text: `Email Test Successful! This is a test email from Livesalez production environment. Timestamp: ${new Date().toISOString()}`
    });
    
    console.log('📧 Email send result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Email test completed',
      result: result,
      environment: {
        EMAIL_SERVER_USER: emailUser ? 'Set' : 'Missing',
        EMAIL_SERVER_PASSWORD: emailPass ? 'Set' : 'Missing',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
      }
    });
    
  } catch (error) {
    console.error('❌ Email debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

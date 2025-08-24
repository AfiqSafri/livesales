import { NextResponse } from 'next/server';
import { sendEmail } from '../../utils/email.js';

export async function POST(request) {
  try {
    const { to = 'test@example.com' } = await request.json();
    
    // Check environment variables
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS;
    
    console.log('🔍 Email Configuration Check:');
    console.log('📧 EMAIL_SERVER_USER:', emailUser ? '✅ Set' : '❌ Not Set');
    console.log('📧 EMAIL_SERVER_PASSWORD:', emailPass ? '✅ Set' : '❌ Not Set');
    console.log('📧 Alternative EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set');
    console.log('📧 Alternative EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
    
    if (!emailUser || !emailPass) {
      return NextResponse.json({
        success: false,
        error: 'Email credentials not configured',
        message: 'Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in your environment variables',
        required: {
          EMAIL_SERVER_USER: 'Your Gmail address',
          EMAIL_SERVER_PASSWORD: 'Your Gmail app password'
        },
        instructions: [
          '1. Go to your Gmail account settings',
          '2. Enable 2-factor authentication',
          '3. Generate an app password',
          '4. Add these to your .env file:',
          '   EMAIL_SERVER_USER=your-email@gmail.com',
          '   EMAIL_SERVER_PASSWORD=your-app-password'
        ]
      }, { status: 400 });
    }
    
    const testEmail = {
      to,
      subject: '🧪 Test Email from Livesalez',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🧪 Test Email</h1>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is a test email from your Livesalez application to verify that email functionality is working correctly.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #495057; margin: 0; font-size: 14px;">
                <strong>✅ Success!</strong> If you received this email, your email configuration is working properly.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Test Details:</strong>
            </p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Sent from: ${emailUser}</li>
              <li>Sent to: ${to}</li>
              <li>Timestamp: ${new Date().toLocaleString()}</li>
              <li>Service: Gmail SMTP</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
            <p>Best regards,<br><strong>Livesalez Team</strong></p>
          </div>
        </div>
      `,
      text: `
Test Email from Livesalez

Hello! 👋

This is a test email from your Livesalez application to verify that email functionality is working correctly.

✅ Success! If you received this email, your email configuration is working properly.

Test Details:
- Sent from: ${emailUser}
- Sent to: ${to}
- Timestamp: ${new Date().toLocaleString()}
- Service: Gmail SMTP

Best regards,
Livesalez Team
      `
    };

    const result = await sendEmail(testEmail);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        details: {
          from: emailUser,
          to,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: result
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
} 
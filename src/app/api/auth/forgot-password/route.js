import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendEmail } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      }
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://livesales.vercel.app'}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      const emailContent = {
        to: user.email,
        subject: 'Password Reset Request - Livesalez',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
            </div>
            
            <div style="background-color: #ffffff; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your Livesalez account. 
                If you made this request, click the button below to reset your password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🔑 Reset My Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                <strong>Important:</strong> This link will expire in <span style="color: #e74c3c; font-weight: bold;">1 hour</span> for security reasons.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #495057; margin: 0; font-size: 14px;">
                  <strong>🔒 Security Notice:</strong> If you didn't request this password reset, 
                  please ignore this email. Your account remains secure.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all;">
                <a href="${resetUrl}" style="color: #667eea; text-decoration: none; font-family: monospace; font-size: 12px;">
                  ${resetUrl}
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
              <p>Best regards,<br><strong>Livesalez Team</strong></p>
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">
                  Visit Livesalez
                </a>
              </p>
            </div>
          </div>
        `,
        text: `
Password Reset Request - Livesalez

Hello ${user.name || 'there'}!

We received a request to reset your password for your Livesalez account. 
If you made this request, use the link below to reset your password:

${resetUrl}

Important: This link will expire in 1 hour for security reasons.

Security Notice: If you didn't request this password reset, please ignore this email. 
Your account remains secure.

Best regards,
Livesalez Team

Visit Livesalez: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        `
      };

      const emailResult = await sendEmail(emailContent);
      
      if (emailResult.success) {
        console.log('✅ Password reset email sent successfully to:', user.email);
        console.log('📧 Reset URL:', resetUrl);
      } else {
        console.error('❌ Failed to send password reset email to:', user.email);
        console.error('📧 Email result:', emailResult);
        
        // If email fails, still return success but log the issue
        // This prevents the user from getting an error when the email service is down
        console.log('⚠️ Continuing with password reset process despite email failure');
      }
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      // Don't fail the request if email fails, but log the error
      console.log('⚠️ Continuing with password reset process despite email error');
    }

    return NextResponse.json(
      { message: 'Password reset link has been sent to your email.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

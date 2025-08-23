import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId, action, plan } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        isSubscribed: true,
        subscriptionTier: true,
        trialStartDate: true,
        trialEndDate: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        isTrialActive: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userType !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if trial has expired and update status if needed
    let subscription = { ...user };
    
    if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndDate);
      
      if (now > trialEnd) {
        await prisma.user.update({
          where: { id: Number(userId) },
          data: {
            subscriptionStatus: 'expired',
            isTrialActive: false
          }
        });
        
        subscription = {
          ...user,
          subscriptionStatus: 'expired',
          isTrialActive: false
        };
      }
    }

    // If action is 'create_payment' and plan is provided, create a mock payment
    if (action === 'create_payment' && plan) {
      const planDetails = getPlanDetails(plan);
      if (!planDetails) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }

      // Create a unique reference for this subscription payment
      const reference = `MOCK_SUB_${userId}_${plan}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create mock payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId: Number(userId),
          amount: planDetails.price,
          currency: 'MYR',
          status: 'pending',
          paymentMethod: 'mock_subscription',
          billplzBillId: `mock_${reference}`,
          billplzUrl: `/seller/subscription?success=true&reference=${reference}`,
          reference: reference,
          description: `Mock subscription payment for ${planDetails.name}`,
          plan: 'subscription'
        }
      });

      // Simulate successful payment immediately
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          paidAmount: planDetails.price,
          paidAt: new Date()
        }
      });

      // Activate subscription
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          isSubscribed: true,
          subscriptionTier: plan,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: subscriptionEndDate,
          isTrialActive: false
        }
      });

      // Send subscription confirmation email to seller
      try {
        console.log('📧 Attempting to send email to:', updatedUser.email);
        console.log('📧 Email credentials check:', {
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS,
          emailUser: process.env.EMAIL_USER
        });

        const subscriptionEmail = emailTemplates.subscriptionActivated({
          sellerName: updatedUser.name,
          planName: planDetails.name,
          planPrice: planDetails.price,
          subscriptionEndDate: subscriptionEndDate.toLocaleDateString(),
          features: planDetails.features
        });

        const emailResult = await sendEmail({
          to: updatedUser.email,
          subject: subscriptionEmail.subject,
          html: subscriptionEmail.html,
          text: subscriptionEmail.text
        });

        console.log('📧 Email send result:', emailResult);
        console.log('✅ Subscription confirmation email sent to:', updatedUser.email);
      } catch (emailError) {
        console.error('❌ Failed to send subscription email:', emailError);
        console.error('❌ Email error details:', {
          message: emailError.message,
          stack: emailError.stack
        });
        // Don't fail the subscription if email fails
      }

      // Send admin notification
      try {
        console.log('📧 Sending admin notification to: livesalez1@gmail.com');
        
        const adminEmail = emailTemplates.adminSellerSubscription({
          sellerName: updatedUser.name,
          sellerEmail: updatedUser.email,
          planName: planDetails.name,
          planPrice: planDetails.price,
          subscriptionEndDate: subscriptionEndDate.toLocaleDateString()
        });

        const adminEmailResult = await sendEmail({
          to: 'livesalez1@gmail.com',
          subject: adminEmail.subject,
          html: adminEmail.html,
          text: adminEmail.text
        });

        console.log('📧 Admin notification result:', adminEmailResult);
        console.log('✅ Admin notification sent to: livesalez1@gmail.com');
      } catch (adminEmailError) {
        console.error('❌ Failed to send admin notification:', adminEmailError);
        // Don't fail the subscription if admin email fails
      }

      return NextResponse.json({
        success: true,
        subscription: {
          ...subscription,
          isSubscribed: true,
          subscriptionTier: plan,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: subscriptionEndDate,
          isTrialActive: false
        },
        payment: {
          id: payment.id,
          billplzUrl: `/mock-payment/${reference}`,
          reference: reference,
          amount: planDetails.price,
          plan: planDetails,
          status: 'completed'
        }
      });
    }

    return NextResponse.json({ subscription });
  } catch (e) {
    console.error('Error in mock subscription API:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Subscription plan details
function getPlanDetails(plan) {
  const plans = {
    'pro': {
      name: 'Pro Plan',
      description: 'Complete features for professional sellers',
      price: 20.00,
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Custom branding', 'Express shipping', 'API access']
    }
  };
  
  return plans[plan] || null;
} 
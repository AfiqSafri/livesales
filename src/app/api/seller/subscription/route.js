import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
        // Trial has expired, update the user's subscription status
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

    // If action is 'create_payment' and plan is provided, create a Billplz bill
    if (action === 'create_payment' && plan) {
      const planDetails = getPlanDetails(plan);
      if (!planDetails) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }

      // Create a unique reference for this subscription payment
      const reference = `SUB_${userId}_${plan}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create Billplz bill for subscription using production V4 API
      const billplzData = {
        collection_id: process.env.BILLPLZ_COLLECTION_ID,
        description: `Subscription: ${planDetails.name} - ${planDetails.description}`,
        email: user.email,
        name: user.name,
        amount: Math.round(planDetails.price * 100), // Convert to cents
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/subscription?success=true&reference=${reference}`,
        reference_1_label: 'User ID',
        reference_1: userId.toString(),
        reference_2_label: 'Plan',
        reference_2: plan,
        reference_3_label: 'Type',
        reference_3: 'subscription'
      };

      console.log('🔍 Creating Billplz subscription bill:', billplzData);

      try {
        const billplzResponse = await fetch(`${process.env.BILLPLZ_API_BASE_URL}/bills`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.BILLPLZ_API_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(billplzData)
        });

        if (!billplzResponse.ok) {
          const errorData = await billplzResponse.text();
          console.error('Billplz API error:', errorData);
          return NextResponse.json({ error: 'Failed to create Billplz bill' }, { status: 500 });
        }

        const billplzBill = await billplzResponse.json();
        console.log('✅ Billplz bill created:', billplzBill);

        // Create payment record in database
        const payment = await prisma.payment.create({
          data: {
            userId: Number(userId),
            amount: planDetails.price,
            currency: 'MYR',
            status: 'pending',
            paymentMethod: 'billplz_subscription',
            billplzBillId: billplzBill.id,
            billplzUrl: billplzBill.url,
            reference: reference,
            description: `Subscription: ${planDetails.name}`,
            plan: plan
          }
        });

        return NextResponse.json({
          success: true,
          payment: {
            id: payment.id,
            billplzUrl: billplzBill.url,
            amount: planDetails.price,
            plan: plan,
            reference: reference
          }
        });

      } catch (error) {
        console.error('❌ Error creating Billplz bill:', error);
        return NextResponse.json({ error: 'Failed to create payment bill' }, { status: 500 });
      }
    }

    return NextResponse.json({ subscription });
  } catch (e) {
    console.error('Error in subscription API:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
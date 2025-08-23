'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const plans = [
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Complete features for professional sellers',
      price: 20.00,
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Custom branding', 'Express shipping', 'API access'],
      popular: true
    }
  ];

  useEffect(() => {
    fetchSubscription();
    
    // Check if payment was successful
    const success = searchParams.get('success');
    const reference = searchParams.get('reference');
    
    if (success === 'true' && reference) {
      alert(`Payment successful! Reference: ${reference}`);
      fetchSubscription(); // Refresh subscription data
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/subscription-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1 // Using seller ID 1 for testing
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        console.error('Failed to fetch subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    try {
      setCreatingPayment(true);
      const response = await fetch('/api/seller/subscription-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Using seller ID 1 for testing
          action: 'create_payment',
          plan: selectedPlan.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment created:', data);
        
                 if (data.payment && data.payment.status === 'completed') {
           // Mock payment completed successfully
           alert(`🎉 Subscription activated successfully!\n\nPlan: ${data.payment.plan.name}\nPrice: RM ${data.payment.plan.price}/month\n\nCheck your email for confirmation details!`);
           setSubscription(data.subscription);
           setSelectedPlan(null);
           setPaymentUrl(null);
         } else if (data.payment && data.payment.billplzUrl) {
           setPaymentUrl(data.payment.billplzUrl);
           // For real Billplz payments, open in new window
           window.open(data.payment.billplzUrl, '_blank');
         }
      } else {
        const errorData = await response.json();
        alert(`Failed to create payment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment');
    } finally {
      setCreatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Responsive */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Upgrade your seller account to unlock more features and grow your business
          </p>
        </div>

                 {/* Current Subscription Status - Mobile Responsive */}
         {subscription && (
           <div className="mb-6 lg:mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
             <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Current Status</h2>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
               <div className="text-center sm:text-left">
                 <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                 <p className="text-sm sm:text-base font-semibold text-gray-900">
                   {subscription.subscriptionStatus === 'active' ? 'Active' : 
                    subscription.subscriptionStatus === 'trial' ? 'Trial' : 
                    subscription.subscriptionStatus === 'expired' ? 'Expired' : 'Inactive'}
                 </p>
               </div>
               <div className="text-center sm:text-left">
                 <p className="text-xs sm:text-sm text-gray-500 mb-1">Plan</p>
                 <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                   {subscription.subscriptionTier === 'lifetime_free' ? 'Lifetime Free' : 
                    subscription.subscriptionTier || 'Free'}
                 </p>
               </div>
               <div className="text-center sm:text-left">
                 <p className="text-xs sm:text-sm text-gray-500 mb-1">Start Date</p>
                 <p className="text-sm sm:text-base font-semibold text-gray-900">
                   {subscription.subscriptionStartDate ? 
                     new Date(subscription.subscriptionStartDate).toLocaleDateString() : 
                     'N/A'}
                 </p>
               </div>
               <div className="text-center sm:text-left">
                 <p className="text-xs sm:text-sm text-gray-500 mb-1">End Date</p>
                 <p className="text-sm sm:text-base font-semibold text-gray-900">
                   {subscription.subscriptionEndDate ? 
                     new Date(subscription.subscriptionEndDate).toLocaleDateString() : 
                     'N/A'}
                 </p>
               </div>
             </div>
             
                              {/* Additional subscription details - Mobile Responsive */}
             <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
               {subscription.subscriptionTier === 'lifetime_free' ? (
                 <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                   <div className="flex items-center">
                     <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                     </svg>
                     <span className="text-purple-800 font-medium text-sm sm:text-base">🎉 Congratulations! You have Lifetime Free access!</span>
                   </div>
                   <p className="text-purple-700 text-xs sm:text-sm mt-2">
                     You have unlimited access to all premium features without any monthly charges. This is a special privilege granted by our admin team.
                   </p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-3 sm:gap-4">
                   <div className="text-center sm:text-left">
                     <p className="text-xs sm:text-sm text-gray-500 mb-1">Trial Status</p>
                     <p className="text-sm sm:text-base font-semibold text-gray-900">
                       {subscription.isTrialActive ? 'Active' : 'Inactive'}
                     </p>
                   </div>
                   <div className="text-center sm:text-left">
                     <p className="text-xs sm:text-sm text-gray-500 mb-1">Days Remaining</p>
                     <p className="text-sm sm:text-base font-semibold text-gray-900">
                       {subscription.subscriptionEndDate ? 
                         Math.max(0, Math.ceil((new Date(subscription.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24))) : 
                         'N/A'} days
                       </p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}

        {/* Subscription Plans - Mobile Responsive */}
        {subscription && subscription.subscriptionTier !== 'lifetime_free' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
              } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{plan.description}</p>
                
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">RM {plan.price}</span>
                  <span className="text-sm sm:text-base text-gray-500">/month</span>
                </div>

                <ul className="text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                    selectedPlan?.id === plan.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Subscribe Button - Mobile Responsive */}
        {selectedPlan && subscription && subscription.subscriptionTier !== 'lifetime_free' && (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Selected Plan: {selectedPlan.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                You will be charged RM {selectedPlan.price} per month
              </p>
              <button
                onClick={handleSubscribe}
                disabled={creatingPayment}
                className="btn btn-lg btn-primary group hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto py-3 sm:py-4"
              >
                <i className={`fas ${creatingPayment ? 'fa-spinner fa-spin' : 'fa-credit-card'} mr-2`}></i>
                {creatingPayment ? 'Creating Payment...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        )}

                 {/* Test Information - Mobile Responsive */}
         {subscription && subscription.subscriptionTier !== 'lifetime_free' && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mt-6 lg:mt-8">
           <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">🧪 Mock Payment System</h3>
           <p className="text-green-700 mb-3 sm:mb-4 text-sm sm:text-base">
             This is using a mock payment system for testing. Subscriptions activate immediately without external payment processing.
           </p>
           <div className="text-xs sm:text-sm text-green-600 space-y-1">
             <p><strong>Status:</strong> Instant activation</p>
             <p><strong>Payment:</strong> Simulated</p>
             <p><strong>Database:</strong> Records created</p>
           </div>
           
           {/* Test Email Button */}
           <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200">
             <button
               onClick={async () => {
                 try {
                   const response = await fetch('/api/test-email', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ to: 'livesalez1@gmail.com' })
                   });
                   const result = await response.json();
                   if (result.success) {
                     alert('✅ Test email sent! Check your inbox.');
                   } else {
                     alert(`❌ Test email failed: ${result.error}`);
                   }
                 } catch (error) {
                   alert(`❌ Test email error: ${error.message}`);
                 }
               }}
               className="btn btn-sm btn-success group hover:scale-105 transition-all duration-200 w-full sm:w-auto py-2 sm:py-2.5"
             >
               <i className="fas fa-envelope mr-2 group-hover:scale-110 transition-transform duration-200"></i>
               Test Email Sending
             </button>
           </div>
         </div>
         )}

        {/* Payment URL Display - Mobile Responsive */}
        {paymentUrl && subscription && subscription.subscriptionTier !== 'lifetime_free' && (
          <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">Payment Link Created</h3>
            <p className="text-green-700 mb-2 text-sm sm:text-base">A new window should have opened with the payment page.</p>
            <p className="text-xs sm:text-sm text-green-600">
              If the window didn't open, click here: 
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 break-all">
                Open Payment Page
              </a>
            </p>
          </div>
        )}
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
} 
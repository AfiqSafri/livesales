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
  const [userId, setUserId] = useState(null);

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
    // Get user ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id) {
      setUserId(currentUser.id);
      fetchSubscription(currentUser.id);
    } else {
      console.error('No user ID found in localStorage');
      setLoading(false);
    }
    
    // Check if payment was successful
    const success = searchParams.get('success');
    const reference = searchParams.get('reference');
    
    if (success === 'true' && reference) {
      alert(`Payment successful! Reference: ${reference}`);
      if (currentUser.id) {
        fetchSubscription(currentUser.id); // Refresh subscription data
      }
    }
  }, [searchParams]);

  const fetchSubscription = async (id) => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/subscription-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id
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

    if (!userId) {
      alert('User not authenticated. Please login again.');
      router.push('/login');
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
          userId: userId,
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your subscription details.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
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
                     <p className="text-xs sm:text-sm text-gray-500 mb-1">Trial End</p>
                     <p className="text-sm sm:text-base font-semibold text-gray-900">
                       {subscription.trialEndDate ? 
                         new Date(subscription.trialEndDate).toLocaleDateString() : 
                         'N/A'}
                     </p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}

         {/* Subscription Plans - Mobile Responsive */}
         <div className="mb-8 lg:mb-12">
           <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-6 lg:mb-8 text-center">
             Available Plans
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8 max-w-2xl mx-auto">
             {plans.map((plan) => (
               <div
                 key={plan.id}
                 className={`relative bg-white rounded-2xl shadow-lg border-2 p-6 lg:p-8 transition-all duration-200 ${
                   selectedPlan?.id === plan.id
                     ? 'border-blue-500 shadow-blue-100'
                     : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                 } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
               >
                 {plan.popular && (
                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                     <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                       Most Popular
                     </span>
                   </div>
                 )}
                 
                 <div className="text-center mb-6">
                   <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                   <p className="text-gray-600 text-sm lg:text-base mb-4">{plan.description}</p>
                   <div className="mb-4">
                     <span className="text-3xl lg:text-4xl font-bold text-gray-900">RM {plan.price}</span>
                     <span className="text-gray-500 text-lg">/month</span>
                   </div>
                 </div>
                 
                 <ul className="space-y-3 mb-6">
                   {plan.features.map((feature, index) => (
                     <li key={index} className="flex items-center text-sm lg:text-base">
                       <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                       </svg>
                       {feature}
                     </li>
                   ))}
                 </ul>
                 
                 <button
                   onClick={() => handlePlanSelect(plan)}
                   className={`w-full py-3 lg:py-4 px-6 rounded-xl font-semibold text-sm lg:text-base transition-all duration-200 ${
                     selectedPlan?.id === plan.id
                       ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   }`}
                 >
                   {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                 </button>
               </div>
             ))}
           </div>
         </div>

         {/* Subscribe Button - Mobile Responsive */}
         {selectedPlan && (
           <div className="text-center mb-8 lg:mb-12">
             <button
               onClick={handleSubscribe}
               disabled={creatingPayment}
               className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 lg:px-12 py-4 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
             >
               {creatingPayment ? (
                 <div className="flex items-center justify-center">
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                   Creating Payment...
                 </div>
               ) : (
                 `Subscribe to ${selectedPlan.name} - RM ${selectedPlan.price}/month`
               )}
             </button>
           </div>
         )}

         {/* Test Information - Mobile Responsive */}
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6 mb-8">
           <h3 className="text-lg lg:text-xl font-semibold text-blue-900 mb-3 lg:mb-4 flex items-center">
             <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
             Test Mode Information
           </h3>
           <div className="text-blue-800 text-sm lg:text-base space-y-2">
             <p>• This is a <strong>mock subscription system</strong> for testing purposes</p>
             <p>• No real payments will be processed</p>
             <p>• Subscription will be activated immediately after clicking subscribe</p>
             <p>• Test emails will be sent to your registered email address</p>
             <p>• Contact admin to upgrade to a real payment system</p>
           </div>
         </div>

         {/* Payment URL Display - Mobile Responsive */}
         {paymentUrl && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mb-8">
             <h3 className="text-lg lg:text-xl font-semibold text-green-900 mb-3 lg:mb-4">Payment URL Generated</h3>
             <p className="text-green-800 text-sm lg:text-base mb-3">
               A payment URL has been generated. For real payments, this would redirect to the payment gateway.
             </p>
             <div className="bg-white p-3 rounded border break-all text-xs lg:text-sm font-mono text-green-700">
               {paymentUrl}
             </div>
           </div>
         )}
        </div>
      </main>
      
      <ModernFooter />
    </div>
  );
}

// Loading fallback component
function SubscriptionLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      <div className="pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription page...</p>
        </div>
      </div>
      <ModernFooter />
    </div>
  );
}

export default function Subscription() {
  return (
    <Suspense fallback={<SubscriptionLoading />}>
      <SubscriptionContent />
    </Suspense>
  );
} 
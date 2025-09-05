"use client";
import { useState } from 'react';

const PAYMENT_STEPS = [
  {
    id: 1,
    title: 'Select Your Bank',
    description: 'Choose from popular Malaysian banks like Maybank, CIMB, Public Bank, and more',
    icon: '🏦',
    color: 'bg-blue-500',
    details: [
      'Browse through our supported banks',
      'Select your preferred bank',
      'View bank descriptions and features'
    ]
  },
  {
    id: 2,
    title: 'Redirect to Bank',
    description: 'You\'ll be securely redirected to your bank\'s online banking page',
    icon: '🔒',
    color: 'bg-green-500',
    details: [
      'Secure HTTPS connection',
      'Bank\'s official domain',
      'SSL certificate verification'
    ]
  },
  {
    id: 3,
    title: 'Bank Login',
    description: 'Log into your online banking account using your credentials',
    icon: '🔐',
    color: 'bg-purple-500',
    details: [
      'Enter your username/ID',
      'Input your password',
      'Complete any additional security steps'
    ]
  },
  {
    id: 4,
    title: 'Payment Approval',
    description: 'Approve the payment through your bank\'s security verification',
    icon: '✅',
    color: 'bg-orange-500',
    details: [
      'Review payment details',
      'Receive SMS/Email verification code',
      'Enter the verification code',
      'Confirm payment amount'
    ]
  },
  {
    id: 5,
    title: 'Payment Confirmation',
    description: 'Your payment is processed and confirmed by both your bank and Billplz',
    icon: '🎉',
    color: 'bg-green-600',
    details: [
      'Bank processes the payment',
      'Billplz receives confirmation',
      'Order status is updated',
      'Confirmation email is sent'
    ]
  }
];

export default function PaymentFlowGuide({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">How Secure Payment Works</h2>
              <p className="text-blue-100 mt-1">
                Your payment is protected by bank-level security
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-blue-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {PAYMENT_STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    activeStep === step.id
                      ? `${step.color} text-white shadow-lg scale-110`
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {step.id}
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Content */}
          <div className="text-center mb-8">
            <div className={`${PAYMENT_STEPS[activeStep - 1].color} text-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg`}>
              {PAYMENT_STEPS[activeStep - 1].icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Step {activeStep}: {PAYMENT_STEPS[activeStep - 1].title}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {PAYMENT_STEPS[activeStep - 1].description}
            </p>
          </div>

          {/* Step Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">What Happens:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_STEPS[activeStep - 1].details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Security Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h5 className="font-semibold text-green-800 text-sm">HTTPS Encryption</h5>
                <p className="text-xs text-green-700">All data is encrypted in transit</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 7-3 9-3 9s3 2 9 2 9-2 9-2-3-2-3-9a6 6 0 00-6-6zm-2.01 7.253c-.023.183-.134.305-.23.305-.087 0-.15-.108-.12-.217.03-.11.134-.19.23-.19.096 0 .15.108.12.217zm.01-2.253c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h5 className="font-semibold text-green-800 text-sm">Bank Verification</h5>
                <p className="text-xs text-green-700">SMS/Email security codes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h5 className="font-semibold text-green-800 text-sm">Fraud Protection</h5>
                <p className="text-xs text-green-700">Real-time fraud detection</p>
              </div>
            </div>
          </div>

          {/* Supported Banks Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-800 mb-4 text-center">Supported Banks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Maybank', 'CIMB', 'Public Bank', 'Hong Leong', 'RHB', 'AmBank', 'Alliance', 'BSN'].map((bank, index) => (
                <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 text-xs font-bold">🏦</span>
                  </div>
                  <p className="text-xs text-blue-800 font-medium">{bank}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              Step {activeStep} of {PAYMENT_STEPS.length}
            </div>

            <button
              onClick={() => setActiveStep(Math.min(PAYMENT_STEPS.length, activeStep + 1))}
              disabled={activeStep === PAYMENT_STEPS.length}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
}





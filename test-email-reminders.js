#!/usr/bin/env node

/**
 * Test script for email reminder system
 * 
 * This script tests the email reminder API endpoint to ensure
 * it works correctly for sending notifications to sellers.
 */

const fetch = globalThis.fetch || require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testEmailReminders() {
  console.log('🧪 Testing Email Reminder System...');
  console.log(`📡 API URL: ${API_URL}`);
  
  try {
    // Test the API endpoint
    console.log('\n📤 Sending request to /api/notifications/send-reminders...');
    
    const response = await fetch(`${API_URL}/api/notifications/send-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`✅ Success: ${result.success}`);
    console.log(`👥 Sellers checked: ${result.totalSellersChecked}`);
    console.log(`📧 Emails sent: ${result.totalEmailsSent}`);
    console.log(`🕒 Timestamp: ${result.timestamp}`);
    
    if (result.totalEmailsSent > 0) {
      console.log('\n🎉 SUCCESS: Email reminders are working!');
      console.log(`📧 ${result.totalEmailsSent} email${result.totalEmailsSent > 1 ? 's' : ''} sent successfully`);
    } else {
      console.log('\n✅ SUCCESS: No emails needed to be sent (no pending receipts or frequency limits not reached)');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure your Next.js server is running on port 3000');
      console.log('   Run: npm run dev');
    }
  }
}

// Run the test
if (require.main === module) {
  testEmailReminders();
}

module.exports = testEmailReminders;

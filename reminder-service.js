#!/usr/bin/env node

// Use built-in fetch (Node.js 18+) or require node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const REMINDER_ENDPOINT = `${API_URL}/api/receipt/reminder-30s`;

console.log('🔔 Starting pending receipt reminder service...');
console.log(`🔔 API URL: ${REMINDER_ENDPOINT}`);

async function sendPendingReceiptReminders() {
  try {
    console.log(`⏰ ${new Date().toISOString()} - Checking for pending receipts...`);
    
    const response = await fetch(REMINDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Reminder check completed:`, data.summary);
      
      if (data.summary.remindersSent > 0) {
        console.log(`📧 Sent ${data.summary.remindersSent} reminder emails`);
      }
      
      if (data.summary.remindersSkipped > 0) {
        console.log(`⏰ Skipped ${data.summary.remindersSkipped} reminders (too recent)`);
      }
    } else {
      console.error('❌ Reminder check failed:', data.error);
    }

  } catch (error) {
    console.error('❌ Error in reminder service:', error.message);
  }
}

// Run immediately
sendPendingReceiptReminders();

// Set up interval to run every 30 seconds
setInterval(sendPendingReceiptReminders, 30000);

console.log('🔔 Reminder service started - checking every 30 seconds');
console.log('🔔 Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔔 Shutting down reminder service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔔 Shutting down reminder service...');
  process.exit(0);
});

#!/usr/bin/env node

/**
 * Background Email Reminder Service
 * 
 * This service runs continuously and sends email reminders to sellers
 * about pending receipts based on their notification frequency settings.
 * 
 * Usage:
 * - Local development: node email-reminder-service.js
 * - Production: Set up as a cron job or background service
 */

const fetch = globalThis.fetch || require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const DEFAULT_CHECK_INTERVAL = 30000; // Default 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

class EmailReminderService {
  constructor() {
    this.isRunning = false;
    this.retryCount = 0;
    this.lastCheckTime = null;
    this.currentInterval = DEFAULT_CHECK_INTERVAL;
    this.lastSellerSettings = null;
  }

  async start() {
    console.log('🚀 Starting Email Reminder Service...');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`⏰ Initial check interval: ${this.currentInterval / 1000} seconds`);
    
    this.isRunning = true;
    this.run();
  }

  async stop() {
    console.log('🛑 Stopping Email Reminder Service...');
    this.isRunning = false;
  }

  async run() {
    while (this.isRunning) {
      try {
        const result = await this.checkAndSendReminders();
        
        // Update interval based on seller settings
        if (result && result.sellerSettings) {
          this.updateInterval(result.sellerSettings);
        }
        
        this.retryCount = 0; // Reset retry count on success
        this.lastCheckTime = new Date();
      } catch (error) {
        console.error('❌ Error in reminder service:', error.message);
        await this.handleError(error);
      }

      // Wait before next check with dynamic interval
      await this.sleep(this.currentInterval);
    }
  }

  async checkAndSendReminders() {
    try {
      console.log('🔔 Checking for pending receipts and sending reminders...');
      
      const response = await fetch(`${API_URL}/api/notifications/send-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Reminder check completed successfully');
        console.log(`📊 Summary: ${result.totalEmailsSent} emails sent to ${result.totalSellersChecked} sellers`);
        
        if (result.totalEmailsSent > 0) {
          console.log(`📧 ${result.totalEmailsSent} email${result.totalEmailsSent > 1 ? 's' : ''} sent successfully`);
        }
      } else {
        throw new Error(result.error || 'Unknown error from API');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async handleError(error) {
    this.retryCount++;
    
    if (this.retryCount >= MAX_RETRIES) {
      console.error(`❌ Max retries (${MAX_RETRIES}) reached. Service will continue but may have issues.`);
      this.retryCount = 0; // Reset for next cycle
    } else {
      console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${this.retryCount}/${MAX_RETRIES})`);
      await this.sleep(RETRY_DELAY);
    }
  }

  updateInterval(sellerSettings) {
    // Find the most frequent setting among all sellers
    const frequencies = sellerSettings.map(seller => seller.reminderFrequency);
    
    // Determine the optimal check interval based on seller preferences
    let optimalInterval = DEFAULT_CHECK_INTERVAL;
    
    if (frequencies.includes('30s')) {
      optimalInterval = 30000; // 30 seconds - most frequent
    } else if (frequencies.includes('30m')) {
      optimalInterval = 30000; // Still check every 30 seconds, but API will handle frequency
    } else if (frequencies.includes('1h')) {
      optimalInterval = 30000; // Still check every 30 seconds, but API will handle frequency
    }
    
    // Only log if interval changed
    if (optimalInterval !== this.currentInterval) {
      console.log(`⏰ Updating check interval: ${this.currentInterval / 1000}s → ${optimalInterval / 1000}s`);
      this.currentInterval = optimalInterval;
    }
    
    this.lastSellerSettings = sellerSettings;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      retryCount: this.retryCount,
      apiUrl: API_URL,
      currentInterval: this.currentInterval,
      sellerSettings: this.lastSellerSettings
    };
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.reminderService) {
    await global.reminderService.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (global.reminderService) {
    await global.reminderService.stop();
  }
  process.exit(0);
});

// Start the service
if (require.main === module) {
  const service = new EmailReminderService();
  global.reminderService = service;
  
  service.start().catch(error => {
    console.error('❌ Failed to start email reminder service:', error);
    process.exit(1);
  });
}

module.exports = EmailReminderService;

#!/usr/bin/env node

/**
 * Smart Email Reminder Service
 * 
 * This service dynamically adjusts its check interval based on seller preferences.
 * It runs at the frequency needed by the most demanding seller setting.
 * 
 * Usage:
 * - Local development: node smart-email-reminder-service.js
 * - Production: Set up as a cron job or background service
 */

const fetch = globalThis.fetch || require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Frequency intervals in milliseconds
const FREQUENCY_INTERVALS = {
  '30s': 30000,   // 30 seconds
  '30m': 1800000, // 30 minutes  
  '1h': 3600000,  // 1 hour
  'off': null     // Disabled
};

class SmartEmailReminderService {
  constructor() {
    this.isRunning = false;
    this.retryCount = 0;
    this.lastCheckTime = null;
    this.currentInterval = 30000; // Start with 30 seconds
    this.lastSellerSettings = null;
    this.intervalUpdateCount = 0;
  }

  async start() {
    console.log('🚀 Starting Smart Email Reminder Service...');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`⏰ Initial check interval: ${this.currentInterval / 1000} seconds`);
    console.log('🧠 Service will automatically adjust interval based on seller preferences');
    
    this.isRunning = true;
    this.run();
  }

  async stop() {
    console.log('🛑 Stopping Smart Email Reminder Service...');
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
      console.log(`⏳ Next check in ${this.currentInterval / 1000} seconds...`);
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
        
        return result;
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

  updateInterval(sellerSettings) {
    // Find the most frequent (shortest interval) setting among active sellers
    const activeFrequencies = sellerSettings
      .filter(seller => seller.reminderFrequency !== 'off')
      .map(seller => seller.reminderFrequency);
    
    if (activeFrequencies.length === 0) {
      // No active sellers, use a longer interval
      this.setInterval(300000); // 5 minutes
      return;
    }
    
    // Find the shortest interval needed
    let shortestInterval = null;
    let mostFrequentSetting = null;
    
    for (const frequency of activeFrequencies) {
      const interval = FREQUENCY_INTERVALS[frequency];
      if (interval && (!shortestInterval || interval < shortestInterval)) {
        shortestInterval = interval;
        mostFrequentSetting = frequency;
      }
    }
    
    // Set interval to half of the shortest needed interval for safety margin
    const optimalInterval = shortestInterval ? Math.max(shortestInterval / 2, 30000) : 30000;
    
    this.setInterval(optimalInterval, mostFrequentSetting);
  }

  setInterval(newInterval, frequencySetting = null) {
    if (newInterval !== this.currentInterval) {
      const oldInterval = this.currentInterval;
      this.currentInterval = newInterval;
      this.intervalUpdateCount++;
      
      console.log(`⏰ Interval updated: ${oldInterval / 1000}s → ${newInterval / 1000}s`);
      if (frequencySetting) {
        console.log(`🎯 Based on seller preference: ${frequencySetting}`);
      }
      console.log(`📈 Total interval updates: ${this.intervalUpdateCount}`);
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
      intervalUpdateCount: this.intervalUpdateCount,
      sellerSettings: this.lastSellerSettings,
      frequencyIntervals: FREQUENCY_INTERVALS
    };
  }

  // Method to manually check status
  logStatus() {
    const status = this.getStatus();
    console.log('\n📊 Service Status:');
    console.log('==================');
    console.log(`🔄 Running: ${status.isRunning}`);
    console.log(`⏰ Current interval: ${status.currentInterval / 1000} seconds`);
    console.log(`📈 Interval updates: ${status.intervalUpdateCount}`);
    console.log(`🕒 Last check: ${status.lastCheckTime ? status.lastCheckTime.toLocaleString() : 'Never'}`);
    console.log(`👥 Active sellers: ${status.sellerSettings ? status.sellerSettings.length : 0}`);
    
    if (status.sellerSettings) {
      const frequencyCounts = {};
      status.sellerSettings.forEach(seller => {
        frequencyCounts[seller.reminderFrequency] = (frequencyCounts[seller.reminderFrequency] || 0) + 1;
      });
      
      console.log('📊 Seller frequency distribution:');
      Object.entries(frequencyCounts).forEach(([freq, count]) => {
        console.log(`   ${freq}: ${count} seller${count > 1 ? 's' : ''}`);
      });
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.smartReminderService) {
    global.smartReminderService.logStatus();
    await global.smartReminderService.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (global.smartReminderService) {
    global.smartReminderService.logStatus();
    await global.smartReminderService.stop();
  }
  process.exit(0);
});

// Add status logging every 5 minutes
setInterval(() => {
  if (global.smartReminderService) {
    global.smartReminderService.logStatus();
  }
}, 300000); // 5 minutes

// Start the service
if (require.main === module) {
  const service = new SmartEmailReminderService();
  global.smartReminderService = service;
  
  service.start().catch(error => {
    console.error('❌ Failed to start smart email reminder service:', error);
    process.exit(1);
  });
}

module.exports = SmartEmailReminderService;

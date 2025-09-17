# 📧 Email Notification System - Complete Guide

## 🎯 Overview

The Livesales platform includes a sophisticated email notification system that automatically sends reminders to sellers about pending receipts. The system respects individual seller preferences and runs continuously in the background.

## 🔧 System Architecture

### **Components**

1. **Frontend Component**: `ReminderFrequencySettings.js`
   - User interface for setting email preferences
   - Multi-language support (English/Malay)
   - Real-time updates and auto-save

2. **API Endpoints**:
   - `PUT /api/user/reminder-frequency` - Update preferences
   - `GET /api/user/reminder-frequency` - Get current settings
   - `POST /api/notifications/send-reminders` - Main cron endpoint

3. **Background Services**:
   - Vercel Cron Jobs (Production)
   - Local development services (Development)

4. **Database**:
   - `User.reminderFrequency` field stores preferences
   - `Receipt` table tracks pending receipts

## 📊 Email Frequency Options

| Frequency | Description | Use Case | Badge |
|-----------|-------------|----------|-------|
| **30s** | Every 30 seconds | Urgent notifications for high-volume sellers | 🔴 Urgent |
| **30m** | Every 30 minutes | Balanced approach for most sellers | 🟡 Balanced |
| **1h** | Every 1 hour | Relaxed notifications for low-volume sellers | 🟢 Relaxed |
| **off** | No notifications | Sellers who prefer manual checking | ⚫ Disabled |

## 🚀 Development vs Production

### **Development Environment**

**Manual Testing**:
```bash
# Start development server
npm run dev

# Test email reminders manually
curl -X POST http://localhost:3000/api/notifications/send-reminders

# Test auto-cancel
curl -X GET "http://localhost:3000/api/cron/auto-cancel?secret=your-secret"
```

**Local Services**:
```bash
# Run email reminder service locally
npm run email-reminders

# Run smart reminder service
npm run smart-reminders
```

### **Production Environment (Vercel)**

**Automatic Execution**:
- **Email Reminders**: Every 5 minutes (`*/5 * * * *`)
- **Auto-Cancel Orders**: Every 2 minutes (`*/2 * * * *`)
- **No browser required** - runs on Vercel servers
- **24/7 operation** - completely automated

## 🔄 How It Works

### **Email Reminder Process**

1. **Cron Trigger**: Vercel calls `/api/notifications/send-reminders` every 5 minutes
2. **Seller Query**: System fetches all sellers with notifications enabled (not 'off')
3. **Receipt Check**: For each seller, check for pending receipts
4. **Frequency Validation**: Verify if enough time has passed since last email
5. **Email Sending**: Send notification if conditions are met
6. **Tracking**: Update last email sent time for frequency control

### **Frequency Logic**

```javascript
// Frequency intervals in milliseconds
const FREQUENCY_INTERVALS = {
  '30s': 30000,   // 30 seconds
  '30m': 1800000, // 30 minutes  
  '1h': 3600000,  // 1 hour
  'off': null     // Disabled
};

// Check if enough time has passed
const timeSinceLastEmail = now - lastSent;
const frequencyMs = getFrequencyInMs(seller.reminderFrequency);
return timeSinceLastEmail >= frequencyMs;
```

### **Auto-Cancel Process**

1. **Cron Trigger**: Vercel calls `/api/cron/auto-cancel` every 2 minutes
2. **Security Check**: Verify cron secret parameter
3. **Order Query**: Find orders pending payment for >3 minutes
4. **Cancellation**: For each unpaid order:
   - Update status to 'cancelled'
   - Restore product quantity
   - Create status history entry
   - Send cancellation email to buyer

## 📧 Email Templates

### **Pending Receipt Reminder**

**Subject**: `🔔 X Pending Receipt(s) Awaiting Your Review`

**Content**:
- Professional HTML design with gradient header
- Receipt summary with buyer details
- Product information and amounts
- Direct link to seller dashboard
- Frequency information and timestamp

**Features**:
- Responsive design for mobile/desktop
- Fallback text version
- Dynamic content based on receipt count
- Branded styling with Livesales colors

### **Order Cancellation Email**

**Subject**: `Order Cancelled - Payment Timeout`

**Content**:
- Clear cancellation notice
- Order details and product information
- Explanation of what happened next
- Professional styling and branding

## 🛠️ Configuration

### **Environment Variables**

**Required for Production**:
```bash
# Database
DATABASE_URL=postgresql://...

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App URLs
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Security
CRON_SECRET=59d385b8d97afc714e32c5aeab2de1fffcf01eed01c68f85523f6ba44647a041
```

### **Vercel Configuration**

**`vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/notifications/send-reminders",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/auto-cancel?secret=...",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

## 📊 Monitoring & Debugging

### **Vercel Dashboard**

1. **Functions Tab**: View cron job execution logs
2. **Performance**: Monitor execution times and success rates
3. **Logs**: Check for errors and warnings
4. **Metrics**: Track function invocations and costs

### **Console Logging**

**Email Reminders**:
```javascript
console.log('🔔 Starting server-side email reminder check...');
console.log(`📧 Found ${sellers.length} sellers with email notifications enabled`);
console.log(`📋 Found ${pendingReceipts.length} pending receipts for seller ${seller.name}`);
console.log(`✅ Email sent to ${seller.name} (${seller.email})`);
```

**Auto-Cancel**:
```javascript
console.log(`[CRON] Found ${unpaidOrders.length} unpaid orders older than 3 minutes`);
console.log(`[CRON] Cancelled order #${order.id} and restored ${order.quantity} units`);
console.log(`[CRON] Cancellation email sent successfully to ${order.buyerEmail}`);
```

### **Health Check Endpoint**

Consider adding a health check:
```javascript
// /api/health/route.js
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cronJobs: {
      emailReminders: 'active',
      autoCancel: 'active'
    }
  });
}
```

## 🔒 Security Features

### **Cron Authentication**
- Secret parameter required for auto-cancel endpoint
- Prevents unauthorized access to cron functions
- Environment variable for secret management

### **Input Validation**
- Validates reminder frequency values
- Checks user ID and permissions
- Sanitizes email content

### **Rate Limiting**
- Frequency-based email throttling
- Prevents email spam
- Respects individual seller preferences

## 🎨 User Interface

### **ReminderFrequencySettings Component**

**Features**:
- Dropdown interface for frequency selection
- Real-time preview of current setting
- Visual badges for frequency types
- Auto-save functionality
- Multi-language support
- Responsive design

**States**:
- Loading state during save operations
- Success/error message display
- Disabled state during updates

## 📈 Performance Optimization

### **Database Queries**
- Efficient seller filtering (excludes 'off' users)
- Optimized receipt queries with includes
- Minimal data selection for performance

### **Email Batching**
- Processes sellers sequentially
- Handles errors gracefully
- Continues processing if one seller fails

### **Cron Frequency**
- 5-minute intervals balance responsiveness with cost
- 2-minute intervals for order cancellation
- Reduces server load while maintaining functionality

## 🚨 Troubleshooting

### **Common Issues**

1. **Emails not sending**:
   - Check SMTP credentials
   - Verify email service limits
   - Check Vercel function logs

2. **Cron jobs not running**:
   - Verify `vercel.json` syntax
   - Check Vercel dashboard for errors
   - Ensure functions are deployed

3. **Frequency not respected**:
   - Check database `reminderFrequency` values
   - Verify cron job execution logs
   - Check last email sent tracking

### **Debug Commands**

```bash
# Test email reminders
curl -X POST https://your-app.vercel.app/api/notifications/send-reminders

# Test auto-cancel
curl -X GET "https://your-app.vercel.app/api/cron/auto-cancel?secret=your-secret"

# Check user frequency settings
curl -X GET "https://your-app.vercel.app/api/user/reminder-frequency?userId=123"
```

## 🎯 Best Practices

### **For Sellers**
- Choose frequency based on business needs
- Monitor email delivery
- Update preferences as needed

### **For Developers**
- Monitor cron job performance
- Check logs regularly
- Update email templates as needed
- Test changes in development first

### **For Production**
- Set up monitoring alerts
- Regular backup of user preferences
- Monitor email service limits
- Track function costs

---

## 📝 Summary

The email notification system provides:
- ✅ **Automated email reminders** based on seller preferences
- ✅ **24/7 background operation** via Vercel Cron Jobs
- ✅ **Professional email templates** with responsive design
- ✅ **Multi-language support** for international users
- ✅ **Flexible frequency options** for different business needs
- ✅ **Comprehensive monitoring** and debugging tools
- ✅ **Security features** and input validation
- ✅ **Cost-effective serverless execution**

The system ensures sellers never miss important receipts while respecting their individual preferences and maintaining a professional user experience.

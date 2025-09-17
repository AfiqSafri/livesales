# Vercel Cron Jobs Setup Guide

## Overview
Vercel Cron Jobs allow you to run background processes automatically on a schedule, even when no users are actively using your application. This is perfect for:
- Email reminders
- Auto-cancelling unpaid orders
- Database cleanup
- Data synchronization
- Health checks

## Current Configuration

Your `vercel.json` is configured with two cron jobs:

### 1. Email Reminders (`*/5 * * * *`)
- **Schedule**: Every 5 minutes
- **Endpoint**: `/api/notifications/send-reminders`
- **Purpose**: Sends email reminders to sellers about pending receipts
- **Frequency**: Respects individual seller preferences (30s, 30m, 1h, off)

### 2. Auto-Cancel Orders (`*/2 * * * *`)
- **Schedule**: Every 2 minutes
- **Endpoint**: `/api/cron/auto-cancel?secret=...`
- **Purpose**: Cancels unpaid orders older than 3 minutes
- **Security**: Uses secret parameter for authentication

## How Vercel Cron Jobs Work

### ✅ **Automatic Execution**
- Cron jobs run automatically on Vercel's servers
- **No browser required** - they run in the background
- **No user interaction needed** - completely automated
- **Reliable scheduling** - Vercel handles the timing

### ⏰ **Schedule Format**
```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0=Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

**Common Patterns:**
- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `*/2 * * * *` - Every 2 minutes
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight

### 🔧 **Function Requirements**
Your cron endpoints must:
1. **Handle GET requests** (Vercel sends GET to cron endpoints)
2. **Complete within timeout limits** (10 seconds for Hobby, 60 seconds for Pro)
3. **Return proper HTTP responses**
4. **Be stateless** (no persistent connections)

## Optimization Recommendations

### 1. **Email Reminders** (Current: Every 5 minutes)
```json
{
  "path": "/api/notifications/send-reminders",
  "schedule": "*/5 * * * *"
}
```

**Why 5 minutes instead of 1 minute:**
- ✅ Reduces server load
- ✅ Lower costs (fewer function invocations)
- ✅ Still respects seller frequency preferences
- ✅ More reliable for production

### 2. **Auto-Cancel Orders** (Current: Every 2 minutes)
```json
{
  "path": "/api/cron/auto-cancel?secret=...",
  "schedule": "*/2 * * * *"
}
```

**Why 2 minutes:**
- ✅ Balances responsiveness with efficiency
- ✅ Orders are cancelled within 3-5 minutes of timeout
- ✅ Prevents unnecessary function calls

## Environment Variables

Make sure these are set in your Vercel dashboard:

### Required Variables:
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

## Monitoring & Debugging

### 1. **Vercel Dashboard**
- Go to your project → Functions tab
- View cron job execution logs
- Monitor success/failure rates
- Check execution times

### 2. **Function Logs**
Your cron functions log important information:
```javascript
console.log('🔔 Starting server-side email reminder check...');
console.log(`📧 Found ${sellers.length} sellers with email notifications enabled`);
console.log(`[CRON] Found ${unpaidOrders.length} unpaid orders older than 3 minutes`);
```

### 3. **Health Check Endpoint**
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

## Testing Cron Jobs

### 1. **Manual Testing**
```bash
# Test email reminders
curl -X POST https://your-app.vercel.app/api/notifications/send-reminders

# Test auto-cancel
curl -X GET "https://your-app.vercel.app/api/cron/auto-cancel?secret=your-secret"
```

### 2. **Local Development**
```bash
# Run reminder service locally
npm run email-reminders

# Run smart reminder service
npm run smart-reminders

# Test auto-cancel
npm run test-auto-cancel
```

## Cost Considerations

### Vercel Pricing:
- **Hobby Plan**: 100GB-hours/month included
- **Pro Plan**: 1000GB-hours/month included
- **Enterprise**: Custom limits

### Optimization Tips:
1. **Reduce frequency** when possible
2. **Optimize function execution time**
3. **Use efficient database queries**
4. **Implement proper error handling**

## Troubleshooting

### Common Issues:

1. **Cron jobs not running**
   - Check Vercel dashboard for errors
   - Verify `vercel.json` syntax
   - Ensure functions are deployed

2. **Function timeouts**
   - Optimize database queries
   - Reduce processing time
   - Consider breaking into smaller functions

3. **Email delivery issues**
   - Check SMTP credentials
   - Verify email service limits
   - Monitor bounce rates

## Advanced Configuration

### Multiple Environments:
```json
{
  "crons": [
    {
      "path": "/api/notifications/send-reminders",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/auto-cancel",
      "schedule": "*/2 * * * *"
    }
  ],
  "env": {
    "CRON_SECRET": "@cron-secret"
  }
}
```

### Conditional Execution:
```javascript
// Only run in production
if (process.env.VERCEL_ENV === 'production') {
  // Execute cron logic
}
```

## Security Best Practices

1. **Use secret parameters** for cron endpoints
2. **Validate requests** in cron functions
3. **Rate limiting** for sensitive operations
4. **Log all cron activities** for auditing

---

## Summary

Your Vercel cron jobs are now optimized for production:

✅ **Email reminders**: Every 5 minutes (efficient & reliable)
✅ **Auto-cancel orders**: Every 2 minutes (responsive)
✅ **Security**: Secret-based authentication
✅ **Monitoring**: Comprehensive logging
✅ **Cost-effective**: Optimized frequency

The cron jobs will run automatically on Vercel's servers, even when no users are browsing your site. This ensures your background processes continue working 24/7.

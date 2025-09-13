# Email Reminder System

This system automatically sends email notifications to sellers about pending receipts, even when they're logged out. It respects each seller's email notification frequency settings.

## Features

- ✅ **Server-side email notifications** - Works even when sellers are logged out
- ✅ **Respects frequency settings** - Honors each seller's notification preferences (30s, 30m, 1h, off)
- ✅ **Smart interval adjustment** - Service automatically adjusts check frequency based on seller preferences
- ✅ **Automatic background service** - Runs continuously to check for pending receipts
- ✅ **Production ready** - Works on both local development and Vercel deployment
- ✅ **Graceful error handling** - Retries failed requests and handles network issues
- ✅ **Real-time monitoring** - Logs service status and interval changes

## Components

### 1. API Endpoint
- **File**: `src/app/api/notifications/send-reminders/route.js`
- **Purpose**: Processes all sellers and sends email reminders based on their settings
- **Method**: POST

### 2. Background Services
- **File**: `email-reminder-service.js` - Basic service (fixed 30-second intervals)
- **File**: `smart-email-reminder-service.js` - Smart service (dynamic intervals)
- **Purpose**: Runs continuously and adjusts check frequency based on seller preferences
- **Usage**: `npm run smart-reminders` (recommended)

### 3. Test Script
- **File**: `test-email-reminders.js`
- **Purpose**: Tests the email reminder system
- **Usage**: `npm run test-reminders`

## Setup Instructions

### Local Development

1. **Start the Next.js server**:
   ```bash
   npm run dev
   ```

2. **Start the smart email reminder service** (in a separate terminal):
   ```bash
   npm run smart-reminders
   ```
   
   Or use the basic service:
   ```bash
   npm run email-reminders
   ```

3. **Test the system**:
   ```bash
   npm run test-reminders
   ```

### Production (Vercel)

#### Option 1: Vercel Cron Jobs (Recommended)

1. **Add to `vercel.json`**:
   ```json
   {
     "crons": [
       {
         "path": "/api/notifications/send-reminders",
         "schedule": "* * * * *"
       }
     ]
   }
   ```

2. **Deploy to Vercel** - The cron job will automatically call the API every minute

#### Option 2: External Cron Service

Use services like:
- **Cron-job.org**: Set up a cron job to call `https://your-app.vercel.app/api/notifications/send-reminders`
- **Uptime Robot**: Monitor and ping the endpoint
- **GitHub Actions**: Set up scheduled workflows

#### Option 3: Background Service (VPS/Server)

If you have a VPS or server:

1. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   ```

2. **Start the service**:
   ```bash
   pm2 start email-reminder-service.js --name "email-reminders"
   ```

3. **Make it persistent**:
   ```bash
   pm2 startup
   pm2 save
   ```

## How It Works

### Email Frequency Logic

The system respects each seller's notification frequency:

- **30 seconds**: Sends email every 30 seconds if there are pending receipts
- **30 minutes**: Sends email every 30 minutes if there are pending receipts  
- **1 hour**: Sends email every hour if there are pending receipts
- **Off**: No emails sent

### Process Flow

#### Smart Service (Recommended)
1. **Service starts** with initial 30-second interval
2. **API endpoint** is called to check for pending receipts
3. **Service analyzes** seller frequency preferences from API response
4. **Interval adjustment**:
   - If any seller has "30s" setting → Service runs every 30 seconds
   - If sellers have "30m" or "1h" → Service runs every 30 seconds (API handles frequency)
   - If all sellers have "off" → Service runs every 5 minutes
5. **For each seller**:
   - Check if they have pending receipts
   - Verify if enough time has passed since last email (based on frequency)
   - Send email if conditions are met
6. **Email sent** with receipt details and dashboard link
7. **Service continues** with optimized interval

#### Basic Service
1. **Service starts** and runs every 30 seconds (fixed)
2. **API endpoint** is called to check for pending receipts
3. **Database query** finds all sellers with email notifications enabled
4. **For each seller**:
   - Check if they have pending receipts
   - Verify if enough time has passed since last email (based on frequency)
   - Send email if conditions are met
5. **Email sent** with receipt details and dashboard link
6. **Service continues** running in background

### Email Content

Each email includes:
- Number of pending receipts
- Receipt details (amount, buyer, product, upload date)
- Direct link to seller dashboard
- Current notification frequency setting
- Professional HTML formatting

## Environment Variables

Make sure these are set in your `.env` file:

```env
# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# App URL (for dashboard links in emails)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Database
DATABASE_URL=your-database-url
```

## Monitoring

### Logs

The service provides detailed logging:
- ✅ Successful email sends
- 📊 Summary statistics
- ❌ Error handling
- 🔄 Retry attempts

### Health Check

You can check if the service is working by calling:
```bash
curl -X POST http://localhost:3000/api/notifications/send-reminders
```

## Troubleshooting

### Common Issues

1. **Service not starting**:
   - Check if Next.js server is running
   - Verify API endpoint is accessible
   - Check environment variables

2. **No emails being sent**:
   - Verify email configuration in `.env`
   - Check if sellers have pending receipts
   - Ensure frequency settings are not "off"

3. **Too many emails**:
   - Check frequency settings in seller dashboard
   - Verify the service isn't running multiple instances

### Testing

Use the test script to verify everything works:
```bash
npm run test-reminders
```

This will:
- Call the API endpoint
- Show summary of emails sent
- Display any errors

## Security

- API endpoint doesn't require authentication (internal use)
- Email content doesn't include sensitive information
- Service respects user privacy settings
- Graceful error handling prevents data leaks

## Performance

- **Efficient database queries** - Only fetches necessary data
- **Rate limiting** - Respects frequency settings to prevent spam
- **Error handling** - Continues running even if individual emails fail
- **Memory management** - Cleans up connections properly

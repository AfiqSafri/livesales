# Pending Receipt Reminder System

This system sends email reminders to sellers every 30 seconds when they have pending receipts that need approval or rejection.

## Features

- **30-Second Intervals**: Automatic email reminders every 30 seconds
- **Smart Throttling**: Prevents email spam by tracking last reminder times
- **Detailed Email Templates**: Professional email templates with receipt details
- **Multiple Implementation Methods**: Client-side, server-side, and standalone service

## Implementation Methods

### 1. Client-Side (Browser)
The seller dashboard automatically checks for pending receipts every 30 seconds when a seller is logged in.

**Location**: `src/app/seller/dashboard/page.js`
- Runs in the browser when seller dashboard is open
- Automatically stops when seller logs out or closes browser

### 2. Server-Side API
Manual API calls to trigger reminder checks.

**Endpoint**: `POST /api/receipt/reminder-30s`
```bash
curl -X POST http://localhost:3001/api/receipt/reminder-30s \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Standalone Service
Independent Node.js service that runs continuously.

**File**: `reminder-service.js`
```bash
node reminder-service.js
```

### 4. Cron Job
Set up a cron job to run every 30 seconds.

```bash
# Add to crontab (crontab -e)
* * * * * /usr/bin/node /path/to/reminder-service.js
* * * * * sleep 30; /usr/bin/node /path/to/reminder-service.js
```

## Email Template Features

- **Professional Design**: Clean, modern email layout
- **Receipt Summary**: Shows up to 5 pending receipts with details
- **Action Required**: Clear call-to-action sections
- **Dashboard Link**: Direct link to seller dashboard
- **Reminder Frequency Info**: Explains the 30-second interval
- **Mobile Responsive**: Works on all devices

## API Endpoints

### POST /api/receipt/reminder-30s
Triggers reminder check for all sellers with pending receipts.

**Response**:
```json
{
  "success": true,
  "message": "Reminder check completed. 2 reminders sent, 1 skipped",
  "summary": {
    "totalSellers": 3,
    "remindersSent": 2,
    "remindersSkipped": 1,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "results": [...]
}
```

### GET /api/receipt/reminder-30s?sellerId=123
Get pending receipts and reminder status for a specific seller.

**Response**:
```json
{
  "success": true,
  "sellerId": 123,
  "pendingCount": 2,
  "pendingReceipts": [...],
  "reminderStatus": {
    "lastReminderSent": "2024-01-15T10:29:30.000Z",
    "timeSinceLastReminder": 15000,
    "nextReminderIn": 15000,
    "canSendReminder": false
  }
}
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_BASE_URL`: Base URL for the application
- `EMAIL_SERVER_USER`: Email server username
- `EMAIL_SERVER_PASSWORD`: Email server password

### Email Settings
The system uses the existing email configuration from `src/utils/email.js`:
- Gmail SMTP service
- Professional email templates
- Error handling and logging

## Testing

### Test the Reminder System
```bash
node test-reminder.js
```

### Test Email Templates
1. Upload a receipt as a buyer
2. Check seller's email for initial notification
3. Wait 30 seconds for reminder email
4. Verify reminder contains pending receipt details

## How It Works

1. **Detection**: System checks for sellers with pending receipts
2. **Throttling**: Only sends reminders if 30+ seconds have passed since last reminder
3. **Email Generation**: Creates professional email with receipt details
4. **Delivery**: Sends email via configured SMTP service
5. **Logging**: Logs all activities for monitoring

## Email Content

Each reminder email includes:
- **Header**: Clear "Pending Receipt Reminder" title
- **Summary**: Number of pending receipts
- **Receipt List**: Up to 5 receipts with buyer, product, amount, date
- **Action Required**: Urgent call-to-action section
- **Quick Actions**: Direct link to seller dashboard
- **Reminder Info**: Explains 30-second frequency
- **Professional Footer**: Livesalez branding

## Monitoring

The system provides detailed logging:
- Console logs for all reminder activities
- Email delivery status tracking
- Error handling and reporting
- Performance metrics

## Security

- **Rate Limiting**: 30-second minimum between reminders per seller
- **Error Handling**: Graceful failure without breaking the system
- **Logging**: Comprehensive activity logging
- **Validation**: Proper input validation and sanitization

## Troubleshooting

### Common Issues

1. **No Emails Sent**
   - Check email credentials in environment variables
   - Verify SMTP settings
   - Check console logs for errors

2. **Too Many Emails**
   - System has built-in 30-second throttling
   - Check if multiple services are running

3. **Service Not Running**
   - Verify the reminder service is started
   - Check for JavaScript errors
   - Ensure API endpoints are accessible

### Debug Commands

```bash
# Test API endpoint
curl -X POST http://localhost:3001/api/receipt/reminder-30s

# Check specific seller
curl "http://localhost:3001/api/receipt/reminder-30s?sellerId=1"

# Run test script
node test-reminder.js
```

## Production Deployment

For production deployment:

1. **Use Cron Job**: Set up proper cron job for reliability
2. **Monitor Logs**: Set up log monitoring and alerting
3. **Email Limits**: Consider email service rate limits
4. **Database Optimization**: Ensure proper database indexing
5. **Error Handling**: Set up error reporting and monitoring

The system is designed to be robust and production-ready with proper error handling and monitoring capabilities.

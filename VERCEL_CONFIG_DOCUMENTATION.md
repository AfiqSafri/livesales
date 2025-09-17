# VERCEL CONFIGURATION DOCUMENTATION

## vercel.json Configuration

The `vercel.json` file configures automated background processes (cron jobs) that run on Vercel's servers without requiring user interaction or browser access.

### Current Configuration

```json
{
  "crons": [
    {
      "path": "/api/notifications/send-reminders",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/auto-cancel?secret=59d385b8d97afc714e32c5aeab2de1fffcf01eed01c68f85523f6ba44647a041",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

### Cron Jobs Explained

#### 1. Email Reminders - Every 5 minutes
- **Path**: `/api/notifications/send-reminders`
- **Schedule**: `*/5 * * * *` (every 5 minutes)
- **Purpose**: 
  - Checks for sellers with pending receipts
  - Sends email notifications based on individual frequency preferences
  - Respects seller settings (30s, 30m, 1h, off)

#### 2. Auto-Cancel Orders - Every 2 minutes
- **Path**: `/api/cron/auto-cancel?secret=...`
- **Schedule**: `*/2 * * * *` (every 2 minutes)
- **Purpose**:
  - Cancels unpaid orders older than 3 minutes
  - Restores inventory quantities
  - Sends cancellation emails to buyers
  - Includes security secret for authentication

### Schedule Format

The cron schedule uses the format: `"* * * * *"`
```
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0=Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

### Production Benefits

- **Runs 24/7** without user interaction
- **Automatic email notifications** for pending receipts
- **Clean inventory management** through auto-cancellation
- **Professional user experience** with timely notifications
- **Cost-effective serverless execution** on Vercel

### Security Features

- **Secret Authentication**: Auto-cancel endpoint requires secret parameter
- **Environment Variables**: Sensitive data stored in Vercel environment
- **Input Validation**: All endpoints validate inputs and permissions

### Monitoring

- **Vercel Dashboard**: View cron job execution logs and performance
- **Function Logs**: Comprehensive console logging for debugging
- **Health Checks**: Built-in status reporting and error handling

### Troubleshooting

If cron jobs fail:
1. Check Vercel dashboard for error logs
2. Verify API endpoints are working manually
3. Ensure environment variables are set correctly
4. Check database connectivity
5. Verify email service configuration

### Deployment Notes

- **JSON Format**: `vercel.json` must be valid JSON (no comments allowed)
- **Path Validation**: Ensure all API paths exist and are accessible
- **Environment**: Set required environment variables in Vercel dashboard
- **Testing**: Test endpoints manually before relying on cron jobs

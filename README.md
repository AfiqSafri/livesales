# Livesalez - Live Sales Platform

A comprehensive e-commerce platform with order tracking, guest checkout, and email notifications.

## Features

- **Guest Checkout**: Buyers can place orders without registration
- **Order Tracking**: Real-time order status updates with courier integration
- **Email Notifications**: Automatic email confirmations for orders
- **Seller Dashboard**: Complete order management for sellers
- **Mobile Responsive**: Works perfectly on all devices

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Configuration

To enable email notifications, add these environment variables to your `.env` file:

```env
# Email Configuration (for order notifications)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
NEXTAUTH_URL="http://localhost:3000"
```

### Gmail App Password Setup

For Gmail, you'll need to use an App Password instead of your regular password:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to your Google Account settings: [myaccount.google.com](https://myaccount.google.com)
   - Navigate to **Security** > **2-Step Verification**
   - Click "Turn on 2-step verification" if not already enabled
   - Set up at least one verification method (Google prompt, phone number, or authenticator app)

2. **Generate App Password**
   - Go to **Security** > **App passwords**
   - Select "Mail" as the app
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

3. **Use in Environment**
   - Replace `your-app-password` with the generated app password
   - Keep this password secure and don't commit it to version control
   - The app password is different from your regular Gmail password

### Email Features

The application sends automatic email notifications for:
- ✅ **Order Confirmations** - Sent to buyers when orders are placed
- ✅ **Payment Confirmations** - Sent to buyers when payments are successful
- ✅ **Seller Notifications** - Sent to sellers when new orders are received
- ✅ **Order Status Updates** - Sent when order status changes
- ✅ **Payment Failure Alerts** - Sent when payments fail
- ✅ **Order Cancellation Notifications** - Sent when orders are automatically cancelled

### Auto-Cancel System

The application includes an automatic order cancellation system:

- ⏰ **10-Minute Payment Timer** - Orders are automatically cancelled if payment is not completed within 10 minutes
- 🔄 **Stock Restoration** - Product quantities are automatically restored when orders are cancelled
- 📧 **Email Notifications** - Buyers receive cancellation notifications via email
- 📊 **Status Tracking** - All cancellations are logged in order status history

#### Setting up Auto-Cancel Cron Job

To enable automatic order cancellation, set up a cron job to call the cancellation endpoint every minute:

```bash
# Add to your crontab (crontab -e)
* * * * * curl -X GET 'https://your-domain.com/api/cron/auto-cancel?secret=your-cron-secret'
```

Or use a service like:
- **Vercel Cron Jobs** (if deploying on Vercel)
- **GitHub Actions** (for GitHub-hosted projects)
- **AWS Lambda** (for AWS deployments)

#### Environment Variables

Add to your `.env` file:
```env
CRON_SECRET="your-secure-cron-secret"
```

**Note**: For Gmail, you'll need to use an App Password instead of your regular password.

## Guest Checkout Flow

1. Buyer clicks seller's share link
2. Views product details
3. Fills order form (name, email, phone, address)
4. Places order without registration
5. Receives email confirmation
6. Seller gets email notification
7. Order tracking available

## Order Management System

- **Status Tracking**: Pending → Paid → Processing → Ready to Ship → Shipped → Delivered
- **Email Notifications**: Automatic updates for buyers and sellers
- **Courier Integration**: Simulated courier API for realistic tracking
- **Status History**: Complete audit trail of all order changes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

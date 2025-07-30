# Billplz Payment Gateway Setup

This guide will help you set up Billplz payment gateway for testing in your LiveSales application.

## Prerequisites

1. **Billplz Account**: Sign up at [billplz.com](https://www.billplz.com)
2. **API Key**: Get your API key from Billplz dashboard
3. **Collection ID**: Create a collection in Billplz dashboard

## Environment Variables

Add these variables to your `.env` file:

```env
# Billplz Configuration
BILLPLZ_API_KEY="your-billplz-api-key"
BILLPLZ_COLLECTION_ID="your-billplz-collection-id"
BILLPLZ_SANDBOX=true
```

## Setup Steps

### 1. Get Billplz API Key

1. Log in to your Billplz account
2. Go to Settings → API Keys
3. Generate a new API key
4. Copy the API key to your `.env` file

### 2. Create Collection

1. In Billplz dashboard, go to Collections
2. Create a new collection
3. Copy the Collection ID to your `.env` file

### 3. Configure Callback URL

1. In your Billplz collection settings
2. Set the callback URL to: `https://your-domain.com/api/payment/billplz/callback`
3. For local testing: `http://localhost:3000/api/payment/billplz/callback`

### 4. Test Payment Flow

1. Start your development server: `npm run dev`
2. Create a test product
3. Place an order
4. Click "Pay with Billplz"
5. Complete payment on Billplz page
6. Check order status in seller dashboard

## Testing

### Sandbox Mode
- Set `BILLPLZ_SANDBOX=true` for testing
- Use test payment methods provided by Billplz
- No real money will be charged

### Production Mode
- Set `BILLPLZ_SANDBOX=false` for production
- Real payments will be processed
- Ensure proper SSL certificates

## Payment Flow

1. **Buyer places order** → Order created with `pending` status
2. **Buyer clicks "Pay with Billplz"** → Billplz bill created
3. **Buyer redirected to Billplz** → Secure payment page
4. **Payment completed** → Billplz sends callback to our API
5. **Order status updated** → Payment status changed to `paid`
6. **Email notification sent** → Buyer receives confirmation

## API Endpoints

- `POST /api/payment/billplz/create` - Create Billplz bill
- `POST /api/payment/billplz/callback` - Handle payment notifications

## Database Changes

The following fields were added to the `Order` model:
- `billplzBillId` - Billplz bill ID
- `billplzPaid` - Payment completion status

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your API key is correct
2. **Collection ID Error**: Verify collection ID exists
3. **Callback Not Working**: Check callback URL configuration
4. **Payment Not Updating**: Verify callback endpoint is accessible

### Debug Mode

Enable debug logging by adding:
```env
DEBUG=true
```

## Security Notes

1. **API Key Security**: Never commit API keys to version control
2. **Callback Verification**: Implement signature verification for production
3. **HTTPS Required**: Use HTTPS in production for secure callbacks
4. **Error Handling**: Implement proper error handling for failed payments

## Support

For Billplz support:
- [Billplz Documentation](https://www.billplz.com/api)
- [Billplz Support](https://www.billplz.com/support)

For application support:
- Check the application logs
- Verify environment variables
- Test with sandbox mode first 
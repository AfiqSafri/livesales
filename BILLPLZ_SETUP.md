# Multi-Gateway Payment Integration Setup

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:5432/livesales4"

# Email Configuration (for order notifications)
EMAIL_USER="livesalez1@gmail.com"
EMAIL_PASS="jpbk crea asps thii"
NEXTAUTH_URL="http://localhost:3000"

# Base URL for the application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

CRON_SECRET="59d385b8d97afc714e32c5aeab2de1fffcf01eed01c68f8553f6ba44647a041"

# Billplz Payment Gateway Configuration
BILLPLZ_API_KEY="your_billplz_api_key_here"
BILLPLZ_COLLECTION_ID="your_billplz_collection_id_here"
BILLPLZ_X_SIGNATURE_KEY="your_billplz_x_signature_key_here"
BILLPLZ_BASE_URL="https://www.billplz-sandbox.com/api/v3"

# FPX (Financial Process Exchange) Configuration
FPX_API_KEY="your_fpx_api_key_here"
FPX_MERCHANT_ID="your_fpx_merchant_id_here"
FPX_BASE_URL="https://test.fpx.com.my/api"

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# PayPal Configuration (Optional)
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"
```

## Supported Payment Gateways

### 1. Billplz
- **Type**: Malaysian payment gateway
- **Features**: Credit cards, online banking, e-wallets
- **Setup**: Requires Billplz account and API credentials
- **Status**: ✅ Enabled by default

### 2. FPX (Financial Process Exchange)
- **Type**: Malaysian online banking
- **Features**: Direct bank transfers from major Malaysian banks
- **Supported Banks**: Maybank, CIMB, Public Bank, AmBank, and more
- **Status**: ✅ Enabled by default

### 3. Stripe
- **Type**: International payment processor
- **Features**: Credit cards, digital wallets
- **Status**: ⚠️ Disabled by default (enable in code)

### 4. PayPal
- **Type**: International payment processor
- **Features**: PayPal accounts, credit cards
- **Status**: ⚠️ Disabled by default (enable in code)

## Account Setup

### Billplz Account Setup
1. **Create Billplz Account**
   - Go to [Billplz](https://www.billplz.com)
   - Sign up for a business account
   - Complete account verification

2. **Get API Credentials**
   - Log into your Billplz dashboard
   - Go to Settings > API Keys
   - Generate a new API key
   - Copy the API key to `BILLPLZ_API_KEY`

3. **Create Collection**
   - Go to Collections in your dashboard
   - Create a new collection for "Livesalez Payments"
   - Copy the Collection ID to `BILLPLZ_COLLECTION_ID`

4. **Get X-Signature Key**
   - Go to Settings > Webhook
   - Copy the X-Signature Key to `BILLPLZ_X_SIGNATURE_KEY`

### FPX Account Setup
1. **Register with FPX**
   - Contact FPX for merchant registration
   - Complete merchant verification process
   - Get merchant credentials

2. **Configure FPX Settings**
   - Set `FPX_API_KEY` with your FPX API key
   - Set `FPX_MERCHANT_ID` with your merchant ID
   - Configure webhook URLs for payment notifications

## Testing

### Test URLs
- **Multi-Gateway Test Page**: `http://localhost:3000/payment-test-multi-gateway`
- **FPX Simulation**: `http://localhost:3000/payment/fpx/test`
- **API Endpoint**: `POST /api/payment/test-multi-gateway`

### Test Scripts
Run the test script to verify all payment gateways:
```bash
node test-multi-gateway-payment.js
```

### Test Data
Use these test credentials for development:
- **Product ID**: 1, 2, 3
- **Buyer ID**: 1
- **Test Amounts**: RM 28.00, RM 56.00, RM 140.00
- **Test Banks**: MBB0228 (Maybank), PBB0233 (Public Bank), CIT0219 (Citibank)

## Payment Flow

### Multi-Gateway Payment Process
1. **User selects payment method** from available gateways
2. **For FPX**: User selects their bank from the list
3. **Payment request is created** via API
4. **Gateway-specific processing** occurs:
   - Billplz: Creates bill and redirects to payment page
   - FPX: Redirects to selected bank's payment page
5. **Payment is processed** on the gateway
6. **Callback/webhook** is received when payment completes
7. **Order is updated** with payment status

### FPX Bank List
The system supports all major Malaysian banks:
- **Maybank** (MBB0228, MB2U0227)
- **CIMB Bank** (BCBB0235)
- **Public Bank** (PBB0233)
- **AmBank** (AMBB0209)
- **Hong Leong Bank** (HLB0224)
- **RHB Bank** (RHB0218)
- **And 12+ more banks**

## API Endpoints

### Multi-Gateway Payment API
- **GET** `/api/payment/test-multi-gateway` - Get available gateways
- **POST** `/api/payment/test-multi-gateway` - Create test payment

### Request Format
```json
{
  "productId": 1,
  "quantity": 2,
  "buyerId": 1,
  "buyerName": "Test Buyer",
  "buyerEmail": "test@example.com",
  "shippingAddress": "123 Test Street, KL",
  "phone": "+60123456789",
  "totalAmount": 56.00,
  "paymentGateway": "fpx",
  "fpxBankCode": "MBB0228"
}
```

### Response Format
```json
{
  "success": true,
  "paymentUrl": "https://payment.gateway.com/pay/...",
  "paymentId": 123,
  "orderId": 456,
  "reference": "FPX_TEST_1_1234567890_abc123",
  "gateway": "fpx",
  "amount": 56.00
}
```

## Security Features

- **Signature Verification**: All webhooks are verified using HMAC-SHA256
- **Payment Status Tracking**: All payments are tracked in the database
- **Error Handling**: Comprehensive error handling and user feedback
- **Test Mode**: Separate test environment for development

## Database Schema

The payment system uses these database tables:
- **Payment**: Stores payment records and gateway information
- **Order**: Links payments to product orders
- **User**: Updated with payment history

## Troubleshooting

### Common Issues
1. **Payment not creating**: Check API keys and gateway configuration
2. **FPX bank selection**: Verify bank codes are correct
3. **Webhook not working**: Verify signature keys and callback URLs
4. **Test mode issues**: Ensure using test credentials, not production

### Error Messages
- **"Unauthorized"**: Invalid API key or credentials
- **"Invalid gateway"**: Gateway not enabled or configured
- **"Missing required fields"**: Required parameters not provided
- **"Bank not found"**: Invalid FPX bank code

## Production Deployment

### Environment Variables
Update your production environment with real credentials:
```env
BILLPLZ_API_KEY="your_production_billplz_key"
BILLPLZ_BASE_URL="https://www.billplz.com/api/v3"
FPX_API_KEY="your_production_fpx_key"
FPX_BASE_URL="https://www.fpx.com.my/api"
```

### Webhook Configuration
Configure webhooks in your payment gateway dashboards:
- **Billplz**: `https://yourdomain.com/api/payment/callback`
- **FPX**: `https://yourdomain.com/api/payment/fpx/callback`

### SSL Certificate
Ensure your domain has a valid SSL certificate for secure payment processing. 
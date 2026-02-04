# M-Pesa STK Push Checkout Integration Guide

This is a complete M-Pesa STK Push checkout page for Kenyan e-commerce sites built with Next.js, shadcn/ui, and Tailwind CSS.

## Features

✅ **M-Pesa STK Push Form**
- Phone number field with +254 Kenyan format validation
- Amount input with min/max constraints
- Real-time validation and error messages
- Accessible form design with icons and labels

✅ **Backend API Routes**
- OAuth 2.0 token generation using Safaricom Daraja API
- Base64-encoded password generation for STK push
- Secure communication with M-Pesa endpoints
- Callback handling for payment status

✅ **Polling System**
- Real-time payment status checking
- "Waiting for PIN entry..." loading state
- 2-minute timeout with elapsed time tracking
- Payment confirmation with transaction details

✅ **Step-by-Step UI**
- Mobile-first responsive design
- 3-step checkout flow (Enter Details → Confirm PIN → Complete)
- Order summary display
- Security badges and encryption info
- Professional branding with ANONYMIKETECH

## Environment Variables Setup

Add these environment variables to your Vercel project. Get these from [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke/):

```bash
# From your sandbox app credentials
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here

# From M-PESA EXPRESS product in Test Credentials
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=your_shortcode_here

# Optional: Set your app URL for callbacks
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Where to Find These Credentials

1. **Consumer Key & Consumer Secret**:
   - Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
   - Log in to your account
   - Navigate to **My Apps** → Select your app (e.g., ANONYMIKETECH)
   - Copy the Consumer Key and Consumer Secret

2. **Shortcode & Passkey**:
   - In the same app view
   - Look for **Products** section
   - Click on **M-PESA EXPRESS Sandbox**
   - The Business Shortcode will be displayed (usually 6 digits)
   - Go to **Test Credentials** in the left sidebar
   - Copy your Passkey

## Project Structure

```
/app
  /api
    /mpesa
      /token/route.ts          # Generate OAuth tokens
      /stk-push/route.ts       # STK push request handler
      /callback/route.ts       # Webhook callback & status polling
  /page.tsx                    # Main checkout page
  /layout.tsx                  # App layout with metadata

/components
  /checkout-page.tsx           # Main checkout component with step flow
  /mpesa-form.tsx              # Form for phone & amount input
  /payment-status-poller.tsx   # Real-time payment status component
  /ui                          # shadcn/ui components (pre-installed)
```

## How It Works

### 1. Form Submission (Step 1)
- User enters phone number (with +254 validation)
- User enters amount (1 - 999,999 KES)
- Form validates and sends to `/api/mpesa/stk-push`

### 2. STK Push Request (Backend)
The API route:
- Gets OAuth token from Safaricom
- Generates Base64 password using: `Base64(Shortcode + Passkey + Timestamp)`
- Sends POST request to `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
- Returns `CheckoutRequestID` to frontend

### 3. Payment Polling (Step 2)
- Frontend polls `/api/mpesa/callback?checkoutRequestId=...` every 3 seconds
- Shows "Waiting for PIN entry..." state
- User enters M-Pesa PIN on their phone
- Once confirmed, polling detects completion

### 4. Success Page (Step 3)
- Displays payment confirmation with receipt details
- Shows transaction reference and M-Pesa receipt number
- Option to make another payment

## Testing with Sandbox

The app uses Safaricom's **Sandbox** environment for testing:

- **Endpoint**: `https://sandbox.safaricom.co.ke/`
- **Test Phone Numbers**: Use any format like +254712345678
- **Typical Flow**:
  1. Enter test phone number and amount
  2. Receive STK prompt on your test M-Pesa account
  3. Enter test PIN to confirm
  4. Payment appears as completed

## API Endpoints

### POST /api/mpesa/token
Generates OAuth access token.

```bash
curl -X POST http://localhost:3000/api/mpesa/token
```

Response:
```json
{
  "accessToken": "...",
  "expiresIn": 3599
}
```

### POST /api/mpesa/stk-push
Initiates STK push request.

```bash
curl -X POST http://localhost:3000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254712345678",
    "amount": "5000",
    "accountReference": "ANONYMIKETECH",
    "transactionDesc": "Payment for goods and services"
  }'
```

Response:
```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_DMZ_12321_2024...",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "message": "STK push sent successfully. Check your phone for the prompt."
}
```

### GET /api/mpesa/callback?checkoutRequestId=...
Checks payment status.

```bash
curl http://localhost:3000/api/mpesa/callback?checkoutRequestId=ws_CO_DMZ_...
```

Response (pending):
```json
{
  "status": "pending",
  "message": "Waiting for payment confirmation..."
}
```

Response (completed):
```json
{
  "status": "completed",
  "resultCode": 0,
  "resultDesc": "The service request has been processed successfully.",
  "data": {
    "MpesaReceiptNumber": "QQZ7W6BEAA",
    "ItemChosenIdentifier": "1",
    "Amount": "5000"
  },
  "timestamp": "2024-02-04T12:34:56.000Z"
}
```

## Customization

### Change Brand Name
In `/components/checkout-page.tsx` and `/components/mpesa-form.tsx`, replace `ANONYMIKETECH` with your business name.

### Adjust Colors
The M-Pesa green color is `#1BA839`. Update in:
- `/components/mpesa-form.tsx`
- `/components/checkout-page.tsx`
- `/components/payment-status-poller.tsx`

### Add Database Integration
Replace the in-memory Map in `/app/api/mpesa/callback/route.ts` with a proper database:

```typescript
// Instead of:
const paymentStatuses = new Map<string, any>();

// Use Supabase, Neon, or MongoDB:
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  await db.payments.create({
    checkoutRequestId: body.Body?.stkCallback?.CheckoutRequestID,
    status: 'completed',
    resultCode: body.Body?.stkCallback?.ResultCode,
    // ...
  });
}
```

## Production Deployment

Before going live:

1. **Switch to Production Credentials**
   - Go to Safaricom Daraja: Select your app → **Go Live**
   - Replace `MPESA_CONSUMER_KEY/SECRET` with production values
   - Update `MPESA_SHORTCODE` and `MPESA_PASSKEY` to production

2. **Update Callback URL**
   - In your Daraja app settings, set callback URL to:
   ```
   https://your-production-domain.com/api/mpesa/callback
   ```

3. **Use Production Endpoint**
   - Change all `sandbox.safaricom.co.ke` URLs to `api.safaricom.co.ke`
   - Update in `/app/api/mpesa/stk-push/route.ts` and `/app/api/mpesa/token/route.ts`

4. **Add Database**
   - Implement proper database for payment records (use Supabase, Neon, etc.)
   - Enable Row Level Security (RLS) for transactions

5. **Security Headers**
   - Add HSTS headers in `next.config.mjs`
   - Implement rate limiting for API endpoints
   - Add CSRF protection

## Troubleshooting

### "Missing M-Pesa credentials" Error
- Check that environment variables are set in Vercel dashboard
- Go to Settings → Environment Variables
- Verify all 4 variables are present

### "Failed to generate access token"
- Verify Consumer Key and Secret are correct
- Check that your app is in sandbox/active state
- Ensure you're using the correct Daraja API endpoint

### "STK push failed" Error
- Verify phone number format: must be +254 followed by 9 digits
- Check amount is between 1-999999
- Ensure your Shortcode and Passkey are correct
- Check that you have SMS balance on your M-Pesa account

### Payment Not Showing in Polling
- The callback endpoint stores data in-memory (check console logs)
- In production, implement database storage for callbacks
- Ensure callback URL is correctly set in Daraja app settings
- Check browser console for polling errors

## Support

For issues with:
- **M-Pesa Integration**: [Safaricom Daraja Support](https://support.safaricom.co.ke/)
- **Next.js/shadcn/ui**: Check the v0 documentation
- **Deployment**: [Vercel Support](https://vercel.com/help)

## License

This template is provided as-is for integration with Safaricom M-Pesa STK Push.

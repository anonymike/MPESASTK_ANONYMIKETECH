# M-Pesa Callback Fix Guide

## Why Was Your Transaction Reversed?

When M-Pesa initiates an STK push and the customer enters their PIN, M-Pesa sends a callback to your `CallbackURL`. If the callback isn't properly acknowledged within the required timeframe, M-Pesa reverses the transaction automatically.

### Common Reasons for Reversal:

1. **Callback URL Not Accessible** - M-Pesa couldn't reach your callback endpoint
2. **Invalid Response Format** - Server didn't return the expected JSON response
3. **Timeout** - Server took too long to respond
4. **Network Issues** - Connection dropped before acknowledgment

## What Was Fixed

### 1. Callback Acknowledgment Format
The callback route now returns the correct M-Pesa acknowledgment:
```json
{
  "ResultCode": 0,
  "ResultDesc": "Callback received successfully"
}
```

### 2. Proper Callback Parsing
The callback handler now correctly extracts:
- CheckoutRequestID
- ResultCode (0 = success, non-zero = failure)
- ResultDesc (description of result)
- CallbackMetadata (payment details)

### 3. Better Error Handling
Even if there's an error processing the callback, the server returns a 200 status code so M-Pesa knows the callback was received.

## Critical Environment Variables

Make sure these are set correctly in your Vars:

1. **MPESA_CONSUMER_KEY** - From your Daraja app
2. **MPESA_CONSUMER_SECRET** - From your Daraja app
3. **MPESA_SHORTCODE** - `174379`
4. **MPESA_PASSKEY** - `bffb279f9aa9bdcf158e97dd71a467cd2e0c893059b10f78e6b72adafed2c919`
5. **NEXT_PUBLIC_APP_URL** - Your deployed app URL (e.g., https://your-app.vercel.app)

## What Happens During a Successful Transaction

1. **User submits form** with phone number and amount
2. **STK Push Request** is sent to M-Pesa with:
   - OAuth Access Token (generated from Consumer Key/Secret)
   - Password (Base64: shortcode + passkey + timestamp)
   - Phone number and amount
   - Callback URL
3. **M-Pesa sends STK prompt** to user's phone
4. **User enters PIN**
5. **M-Pesa sends callback** to your `/api/mpesa/callback` endpoint
6. **Your server acknowledges** with `{"ResultCode": 0, "ResultDesc": "Callback received successfully"}`
7. **M-Pesa confirms transaction** and completes the payment
8. **Frontend receives update** via polling and shows success screen

## Testing in Sandbox

Use the official Safaricom test phone number: **254708374149**

This number will always prompt for PIN entry in sandbox mode.

## Next Steps

1. Update **MPESA_PASSKEY** environment variable with the correct value
2. Ensure **NEXT_PUBLIC_APP_URL** points to your deployed Vercel app
3. Test the transaction again
4. Monitor the server logs to see the callback being received

## Debugging Tips

Check your Vercel logs for:
- `[v0] M-Pesa STK Callback received` - Confirms callback arrived
- `[v0] Callback details` - Shows ResultCode and description
- `[v0] Payment metadata` - Shows the payment details extracted

If you don't see these logs, the callback isn't reaching your server. Check:
- Is NEXT_PUBLIC_APP_URL correct?
- Is your app deployed on Vercel?
- Is the callback URL publicly accessible?

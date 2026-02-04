# M-Pesa STK Push Checkout - Testing Guide

## Overview
This guide helps you test the M-Pesa STK Push integration with sandbox credentials.

## Prerequisites
1. ✅ All environment variables configured in Vercel project Vars:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_PASSKEY`
   - `MPESA_SHORTCODE`
   - `NEXT_PUBLIC_APP_URL`

2. ✅ Sandbox credentials from Safaricom Daraja

## Testing Flow

### Step 1: Access the Checkout Page
1. Navigate to your app's home page
2. You should see the ANONYMIKETECH checkout page with:
   - Order summary (sample items)
   - Total amount in KES
   - Step indicator (1 → 2 → 3)

### Step 2: Enter Payment Details
1. **Phone Number**:
   - Should start with `+254`
   - Must have exactly 9 digits after the prefix
   - Example: `+254712345678`
   - Test numbers: Use your sandbox test phone numbers from Daraja

2. **Amount**:
   - Must be between 1 and 999,999 KES
   - Try different amounts to test validation
   - Example: `100`, `5000`, `999999`

### Step 3: Trigger STK Push
1. Click "Complete Payment" button
2. You should see:
   - Button shows "Processing..." with spinner
   - No errors displayed

3. Backend will:
   - Generate OAuth access token using Consumer Key/Secret
   - Create Base64 encoded password (Shortcode + Passkey + Timestamp)
   - Send STK push request to Daraja API
   - Receive CheckoutRequestID

### Step 4: Polling Phase
After successful STK push:
1. Page moves to Step 2: "Confirm PIN"
2. Shows "Waiting for PIN entry..." message
3. Displays phone number and amount
4. Polling system activates:
   - Polls status every 3 seconds
   - Maximum 2-minute timeout
   - Shows elapsed time

### Step 5: Payment Confirmation
The poller checks status via `/api/mpesa/callback?checkoutRequestId=...`

**Success (ResultCode 0)**:
- Page moves to Step 3: "Complete"
- Shows success message
- Displays payment confirmation details

**Failure (ResultCode ≠ 0)**:
- Shows error message
- Displays result description
- "Try Again" button appears

**Timeout**:
- After 2 minutes of waiting
- Shows "Payment request timed out" message

## Testing Checklist

### Validation Tests
- [ ] Empty phone number rejects submission
- [ ] Phone without +254 prefix rejected
- [ ] Phone with < 9 digits rejected
- [ ] Phone with > 9 digits rejected
- [ ] Empty amount rejects submission
- [ ] Amount of 0 rejected
- [ ] Amount > 999,999 rejected
- [ ] Valid phone and amount accepted

### API Tests
- [ ] Token endpoint returns valid access token
- [ ] STK push request succeeds with valid credentials
- [ ] STK push returns CheckoutRequestID
- [ ] Invalid credentials return proper error message
- [ ] Callback endpoint receives M-Pesa webhooks

### UI/UX Tests
- [ ] Step indicator updates correctly
- [ ] Loading states work during submission
- [ ] Error messages display clearly
- [ ] Success message shows after payment
- [ ] Polling animation displays
- [ ] Phone number formatted correctly on display
- [ ] Mobile responsive layout works
- [ ] ANONYMIKETECH branding visible

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Missing environment variables show error
- [ ] Invalid credentials show meaningful error
- [ ] Timeout after 2 minutes works
- [ ] Cancel button stops polling

## Common Issues & Solutions

### "Missing M-Pesa configuration" Error
**Issue**: One or more environment variables not set
**Solution**: Check Vercel Vars section for all 4 required variables

### "Failed to generate access token"
**Issue**: Invalid Consumer Key or Consumer Secret
**Solution**: Copy credentials directly from Daraja dashboard (My Apps → ANONYMIKETECH)

### STK Push doesn't trigger on phone
**Issue**: Invalid phone number or test phone not configured
**Solution**: Use phone numbers from Daraja test credentials, ensure +254 format

### Polling never completes
**Issue**: Callback not receiving M-Pesa webhook
**Solution**: 
- Check NEXT_PUBLIC_APP_URL is correct
- Verify callback URL is accessible from Daraja
- Check callback route logs for incoming requests

## Debugging Tips

1. **Check Browser Console**: Look for console errors or logs
2. **Check Network Tab**: 
   - `/api/mpesa/token` - Should return access token
   - `/api/mpesa/stk-push` - Should return CheckoutRequestID
   - `/api/mpesa/callback` - Should receive POST requests from M-Pesa

3. **Check Server Logs**: 
   - Look for `[v0]` prefixed debug messages
   - Check error messages and request details

4. **Test Token Separately**:
   ```bash
   curl -X POST http://localhost:3000/api/mpesa/token \
     -H "Content-Type: application/json"
   ```

## Sandbox Limitations

- Actual M-Pesa prompt may not appear on test phones
- Use test credentials provided by Safaricom
- Payment callbacks may be simulated
- Some transactions may fail for testing validation
- Timeouts and retries will work in sandbox

## Next Steps - Production Deployment

1. Switch to production credentials
2. Update API endpoint: `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
3. Update token endpoint: `https://api.safaricom.co.ke/oauth/v1/generate`
4. Update MPESA_SHORTCODE and MPESA_PASSKEY to production values
5. Implement database storage for payment records instead of in-memory Map
6. Add proper logging and monitoring
7. Test with real M-Pesa transactions
8. Deploy to production

## Support

For issues with:
- **Daraja API**: Visit https://developer.safaricom.co.ke
- **App Deployment**: Check https://vercel.com/docs
- **M-Pesa Technical**: Contact Safaricom support

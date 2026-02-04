import { NextRequest, NextResponse } from 'next/server';

interface STKPushRequest {
  phoneNumber: string;
  amount: string;
  accountReference: string;
  transactionDesc: string;
}

function generateTimestamp(): string {
  return new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  // Concatenate shortcode + trimmed passkey + timestamp with no spaces
  const str = shortcode + passkey.trim() + timestamp;
  // Base64-encode exactly once
  return Buffer.from(str).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body: STKPushRequest = await request.json();
    let { phoneNumber, amount, accountReference, transactionDesc } = body;

    // Validate input
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Phone number and amount are required' },
        { status: 400 }
      );
    }

    // Format phone number for M-Pesa API (remove + and ensure it starts with 254)
    phoneNumber = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');
    if (!phoneNumber.startsWith('254')) {
      phoneNumber = '254' + phoneNumber;
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!shortcode || !passkey || !consumerKey || !consumerSecret) {
      console.error('[v0] Missing M-Pesa configuration:', {
        hasShortcode: !!shortcode,
        hasPasskey: !!passkey,
        hasConsumerKey: !!consumerKey,
        hasConsumerSecret: !!consumerSecret,
      });
      return NextResponse.json(
        { error: 'Missing M-Pesa configuration' },
        { status: 500 }
      );
    }

    console.log('[v0] M-Pesa Config loaded:', {
      shortcode,
      passkeyLength: passkey.length,
      consumerKeyPrefix: consumerKey.substring(0, 10) + '...',
    });

    // Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[v0] Token error - Status:', tokenResponse.status, 'Response:', tokenData);
      console.error('[v0] This usually means the Consumer Key or Consumer Secret is incorrect');
      return NextResponse.json(
        { error: 'Failed to generate access token. Check your Consumer Key and Secret.' },
        { status: 500 }
      );
    }

    console.log('[v0] Token generated successfully');

    const accessToken = tokenData.access_token;
    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey.trim(), timestamp);
    
    console.log('[v0] Password generation:', {
      shortcode,
      passkeyTrimmed: passkey.trim().substring(0, 10) + '...',
      timestamp,
      passwordBase64: password.substring(0, 20) + '...',
    });

    // Prepare STK push request
    const stkPushRequest = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(parseFloat(amount)),
      PartyA: phoneNumber, // Format: 254XXXXXXXXXX
      PartyB: shortcode,
      PhoneNumber: phoneNumber, // Format: 254XXXXXXXXXX
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mpesa/callback`,
      AccountReference: accountReference || 'ANONYMIKETECH',
      TransactionDesc: transactionDesc || 'Payment for goods and services',
    };

    console.log('[v0] STK Push Request:', JSON.stringify(stkPushRequest, null, 2));

    // Send STK push request
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushRequest),
      }
    );

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      console.error('[v0] STK Push error:', stkData);
      return NextResponse.json(
        { error: stkData.errorMessage || 'STK push failed' },
        { status: stkResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription,
      message: 'STK push sent successfully. Check your phone for the prompt.',
    });
  } catch (error) {
    console.error('[v0] STK Push error:', error);
    return NextResponse.json(
      { error: 'Failed to process STK push request' },
      { status: 500 }
    );
  }
}

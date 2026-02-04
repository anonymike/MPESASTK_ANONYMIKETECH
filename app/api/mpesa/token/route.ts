import { NextResponse } from 'next/server';

export async function POST() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('[v0] Missing credentials:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
    });
    return NextResponse.json(
      { error: 'Missing M-Pesa credentials' },
      { status: 500 }
    );
  }

  console.log('[v0] Generating token with credentials:', {
    keyPrefix: consumerKey.substring(0, 10) + '...',
    secretPrefix: consumerSecret.substring(0, 10) + '...',
  });

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] OAuth token error:', data);
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error('[v0] Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}

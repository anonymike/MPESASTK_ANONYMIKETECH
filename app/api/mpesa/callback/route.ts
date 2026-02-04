import { NextRequest, NextResponse } from 'next/server';

// In production, you would store this in a database
const paymentStatuses = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] M-Pesa STK Callback received:', JSON.stringify(body, null, 2));

    // Extract the result from M-Pesa callback structure
    const stkCallback = body.Body?.stkCallback;
    const checkoutRequestId = stkCallback?.CheckoutRequestID;
    const resultCode = stkCallback?.ResultCode;
    const resultDesc = stkCallback?.ResultDesc;
    const callbackMetadata = stkCallback?.CallbackMetadata?.Item;

    console.log('[v0] Callback details:', {
      checkoutRequestId,
      resultCode,
      resultDesc,
    });

    if (checkoutRequestId) {
      // Store the payment status
      const paymentData: any = {
        status: 'completed',
        resultCode,
        resultDesc,
        timestamp: new Date().toISOString(),
      };

      // Extract metadata items if available
      if (Array.isArray(callbackMetadata)) {
        const metadata: Record<string, any> = {};
        callbackMetadata.forEach((item: any) => {
          metadata[item.Name] = item.Value;
        });
        paymentData.data = metadata;
        console.log('[v0] Payment metadata:', metadata);
      }

      paymentStatuses.set(checkoutRequestId, paymentData);
    }

    // Return success response to M-Pesa
    // M-Pesa expects a JSON response indicating the callback was received
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: 'Callback received successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Callback processing error:', error);
    // Still return success to prevent M-Pesa from retrying
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Error processing callback' },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const checkoutRequestId = request.nextUrl.searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'CheckoutRequestId is required' },
        { status: 400 }
      );
    }

    const status = paymentStatuses.get(checkoutRequestId);

    if (!status) {
      return NextResponse.json({
        status: 'pending',
        message: 'Waiting for payment confirmation...',
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('[v0] Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

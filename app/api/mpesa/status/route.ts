import { NextRequest, NextResponse } from 'next/server';

// In-memory store for payment statuses (in production, use a database)
const paymentStatuses = new Map<
  string,
  {
    status: string;
    resultCode: number;
    resultDesc: string;
    data?: Record<string, any>;
    timestamp: string;
  }
>();

// Export the map so callback route can update it
export { paymentStatuses };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'CheckoutRequestID is required' },
        { status: 400 }
      );
    }

    const paymentStatus = paymentStatuses.get(checkoutRequestId);

    if (!paymentStatus) {
      return NextResponse.json({
        status: 'pending',
        message: 'Payment status not yet received',
      });
    }

    return NextResponse.json(paymentStatus);
  } catch (error) {
    console.error('[v0] Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}

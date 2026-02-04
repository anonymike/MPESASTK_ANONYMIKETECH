'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  resultCode?: number;
  resultDesc?: string;
  data?: any;
  message?: string;
}

interface PaymentStatusPollerProps {
  checkoutRequestId: string;
  phoneNumber: string;
  amount: string;
  onSuccess?: (status: PaymentStatus) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function PaymentStatusPoller({
  checkoutRequestId,
  phoneNumber,
  amount,
  onSuccess,
  onError,
  onCancel,
}: PaymentStatusPollerProps) {
  const [status, setStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: 'Waiting for PIN entry...',
  });
  const [isPolling, setIsPolling] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  // Format phone for display
  const displayPhone = phoneNumber.replace(/(\+254)(\d)(\d{3})(\d{3})(\d{3})/, '$1 $2$3 $4 $5');

  useEffect(() => {
    const maxPollTime = 120000; // 2 minutes
    const pollInterval = 3000; // 3 seconds

    const pollTimer = setInterval(async () => {
      if (elapsedTime >= maxPollTime) {
        setIsPolling(false);
        setStatus({
          status: 'failed',
          message: 'Payment request timed out. Please try again.',
        });
        onError?.('Payment request timed out');
        return;
      }

      try {
        const response = await fetch(
          `/api/mpesa/callback?checkoutRequestId=${checkoutRequestId}`
        );
        const data: PaymentStatus = await response.json();

        setPollCount((prev) => prev + 1);

        if (data.status === 'completed') {
          setIsPolling(false);

          // Check if payment was successful (ResultCode 0 means success)
          if (data.resultCode === 0) {
            setStatus({
              status: 'completed',
              ...data,
            });
            onSuccess?.(data);
          } else {
            setStatus({
              status: 'failed',
              resultCode: data.resultCode,
              resultDesc: data.resultDesc,
              message: data.resultDesc || 'Payment failed',
            });
            onError?.(data.resultDesc || 'Payment failed');
          }
        }
      } catch (error) {
        console.error('[v0] Polling error:', error);
      }
    }, pollInterval);

    const timeTimer = setInterval(() => {
      setElapsedTime((prev) => prev + pollInterval);
    }, pollInterval);

    return () => {
      clearInterval(pollTimer);
      clearInterval(timeTimer);
    };
  }, [checkoutRequestId, elapsedTime, onSuccess, onError]);

  const handleCancel = () => {
    setIsPolling(false);
    onCancel?.();
  };

  return (
    <div className="w-full space-y-6">
      {/* Status Card */}
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        {/* Phone Icon Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#1BA839]/20 rounded-full animate-pulse" />
            <div className="relative bg-[#1BA839]/10 p-4 rounded-full">
              <Smartphone className="h-8 w-8 text-[#1BA839]" />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {isPolling ? 'Waiting for PIN Entry' : 'Payment Status'}
          </h3>

          {status.status === 'pending' && (
            <p className="text-sm text-muted-foreground">
              A prompt will appear on your phone at
              <br />
              <span className="font-mono font-medium text-foreground">{displayPhone}</span>
            </p>
          )}

          {status.status === 'completed' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Payment Successful!</span>
            </div>
          )}

          {status.status === 'failed' && (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{status.message}</span>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-muted rounded-lg p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-foreground">KES {parseInt(amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground font-mono">{displayPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-medium text-foreground font-mono text-xs">
              {checkoutRequestId.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Timer and Status */}
        {isPolling && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {Math.floor(elapsedTime / 1000)}s elapsed • Check {pollCount} times
            </span>
          </div>
        )}

        {status.status === 'completed' && (
          <div className="space-y-2 pt-2">
            {status.data && (
              <div className="text-xs text-muted-foreground space-y-1">
                {status.data.ItemChosenIdentifier && (
                  <p>Reference: {status.data.ItemChosenIdentifier}</p>
                )}
                {status.data.MpesaReceiptNumber && (
                  <p>Receipt: {status.data.MpesaReceiptNumber}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      {isPolling && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900 text-sm">What to do next:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Look for the M-Pesa prompt on your phone</li>
            <li>Enter your M-Pesa PIN when prompted</li>
            <li>Wait for confirmation</li>
          </ol>
        </div>
      )}

      {/* Cancel Button (only show during polling) */}
      {isPolling && (
        <Button
          variant="outline"
          onClick={handleCancel}
          className="w-full bg-transparent"
        >
          Cancel Payment
        </Button>
      )}

      {/* Retry/Done Buttons */}
      {!isPolling && (
        <Button
          onClick={onCancel}
          className="w-full bg-[#1BA839] hover:bg-[#168730]"
        >
          {status.status === 'completed' ? 'Done' : 'Try Again'}
        </Button>
      )}
    </div>
  );
}

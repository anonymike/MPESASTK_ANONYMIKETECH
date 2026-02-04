'use client';

import { useState } from 'react';
import { MpesaForm } from './mpesa-form';
import { PaymentStatusPoller } from './payment-status-poller';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

type CheckoutStep = 'form' | 'payment' | 'success';

interface CheckoutPageProps {
  orderTotal?: string;
  orderItems?: { name: string; quantity: number; price: number }[];
}

export function CheckoutPage({ orderTotal = '5000', orderItems }: CheckoutPageProps) {
  const [step, setStep] = useState<CheckoutStep>('form');
  const [paymentData, setPaymentData] = useState<{
    checkoutRequestId: string;
    phone: string;
    amount: string;
  } | null>(null);

  const handleFormSuccess = (data: {
    checkoutRequestId: string;
    phone: string;
    amount: string;
  }) => {
    setPaymentData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">ANONYMIKETECH</h1>
            <p className="text-xs text-muted-foreground">Secure Payment Portal</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-[#1BA839]">KES {parseInt(orderTotal).toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8 gap-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step === 'form' || step === 'payment' || step === 'success'
                  ? 'bg-[#1BA839] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </div>
            <div className="min-w-fit">
              <p className="text-xs font-medium text-muted-foreground uppercase">Step 1</p>
              <p className="text-sm font-semibold text-foreground">Enter Details</p>
            </div>
          </div>

          <ArrowRight
            className={`h-5 w-5 transition-colors ${
              step === 'payment' || step === 'success'
                ? 'text-[#1BA839]'
                : 'text-muted-foreground'
            }`}
          />

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step === 'payment' || step === 'success'
                  ? 'bg-[#1BA839] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </div>
            <div className="min-w-fit">
              <p className="text-xs font-medium text-muted-foreground uppercase">Step 2</p>
              <p className="text-sm font-semibold text-foreground">Confirm PIN</p>
            </div>
          </div>

          <ArrowRight
            className={`h-5 w-5 transition-colors ${
              step === 'success' ? 'text-[#1BA839]' : 'text-muted-foreground'
            }`}
          />

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step === 'success'
                  ? 'bg-[#1BA839] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </div>
            <div className="min-w-fit">
              <p className="text-xs font-medium text-muted-foreground uppercase">Step 3</p>
              <p className="text-sm font-semibold text-foreground">Complete</p>
            </div>
          </div>
        </div>

        {/* Order Summary (only on form step) */}
        {step === 'form' && orderItems && orderItems.length > 0 && (
          <Card className="bg-muted/50 border border-border p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Order Summary</h3>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-foreground">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-[#1BA839]">
                KES {parseInt(orderTotal).toLocaleString()}
              </span>
            </div>
          </Card>
        )}

        {/* Content Based on Step */}
        <Card className="p-6 md:p-8 border border-border">
          {step === 'form' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Enter Payment Details</h2>
                <p className="text-sm text-muted-foreground">
                  You will receive an M-Pesa prompt on your phone
                </p>
              </div>
              <MpesaForm
                onSuccess={handleFormSuccess}
                onError={(error) => console.error('Form error:', error)}
              />
            </div>
          )}

          {step === 'payment' && paymentData && (
            <PaymentStatusPoller
              checkoutRequestId={paymentData.checkoutRequestId}
              phoneNumber={paymentData.phone}
              amount={paymentData.amount}
              onSuccess={handlePaymentSuccess}
              onError={(error) => console.error('Payment error:', error)}
              onCancel={handleReset}
            />
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                  <div className="relative bg-green-500/10 p-6 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed successfully
                </p>
              </div>

              {paymentData && (
                <Card className="bg-muted/50 border border-border p-4 text-left space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Amount Paid</p>
                    <p className="text-lg font-bold text-[#1BA839]">
                      KES {parseInt(paymentData.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Phone Number</p>
                    <p className="text-sm font-mono text-foreground">
                      {paymentData.phone.replace(/(\+254)(\d)(\d{3})(\d{3})(\d{3})/, '$1 $2$3 $4 $5')}
                    </p>
                  </div>
                </Card>
              )}

              <div className="border-t border-border pt-6">
                <p className="text-xs text-muted-foreground mb-4">
                  Thank you for your purchase. Check your email for receipt.
                </p>
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-3 bg-[#1BA839] hover:bg-[#168730] text-white font-medium rounded-lg transition-colors"
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Security Info */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and secured by industry-standard protocols
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>🔒 SSL Encrypted</span>
            <span>•</span>
            <span>✓ PCI Compliant</span>
            <span>•</span>
            <span>📱 M-Pesa Official</span>
          </div>
        </div>
      </main>
    </div>
  );
}

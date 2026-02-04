'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MpesaForm } from '@/components/mpesa-form';
import { CheckCircle } from 'lucide-react';

function PaymentLinkContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const phone = searchParams.get('phone');
  const amount = searchParams.get('amount');
  const desc = searchParams.get('desc');

  if (!id || !phone || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Invalid Payment Link</CardTitle>
            <CardDescription className="text-slate-400">
              The payment link is missing required information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">Please check the link and try again.</p>
            <Button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">ANONYMIKETECH</div>
                <div className="text-xs text-cyan-400">Payment Request</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Payment Details */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Payment Request</h1>
              <p className="text-slate-400">Complete your M-Pesa payment securely</p>
            </div>

            {/* Payment Summary Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount */}
                <div className="p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-600/30">
                  <p className="text-slate-400 text-sm mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-cyan-400">KES {amount}</p>
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Recipient Phone</p>
                  <p className="text-white font-mono text-lg">{phone}</p>
                </div>

                {/* Description */}
                {desc && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm">Payment For</p>
                    <p className="text-white">{desc}</p>
                  </div>
                )}

                {/* Payment ID */}
                <div className="pt-4 border-t border-slate-700 space-y-2">
                  <p className="text-slate-500 text-xs">Payment Request ID</p>
                  <p className="text-slate-300 font-mono text-xs break-all">{id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <p className="text-xs text-slate-400">
                🔒 This payment is secure and processed directly through M-Pesa. We never store your personal information.
              </p>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="flex items-center">
            <Card className="bg-slate-800 border-slate-700 w-full">
              <CardHeader>
                <CardTitle className="text-white">Enter Your Details</CardTitle>
                <CardDescription className="text-slate-400">
                  You will receive an STK push on your phone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MpesaForm
                  onSuccess={() => {
                    // Show success message
                    alert('Payment initiated successfully! Check your phone for the M-Pesa prompt.');
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-400 text-sm">
          <p>&copy; 2026 ANONYMIKETECH. Secure M-Pesa Payments.</p>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white">Loading payment details...</div>
        </div>
      }
    >
      <PaymentLinkContent />
    </Suspense>
  );
}

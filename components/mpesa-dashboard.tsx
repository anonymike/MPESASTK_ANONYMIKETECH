'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MpesaForm } from './mpesa-form';
import { PaymentStatusPoller } from './payment-status-poller';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  dateTime: string;
  phoneNumber: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Timeout';
  checkoutRequestId: string;
  resultCode: number;
}

type DashboardView = 'dashboard' | 'form' | 'payment';

export function MpesaDashboard() {
  const [view, setView] = useState<DashboardView>('dashboard');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentData, setPaymentData] = useState<{
    checkoutRequestId: string;
    phone: string;
    amount: string;
  } | null>(null);

  // Simulate checking for payment status updates
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!paymentData) return;

      try {
        const response = await fetch(
          `/api/mpesa/status?checkoutRequestId=${paymentData.checkoutRequestId}`
        );
        const data = await response.json();

        if (data.status === 'completed') {
          const resultCode = data.resultCode || 0;
          const statusMap: Record<number, Transaction['status']> = {
            0: 'Success',
            1037: 'Timeout',
          };
          const status = statusMap[resultCode] || 'Failed';

          // Add transaction
          const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            dateTime: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            }),
            phoneNumber: paymentData.phone,
            amount: parseInt(paymentData.amount),
            status,
            checkoutRequestId: paymentData.checkoutRequestId,
            resultCode,
          };

          setTransactions((prev) => [newTransaction, ...prev]);

          // Update balance if successful
          if (status === 'Success') {
            setBalance((prev) => prev + parseInt(paymentData.amount));
          }

          // Reset payment state and return to dashboard
          setPaymentData(null);
          setView('dashboard');
        }
      } catch (error) {
        console.error('[v0] Error checking payment status:', error);
      }
    };

    if (view === 'payment' && paymentData) {
      const interval = setInterval(checkPaymentStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [paymentData, view]);

  const handleFormSuccess = (data: {
    checkoutRequestId: string;
    phone: string;
    amount: string;
  }) => {
    setPaymentData(data);
    setView('payment');
  };

  const handlePaymentSuccess = () => {
    // Balance update is handled by useEffect when status is checked
  };

  const handleCancel = () => {
    setPaymentData(null);
    setView('dashboard');
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Timeout':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusBadgeColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Timeout':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
  };

  const successTransactions = transactions.filter((t) => t.status === 'Success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">ANONYMIKETECH</h1>
            <p className="text-xs text-muted-foreground">M-Pesa Sandbox Demo Dashboard</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300">
            <p className="text-xs font-semibold text-amber-900">SANDBOX MODE</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <div className="space-y-8">
            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#1BA839] to-[#168730] border-0 text-white p-8 overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Available Balance</p>
                      <h2 className="text-4xl font-bold mt-2">
                        KES {balance.toLocaleString()}
                      </h2>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                      <Wallet className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-white/80 text-sm">
                      {successTransactions.length} successful transactions in sandbox mode
                    </p>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Transactions</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{transactions.length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
                <Card className="p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {transactions.length > 0
                          ? `${Math.round((successTransactions.length / transactions.length) * 100)}%`
                          : '0%'}
                      </p>
                    </div>
                    <div className="text-2xl">📊</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* New Payment Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
              <button
                onClick={() => setView('form')}
                className="px-6 py-2 bg-[#1BA839] hover:bg-[#168730] text-white font-medium rounded-lg transition-colors"
              >
                New Payment
              </button>
            </div>

            {/* Transactions Table */}
            {transactions.length > 0 ? (
              <Card className="border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Phone Number
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Amount (KES)
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Checkout ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((txn) => (
                        <tr
                          key={txn.id}
                          className="hover:bg-muted/50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm text-foreground font-mono">
                            {txn.dateTime}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground font-mono">
                            {txn.phoneNumber}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">
                            {txn.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${getStatusBadgeColor(txn.status)}`}>
                              {txn.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                            {txn.checkoutRequestId.substring(0, 12)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="border border-border border-dashed p-12 text-center">
                <div className="space-y-3">
                  <div className="text-4xl">📱</div>
                  <h3 className="font-semibold text-foreground">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new payment to see transactions appear here
                  </p>
                  <button
                    onClick={() => setView('form')}
                    className="mt-4 px-6 py-2 bg-[#1BA839] hover:bg-[#168730] text-white font-medium rounded-lg transition-colors inline-block"
                  >
                    New Payment
                  </button>
                </div>
              </Card>
            )}

            {/* Info Section */}
            <Card className="bg-blue-50 border border-blue-200 p-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">ℹ️ Sandbox Demo Mode</h4>
                <p className="text-sm text-blue-800">
                  This is a sandbox/demo version using test M-Pesa credentials. All transactions are simulated
                  and no real money is transferred. Balance updates when callbacks indicate successful payments
                  (ResultCode: 0).
                </p>
              </div>
            </Card>
          </div>
        )}

        {view === 'form' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border border-border">
              <div className="space-y-6 mb-8">
                <button
                  onClick={() => setView('dashboard')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">New Payment</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your details to initiate an M-Pesa STK push payment
                  </p>
                </div>
              </div>
              <MpesaForm
                onSuccess={handleFormSuccess}
                onError={(error) => console.error('Form error:', error)}
              />
            </Card>
          </div>
        )}

        {view === 'payment' && paymentData && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border border-border">
              <PaymentStatusPoller
                checkoutRequestId={paymentData.checkoutRequestId}
                phoneNumber={paymentData.phone}
                amount={paymentData.amount}
                onSuccess={handlePaymentSuccess}
                onError={(error) => console.error('Payment error:', error)}
                onCancel={handleCancel}
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

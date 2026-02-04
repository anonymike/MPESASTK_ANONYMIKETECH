'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MpesaForm } from './mpesa-form';
import { PaymentStatusPoller } from './payment-status-poller';
import { RequestPaymentModal } from './request-payment-modal';
import {
  Send,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  LogOut,
  Globe,
  Smartphone,
  Lock,
  X,
  Menu,
  Activity,
} from 'lucide-react';

interface Transaction {
  id: string;
  phone: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  type: 'send' | 'receive';
}

interface DashboardState {
  balance: number;
  totalTransactions: number;
  successRate: number;
  lastTransaction?: Transaction;
  transactions: Transaction[];
  currentCheckoutId?: string;
}

export function NewMpesaDashboard() {
  const [state, setState] = useState<DashboardState>({
    balance: 25000,
    totalTransactions: 0,
    successRate: 0,
    transactions: [],
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showRequestPaymentModal, setShowRequestPaymentModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [systemUptime, setSystemUptime] = useState<string>('99.9%');
  const [greeting, setGreeting] = useState<string>('Welcome');

  // Detect mobile/desktop and set greeting
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Set time-based greeting
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
      
      // Update current time
      const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(time);
    };

    updateGreeting();
    const timeInterval = setInterval(updateGreeting, 1000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timeInterval);
    };
  }, []);

  // Mock transaction history
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      transactions: [
        {
          id: 'TRX001',
          phone: '+254708374149',
          amount: 500,
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'send',
        },
        {
          id: 'TRX002',
          phone: '+254712345678',
          amount: 1000,
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'receive',
        },
        {
          id: 'TRX003',
          phone: '+254798765432',
          amount: 250,
          status: 'failed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: 'send',
        },
      ],
      totalTransactions: 3,
      successRate: 66,
    }));
  }, []);

  const handlePaymentSuccess = (checkoutId: string, amount: number) => {
    const newTransaction: Transaction = {
      id: checkoutId,
      phone: '+254708374149',
      amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      type: 'send',
    };

    setState((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      transactions: [newTransaction, ...prev.transactions],
      totalTransactions: prev.totalTransactions + 1,
      successRate: Math.round(((prev.totalTransactions + 1) / (prev.totalTransactions + 1)) * 100),
    }));

    setShowPaymentForm(false);
    setActiveTab('dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600';
      case 'pending':
        return 'text-amber-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Logo and Navigation */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">ANONYMIKETECH</div>
                <div className="text-xs text-cyan-400">M-Pesa Payment Hub</div>
              </div>
            </div>

            {/* Desktop Navigation and Links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="https://www.anonymiketech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-700 py-4 space-y-3">
              <a
                href="https://www.anonymiketech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors rounded hover:bg-slate-700"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-slate-700">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 mb-6 bg-slate-800 border border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-600">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="send" className="data-[state=active]:bg-cyan-600">
              Send Money
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-600">
              History
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Card with Time-Based Greeting */}
            <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">{greeting}!</CardTitle>
                    <CardDescription className="text-cyan-100 mt-1">
                      Manage your M-Pesa payments with ease
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{currentTime}</p>
                    <p className="text-xs text-cyan-100 mt-1">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* System Status and Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* System Status Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">System Active</CardTitle>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{systemUptime}</div>
                  <p className="text-xs text-emerald-400 mt-1">System uptime & reliability</p>
                </CardContent>
              </Card>

              {/* Transactions Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Transactions</CardTitle>
                  <Send className="w-4 h-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{state.totalTransactions}</div>
                  <p className="text-xs text-slate-400 mt-1">All time transactions</p>
                </CardContent>
              </Card>

              {/* Success Rate Card */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{state.successRate}%</div>
                  <p className="text-xs text-slate-400 mt-1">Transaction success</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setActiveTab('send')}
                className="h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Send Money
              </Button>
              <Button
                onClick={() => setShowRequestPaymentModal(true)}
                variant="outline"
                className="h-12 border-slate-600 text-white hover:bg-slate-700 font-semibold rounded-lg flex items-center justify-center gap-2 bg-transparent"
              >
                <Lock className="w-5 h-5" />
                Request Payment
              </Button>
            </div>

            {/* Recent Transactions */}
            {state.transactions.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.transactions.slice(0, 3).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-slate-600 rounded-lg ${getStatusColor(txn.status)}`}>
                            {txn.type === 'send' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{txn.phone}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(txn.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {txn.type === 'send' ? '-' : '+'}KES {txn.amount}
                          </p>
                          <div className={`flex items-center gap-1 text-xs ${getStatusColor(txn.status)}`}>
                            {getStatusIcon(txn.status)}
                            <span className="capitalize">{txn.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Send Money Tab */}
          <TabsContent value="send" className="space-y-6">
            {isMobile ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Send Money via M-Pesa</CardTitle>
                  <CardDescription className="text-slate-400">
                    Quick and secure M-Pesa STK Push payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MpesaForm onSuccess={handlePaymentSuccess} />
                </CardContent>
              </Card>
            ) : (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="bg-slate-800 border-slate-700 w-full max-w-md shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-white">Send Money via M-Pesa</CardTitle>
                      <CardDescription className="text-slate-400">
                        Quick and secure STK Push payments
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <MpesaForm onSuccess={handlePaymentSuccess} />
                  </CardContent>
                </Card>
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur -z-10"
                  onClick={() => setActiveTab('dashboard')}
                />
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {isMobile ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Transaction History</CardTitle>
                  <CardDescription className="text-slate-400">
                    All your M-Pesa transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {state.transactions.length > 0 ? (
                      <div className="space-y-3">
                        {state.transactions.map((txn) => (
                          <div
                            key={txn.id}
                            className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 bg-slate-600 rounded-lg ${getStatusColor(txn.status)}`}>
                                  {txn.type === 'send' ? (
                                    <ArrowUpRight className="w-4 h-4" />
                                  ) : (
                                    <ArrowDownLeft className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{txn.phone}</p>
                                  <p className="text-xs text-slate-400">
                                    {new Date(txn.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-white">
                                  {txn.type === 'send' ? '-' : '+'}KES {txn.amount}
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1 text-xs ${getStatusColor(txn.status)}`}
                                >
                                  {getStatusIcon(txn.status)}
                                  <span className="capitalize">{txn.status}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-8">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-white">Transaction History</CardTitle>
                      <CardDescription className="text-slate-400">
                        All your M-Pesa transactions
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {state.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="text-left py-2 px-2 text-slate-400 font-medium">Date</th>
                                <th className="text-left py-2 px-2 text-slate-400 font-medium">Phone</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Amount</th>
                                <th className="text-center py-2 px-2 text-slate-400 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {state.transactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                  <td className="py-3 px-2 text-white">
                                    {new Date(txn.timestamp).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-2 text-slate-300">{txn.phone}</td>
                                  <td className="py-3 px-2 text-right text-white font-medium">
                                    KES {txn.amount}
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        txn.status === 'completed'
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : txn.status === 'pending'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {getStatusIcon(txn.status)}
                                      {txn.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center text-slate-400 py-8">No transactions yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur -z-10"
                  onClick={() => setActiveTab('dashboard')}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Payment Modal */}
      <RequestPaymentModal 
        isOpen={showRequestPaymentModal} 
        onClose={() => setShowRequestPaymentModal(false)} 
      />

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">ANONYMIKETECH</h3>
              <p className="text-slate-400 text-sm">Explore • Invent • Develop</p>
              <a
                href="https://www.anonymiketech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block"
              >
                Visit our website
              </a>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>M-Pesa Integration</li>
                <li>Real-time Transactions</li>
                <li>Secure Payments</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Security</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>Encrypted Connections</li>
                <li>PCI Compliant</li>
                <li>2FA Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 text-center text-slate-400 text-sm">
            <p>&copy; 2026 ANONYMIKETECH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';

interface RequestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestPaymentModal({ isOpen, onClose }: RequestPaymentModalProps) {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'form' | 'link'>('form');

  const generatePaymentLink = () => {
    if (!recipientPhone || !amount) {
      alert('Please enter phone number and amount');
      return;
    }

    // Generate a unique payment request ID
    const requestId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${baseUrl}/pay?id=${requestId}&phone=${encodeURIComponent(recipientPhone)}&amount=${amount}&desc=${encodeURIComponent(description)}`;

    setPaymentLink(link);
    setStep('link');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Request',
        text: `Payment request for KES ${amount}${description ? ': ' + description : ''}`,
        url: paymentLink,
      });
    } else {
      copyToClipboard();
    }
  };

  const resetForm = () => {
    setRecipientPhone('');
    setAmount('');
    setDescription('');
    setPaymentLink('');
    setStep('form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                Request Payment
              </CardTitle>
              <CardDescription className="text-slate-400">
                {step === 'form' ? 'Generate a shareable payment link' : 'Share your payment request'}
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </CardHeader>

          <CardContent>
            {step === 'form' ? (
              <div className="space-y-4">
                {/* Recipient Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Recipient Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+254712345678"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Amount (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max="999999"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Description (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Payment for services"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={generatePaymentLink}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Generate Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Request Summary */}
                <div className="space-y-3 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Amount</span>
                    <span className="text-white font-semibold">KES {amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">From</span>
                    <span className="text-white font-semibold">{recipientPhone}</span>
                  </div>
                  {description && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">For</span>
                      <span className="text-white font-semibold">{description}</span>
                    </div>
                  )}
                </div>

                {/* Payment Link */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Payment Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs font-mono overflow-x-auto"
                    />
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share Info */}
                <p className="text-xs text-slate-400">
                  Share this link with the payer. They can use it to send you KES {amount}.
                </p>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    Create New
                  </Button>
                  <Button
                    onClick={shareLink}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

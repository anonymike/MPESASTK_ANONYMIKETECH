'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2, Phone, DollarSign } from 'lucide-react';

interface MpesaFormProps {
  onSuccess?: (checkoutRequestId: string, amount: number) => void;
  onError?: (error: string) => void;
}

export function MpesaForm({ onSuccess, onError }: MpesaFormProps) {
  const [phone, setPhone] = useState('+254');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Ensure it starts with +254
    if (!value.startsWith('+254')) {
      return '+254';
    }
    // Only allow digits after +254
    const digits = value.replace(/\D/g, '');
    return '+' + digits;
  };

  const validatePhone = (phoneNumber: string): boolean => {
    // Must be +254 followed by exactly 9 digits (Kenyan phone format)
    const phoneRegex = /^\+254\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateAmount = (amountValue: string): boolean => {
    const num = parseFloat(amountValue);
    return num > 0 && num <= 999999;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!validatePhone(phone)) {
      setError('Invalid phone number. Use format: +254XXXXXXXXX');
      onError?.('Invalid phone number');
      return;
    }

    if (!validateAmount(amount)) {
      setError('Amount must be between 1 and 999,999');
      onError?.('Invalid amount');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          amount: amount,
          accountReference: 'ANONYMIKETECH',
          transactionDesc: 'Payment for goods and services',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      setSuccess(true);
      onSuccess?.(data.checkoutRequestId, parseFloat(amount));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Phone Number Field */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-foreground">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+254712345678"
            className="pl-10 bg-background"
            disabled={loading}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Enter your M-Pesa registered phone number
          </p>
          <button
            type="button"
            onClick={() => setPhone('+254708374149')}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
          ENTER YOUR M-PESA NUMBER 
          </button>
        </div>
      </div>

      {/* Amount Field */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-foreground">
          Amount (KES)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount in KES"
            className="pl-10 bg-background"
            disabled={loading}
            min="1"
            max="999999"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum: KES 1 | Maximum: KES 999,999
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">
              STK Push sent successfully
            </p>
            <p className="text-xs text-green-800">
              Check your phone for the M-Pesa prompt
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-[#1BA839] hover:bg-[#168730] text-white font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

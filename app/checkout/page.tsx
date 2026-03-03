"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createCheckoutSession } from '@/lib/stripe-client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

function CheckoutInner({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const res = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.origin + '/stripe/success' }, redirect: 'if_required' });
      if (res.error) {
        setMessage(res.error.message || 'Payment failed');
      } else {
        setMessage('Payment submitted — verifying item status...');

        // After client-side payment success, re-fetch item to confirm backend marked it sold
        const itemId = searchParams.get('itemId') || searchParams.get('productId');
        if (itemId) {
          // Poll after 2s to give webhook time to process
          setTimeout(async () => {
            try {
              const itemRes = await fetch(`${API_BASE}/api/items/${itemId}`);
              if (itemRes.ok) {
                const data = await itemRes.json();
                const item = data?.item ?? data?.data?.item ?? data?.data ?? data;
                const isSold = item?.isSold === true || String(item?.status || '').toLowerCase() === 'sold';
                if (isSold) {
                  setMessage('Payment confirmed! Item is now marked as sold.');
                } else {
                  setMessage('Payment received. Item status update is still processing.');
                }
              }
            } catch {
              // non-critical
            }
          }, 2000);
        } else {
          setMessage('Payment submitted — awaiting confirmation.');
        }
      }
    } catch (err: any) {
      setMessage(err?.message || 'Unexpected error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6 bg-white rounded-md shadow">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <PaymentElement />
        </div>
        <button disabled={busy || !stripe} className="w-full rounded-md bg-teal-700 text-white px-4 py-2">{busy ? 'Processing...' : 'Pay'}</button>
      </form>
      {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();
  const clientSecret = search.get('clientSecret') || '';
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  useEffect(() => {
    if (!publishable) return;
    setStripePromise(loadStripe(publishable));
  }, [publishable]);

  if (!clientSecret) {
    return <div className="p-6 text-center">Missing payment information. Go back and try again.</div>;
  }

  if (!publishable) {
    return <div className="p-6 text-center">Missing STRIPE publishable key. See environment configuration.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      {stripePromise ? (
        <Elements stripe={stripePromise as any} options={options}>
          <CheckoutInner clientSecret={clientSecret} />
        </Elements>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

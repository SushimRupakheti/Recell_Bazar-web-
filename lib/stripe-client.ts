// Frontend helper functions to interact with backend payment endpoints
export type CreatePaymentIntentPayload = {
  amount: number; // cents
  currency?: string;
  items?: any[];
  metadata?: Record<string, any>;
  customerEmail?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function createPaymentIntent(payload: CreatePaymentIntentPayload) {
  const url = `${API_BASE.replace(/\/$/, '')}/api/payments/create-payment-intent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create payment intent');
  return data as { success: boolean; clientSecret: string; paymentIntentId: string; amount?: number; currency?: string };
}

export async function getPaymentStatus(paymentIntentId: string) {
  const url = `${API_BASE.replace(/\/$/, '')}/api/payments/${encodeURIComponent(paymentIntentId)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch payment status');
  return data as { success: boolean; payment: any };
}

export async function confirmPaymentOnClient(stripe: any, elements: any, clientSecret: string) {
  // Using Payment Element confirm flow
  if (!stripe || !elements) throw new Error('Stripe has not been initialized');
  const result = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Return URL will be used for redirects when additional authentication is required
      return_url: window.location.origin + `/stripe/success?session_id=${encodeURIComponent(clientSecret)}`,
    },
    redirect: 'if_required',
  });

  return result; // contains error or paymentIntent
}

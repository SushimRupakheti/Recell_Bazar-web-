// Frontend helper functions to interact with backend payment endpoints
export type CreateCheckoutPayload = {
  amount: number;
  productName: string;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  orderId?: string;
  metadata?: Record<string, any>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function createCheckoutSession(payload: CreateCheckoutPayload) {
  const url = `${API_BASE.replace(/\/$/, '')}/api/payments/stripe/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create checkout session');
  return data as { success: boolean; url?: string; clientSecret?: string; paymentIntentId?: string };
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

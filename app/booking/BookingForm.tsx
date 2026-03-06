"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Item = any;
type User = any;

const DEFAULT_NPR_PER_USD = 142;

function roundToTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

function nprToUsd(amountNpr: number, nprPerUsd: number): number {
  if (!Number.isFinite(amountNpr) || amountNpr <= 0) return amountNpr;
  if (!Number.isFinite(nprPerUsd) || nprPerUsd <= 0) return amountNpr;
  return roundToTwo(amountNpr / nprPerUsd);
}

/** Helper: check if an item is sold based on backend fields.
 *  `status` is the canonical source of truth.
 */
function isItemSold(it: any): boolean {
  if (!it) return false;
  const status = String(it.status || "").toLowerCase();
  if (status === "sold") return true;
  if (!status && it.isSold === true) return true;
  return false;
}

export default function BookingForm({ item, user }: { item?: Item; user?: User }) {
  const router = useRouter();
  const [name, setName] = useState(() => {
    if (!user) return "";
    const f = user?.firstName || user?.first_name || "";
    const l = user?.lastName || user?.last_name || "";
    return `${String(f).trim()} ${String(l).trim()}`.trim();
  });
  const [number, setNumber] = useState(() => user?.contactNo || user?.contact || user?.phone || "");
  const [email, setEmail] = useState(() => user?.email || "");
  const [itemState, setItemState] = useState<Item | null>(() => item ?? null);
  const [shop, setShop] = useState("New road ,Kathmandu");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("4:00 PM");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [soldModal, setSoldModal] = useState(false);

  // Re-fetch item on mount to verify it hasn't been sold (race condition guard)
  useEffect(() => {
    const checkItemStatus = async () => {
      const id = itemState?._id ?? itemState?.id;
      if (!id) return;
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const res = await fetch(`${base}/api/items/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched = data?.item ?? data?.data?.item ?? data?.data ?? data;
        if (fetched && (fetched._id || fetched.id)) {
          setItemState(fetched);
          if (isItemSold(fetched)) {
            setSoldModal(true);
          }
        }
      } catch {
        // ignore
      }
    };
    checkItemStatus();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if this is the user's own item
    const sellerId = itemState?.sellerId?._id ?? itemState?.sellerId ?? "";
    const userId = user?._id ?? user?.id ?? "";
    if (sellerId && userId && String(sellerId) === String(userId)) {
      setResult({ success: false, message: "You cannot buy your own item.", raw: null });
      return;
    }

    // Check sold status before allowing order
    if (isItemSold(itemState)) {
      setSoldModal(true);
      return;
    }

    setBusy(true);
    // client-side validation: required fields
    const missing: string[] = [];
    const itemId = itemState?._id ?? itemState?.id;
    const rawAmount = itemState?.finalPrice ?? itemState?.basePrice;
    if (!itemId) missing.push("itemId");
    if (!rawAmount && rawAmount !== 0) missing.push("amount");
    if (!name) missing.push("name");
    if (!number) missing.push("number");
    if (!email) missing.push("email");

    if (missing.length) {
      setResult({ success: false, message: `Missing required fields: ${missing.join(", ")}`, raw: null });
      setBusy(false);
      return;
    }

    try {
      // Build order payload
      const referenceId = `BK-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

      // Ensure amount is a valid number — finalPrice is stored as a string in the DB
      const rawPrice = itemState?.finalPrice ?? itemState?.basePrice;
      const amt = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);

      if (!amt || !Number.isFinite(amt) || amt <= 0) {
        setResult({ success: false, message: `Invalid price: "${rawPrice}". Cannot proceed with payment.`, raw: null });
        setBusy(false);
        return;
      }

      // Your item prices are stored in NPR, but the backend Stripe integration is using USD.
      // Convert NPR -> USD using 1 USD = 142 NPR (configurable via NEXT_PUBLIC_NPR_PER_USD).
      const rateRaw = process.env.NEXT_PUBLIC_NPR_PER_USD;
      const nprPerUsd = rateRaw ? Number(rateRaw) : DEFAULT_NPR_PER_USD;
      const amountUsd = nprToUsd(amt, nprPerUsd);

      const orderPayload = {
        oid: referenceId,
        amt: String(amt),
        refId: referenceId,
        sellerId: itemState?.sellerId?._id ?? itemState?.sellerId ?? "",
        fullName: name,
        phoneNo: number,
        email: email,
        phoneModel: itemState?.phoneModel ?? "",
        price: amt,
        location: shop,
        date: date,
        time: time,
      };

      // Create PaymentIntent via backend Stripe Checkout endpoint
      const payload = {
        // Backend expects USD amount (major unit), and will convert to cents internally.
        amount: amountUsd,
        productName: itemState?.phoneModel ?? 'Phone',
        productId: itemId,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: number,
        orderId: referenceId,
        metadata: {
          ...orderPayload,
          amountNpr: amt,
          amountUsd,
          nprPerUsd,
        },
      };

      // Debug: log the EXACT payload being sent
      // eslint-disable-next-line no-console
      console.log("Stripe checkout payload:", JSON.stringify(payload, null, 2));
      // eslint-disable-next-line no-console
      console.log("amount type:", typeof payload.amount, "value:", payload.amount);

      // call helper route on backend via public API base
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const resp = await fetch(`${apiBase}/api/payments/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const created = await resp.json();

      if (!resp.ok) throw new Error(created?.message || 'Failed to create checkout session');

      // If backend returns a Stripe Checkout redirect URL
      if (created?.url) {
        // Save productId so the success page can mark it as sold
        if (typeof window !== 'undefined' && itemId) {
          localStorage.setItem('pending_payment_product_id', itemId);
        }
        window.location.href = created.url;
        setResult({ success: true, message: 'Redirecting to Stripe Checkout...' });
        setBusy(false);
        return;
      }

      // If backend returns a client secret for Stripe Elements
      const clientSecret = created.clientSecret || created.client_secret || created.data?.clientSecret;
      const paymentIntentId = created.paymentIntentId || created.id || created.data?.paymentIntentId;
      if (!clientSecret) {
        throw new Error('Missing client secret or redirect URL from backend');
      }

      // redirect to internal checkout page which will mount Stripe Elements
      window.location.href = `/checkout?clientSecret=${encodeURIComponent(clientSecret)}&paymentIntentId=${encodeURIComponent(paymentIntentId || '')}`;
      setResult({ success: true, message: 'Redirecting to checkout...' });
    } catch (err: any) {
      setResult({ success: false, message: err?.message || "Payment failed", raw: null });
    } finally {
      setBusy(false);
    }
  };

  // if item not provided server-side, fetch it client-side from backend
  useEffect(() => {
    if (itemState) return;
    const fetchItem = async () => {
      try {
        const path = window.location.pathname;
        const m = path.match(/\/booking\/([^/]+)/);
        const id = m ? m[1] : null;
        if (!id) return;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
        const res = await fetch(`${base}/api/items/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched = data?.item ?? data;
        setItemState(fetched ?? null);
      } catch (e) {
        // ignore
      }
    };
    fetchItem();
  }, [itemState]);

  // Stripe handles redirects directly to success/cancel pages
  // No message listener needed

  return (
    <>
      {/* Sold Modal — race condition warning */}
      {soldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Item Sold</h3>
            <p className="mt-2 text-sm text-gray-600">
              This item was sold while you were checking out. We apologize for the inconvenience.
            </p>
            {itemState?.soldAt && (
              <p className="mt-1 text-xs text-gray-500">
                Sold on {new Date(itemState.soldAt).toLocaleDateString()}
              </p>
            )}
            <button
              type="button"
              onClick={() => { setSoldModal(false); router.push("/dashboard"); }}
              className="mt-4 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition"
            >
              Browse Other Items
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="mx-auto max-w-3xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-xs text-gray-600">Full Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="Your name" />

          <label className="mt-4 block text-xs text-gray-600">Number</label>
          <input value={number} onChange={(e)=>setNumber(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="+977-98..." />

          <label className="mt-4 block text-xs text-gray-600">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" placeholder="you@example.com" />

          <label className="mt-4 block text-xs text-gray-600">Phone Model</label>
          <input readOnly value={item?.phoneModel || ""} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" />

          <label className="mt-4 block text-xs text-gray-600">Price</label>
          <input readOnly value={`NPR ${Number((item?.finalPrice ?? item?.basePrice) || 0).toLocaleString()}`} className="mt-2 w-full rounded-md bg-gray-100 px-4 py-3 text-sm" />
        </div>

        <div>
          <p className="text-sm font-semibold">Shop:</p>
          <p className="mt-1 text-xs text-gray-500">Choose the nearest shop for the appointment:</p>

          <label className="mt-3 block text-xs text-gray-600">Location</label>
          <select value={shop} onChange={(e)=>setShop(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border">
            <option>New road ,Kathmandu</option>
            <option>Gundu, Bhaktapur</option>
            <option>Imadol, Lalitpur</option>
          </select>

          <label className="mt-4 block text-xs text-gray-600">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border" />

          <label className="mt-4 block text-xs text-gray-600">Time</label>
          <input value={time} onChange={(e)=>setTime(e.target.value)} className="mt-2 w-full rounded-md bg-white px-4 py-3 text-sm border" />

          <button disabled={busy} type="submit" className="mt-6 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition">
            {busy ? "Processing..." : "Place Order"}
          </button>

          {result && (
            <div className={`mt-4 rounded-md p-3 ${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="text-sm font-semibold">{result.message}</p>
              <pre className="mt-2 text-xs text-gray-600">{String(result?.raw ?? '')}</pre>
            </div>
          )}
        </div>
      </div>
    </form>
    </>
  );
}

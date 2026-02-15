"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Item = any;
type User = any;

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // client-side validation: required fields
    const missing: string[] = [];
    const itemId = itemState?._id ?? itemState?.id;
    const amount = itemState?.finalPrice ?? itemState?.basePrice;
    if (!itemId) missing.push("itemId");
    if (!amount && amount !== 0) missing.push("amount");
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
      const amt = Number(amount) || 0;

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

      // debug log for developer
      // eslint-disable-next-line no-console
      console.log("Submitting order payload:", orderPayload);

      // Create Stripe checkout session via external backend
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
      const response = await fetch(`${apiBase}/api/payments/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          productName: itemState?.phoneModel ?? "Phone",
          productId: itemId,
          buyerName: name,
          buyerEmail: email,
          buyerPhone: number,
          orderId: referenceId,
          metadata: orderPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }

      setResult({ success: true, message: "Redirecting to Stripe checkout..." });
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
  );
}

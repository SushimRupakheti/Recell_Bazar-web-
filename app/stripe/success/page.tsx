"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [session, setSession] = useState<any>(null);
  const [soldItem, setSoldItem] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // verify the session with our server route which checks Stripe and forwards to backend
    (async () => {
      try {
        const res = await fetch('http://localhost:5050/api/payments/stripe/checkout', {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (res.ok && data?.paid) {
          setStatus("success");
          setSession({ id: sessionId, verified: true, forwarded: data.forwarded });

          // After payment success, re-fetch item from backend to confirm sold status.
          // The webhook should have set isSold=true. Poll once after 2s.
          const productId = data?.metadata?.productId || data?.productId;
          if (productId) {
            setTimeout(async () => {
              try {
                const itemRes = await fetch(`${API_BASE}/api/items/${productId}`);
                if (itemRes.ok) {
                  const itemData = await itemRes.json();
                  const item = itemData?.item ?? itemData?.data?.item ?? itemData?.data ?? itemData;
                  if (item && (item._id || item.id)) {
                    setSoldItem(item);
                  }
                }
              } catch {
                // ignore — non-critical
              }
            }, 2000);
          }
        } else {
          setStatus("error");
          setSession({ id: sessionId, verified: false, reason: data?.message || "not paid" });
        }
      } catch (err) {
        setStatus("error");
      }
    })();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">We couldn't verify your payment. Please contact support.</p>
          <Link href="/dashboard" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-800 transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
        {session?.id && (
          <p className="text-sm text-gray-500 mb-4">Session ID: {session.id.slice(0, 20)}...</p>
        )}
        {/* Show sold confirmation from backend re-fetch */}
        {soldItem && (soldItem.isSold === true || String(soldItem.status || "").toLowerCase() === "sold") && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm font-semibold text-green-800">
              &#10003; Purchase confirmed — {soldItem.phoneModel || "item"} is now marked as sold.
            </p>
          </div>
        )}
        {soldItem && soldItem.isSold !== true && String(soldItem.status || "").toLowerCase() !== "sold" && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              Payment received. The item status is still being updated by our system. Please check back shortly.
            </p>
          </div>
        )}
        <Link href="/dashboard" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-800 transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { markItemAsSold } from "@/lib/actions/item-action";

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [itemStatus, setItemStatus] = useState<"updating" | "sold" | "failed" | null>(null);

  useEffect(() => {
    const productId = typeof window !== "undefined" ? localStorage.getItem("pending_payment_product_id") : null;
    if (!productId) return;

    // Mark item as sold via server action (uses httpOnly cookie token)
    (async () => {
      setItemStatus("updating");
      try {
        const res = await markItemAsSold(productId);
        if (res.success) {
          setItemStatus("sold");
        } else {
          console.error("Failed to mark item as sold:", res.message);
          setItemStatus("failed");
        }
      } catch (err) {
        console.error("Error marking item as sold:", err);
        setItemStatus("failed");
      } finally {
        localStorage.removeItem("pending_payment_product_id");
      }
    })();
  }, []);

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
        {sessionId && (
          <p className="text-sm text-gray-500 mb-4">Session: {sessionId.slice(0, 20)}...</p>
        )}
        {itemStatus === "sold" && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm font-semibold text-green-800">
              &#10003; Item has been marked as sold.
            </p>
          </div>
        )}
        {itemStatus === "failed" && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              Payment received. Item status update is still processing.
            </p>
          </div>
        )}
        <Link href="/dashboard/home" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-800 transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function StripeCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-2">Your payment was cancelled. No charges were made.</p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition">
            Go to Dashboard
          </Link>
          <Link href="/dashboard/home" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-800 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

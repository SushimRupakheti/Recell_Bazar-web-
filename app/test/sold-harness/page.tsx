"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const DEFAULT_WEBHOOK_PAYLOAD = {
  id: "evt_test_checkout_completed",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_ABC123",
      payment_intent: "pi_test_ABC123",
      amount_total: 50000,
      currency: "usd",
      customer_email: "buyer@example.com",
      metadata: {
        productId: "REPLACE_WITH_ITEM_ID",
        orderId: "order123",
        buyerName: "Test Buyer",
        buyerPhone: "1234567890",
        email: "buyer@example.com",
      },
    },
  },
};

type Step = {
  label: string;
  status: "idle" | "running" | "pass" | "fail";
  detail?: string;
};

export default function SoldTestHarnessPage() {
  const [itemId, setItemId] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [itemBefore, setItemBefore] = useState<any>(null);
  const [itemAfter, setItemAfter] = useState<any>(null);

  const updateStep = (idx: number, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const runTest = async () => {
    if (!itemId.trim()) return;
    setRunning(true);
    setItemBefore(null);
    setItemAfter(null);

    const initialSteps: Step[] = [
      { label: "1. Fetch item BEFORE webhook", status: "idle" },
      { label: "2. Send webhook (mark sold)", status: "idle" },
      { label: "3. Wait 2s for webhook processing", status: "idle" },
      { label: "4. Fetch item AFTER webhook", status: "idle" },
      { label: "5. Assert isSold === true && status === 'sold'", status: "idle" },
    ];
    setSteps(initialSteps);

    try {
      // Step 1 — Fetch item before
      updateStep(0, { status: "running" });
      const beforeRes = await fetch(`${API_BASE}/api/items/${itemId.trim()}`);
      if (!beforeRes.ok) {
        updateStep(0, { status: "fail", detail: `GET returned ${beforeRes.status}` });
        setRunning(false);
        return;
      }
      const beforeData = await beforeRes.json();
      const before = beforeData?.item ?? beforeData?.data?.item ?? beforeData?.data ?? beforeData;
      setItemBefore(before);
      updateStep(0, {
        status: "pass",
        detail: `isSold=${before?.isSold ?? "undefined"}, status="${before?.status ?? "undefined"}"`,
      });

      // Step 2 — Send webhook
      updateStep(1, { status: "running" });
      const payload = JSON.parse(JSON.stringify(DEFAULT_WEBHOOK_PAYLOAD));
      payload.data.object.metadata.productId = itemId.trim();

      const webhookRes = await fetch(`${API_BASE}/api/payments/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const webhookText = await webhookRes.text();
      if (!webhookRes.ok) {
        updateStep(1, { status: "fail", detail: `POST returned ${webhookRes.status}: ${webhookText.slice(0, 200)}` });
        setRunning(false);
        return;
      }
      updateStep(1, { status: "pass", detail: `${webhookRes.status} — ${webhookText.slice(0, 120)}` });

      // Step 3 — Wait 2s
      updateStep(2, { status: "running" });
      await new Promise((r) => setTimeout(r, 2000));
      updateStep(2, { status: "pass", detail: "Done" });

      // Step 4 — Fetch item after
      updateStep(3, { status: "running" });
      const afterRes = await fetch(`${API_BASE}/api/items/${itemId.trim()}`);
      if (!afterRes.ok) {
        updateStep(3, { status: "fail", detail: `GET returned ${afterRes.status}` });
        setRunning(false);
        return;
      }
      const afterData = await afterRes.json();
      const after = afterData?.item ?? afterData?.data?.item ?? afterData?.data ?? afterData;
      setItemAfter(after);
      updateStep(3, {
        status: "pass",
        detail: `isSold=${after?.isSold ?? "undefined"}, status="${after?.status ?? "undefined"}"`,
      });

      // Step 5 — Assert
      updateStep(4, { status: "running" });
      const isSold = after?.isSold === true;
      const statusSold = String(after?.status || "").toLowerCase() === "sold";
      if (isSold && statusSold) {
        updateStep(4, { status: "pass", detail: "isSold=true, status='sold' ✓" });
      } else {
        updateStep(4, {
          status: "fail",
          detail: `Expected isSold=true & status="sold" but got isSold=${after?.isSold}, status="${after?.status}"`,
        });
      }
    } catch (err: any) {
      // Mark any remaining running step as failed
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "fail" as const, detail: err?.message } : s))
      );
    } finally {
      setRunning(false);
    }
  };

  const statusColors: Record<string, string> = {
    idle: "bg-gray-100 text-gray-500",
    running: "bg-blue-100 text-blue-700 animate-pulse",
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sold Item — Test Harness</h1>
        <p className="text-sm text-gray-500 mb-6">
          Simulates a Stripe webhook for an item, then verifies the backend sets <code>isSold: true</code> and{" "}
          <code>status: &quot;sold&quot;</code>.
        </p>

        {/* Input */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="Enter Item ID"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none"
          />
          <button
            onClick={runTest}
            disabled={running || !itemId.trim()}
            className="shrink-0 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? "Running..." : "Run Test"}
          </button>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-3 mb-8">
            {steps.map((s, i) => (
              <div key={i} className={`rounded-lg p-3 ${statusColors[s.status]}`}>
                <p className="text-sm font-semibold">{s.label}</p>
                {s.detail && <p className="mt-1 text-xs font-mono break-all">{s.detail}</p>}
              </div>
            ))}
          </div>
        )}

        {/* JSON comparison */}
        {(itemBefore || itemAfter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Before Webhook</h3>
              <pre className="max-h-64 overflow-auto rounded-lg border bg-white p-3 text-xs text-gray-700">
                {itemBefore ? JSON.stringify(itemBefore, null, 2) : "—"}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">After Webhook</h3>
              <pre className="max-h-64 overflow-auto rounded-lg border bg-white p-3 text-xs text-gray-700">
                {itemAfter ? JSON.stringify(itemAfter, null, 2) : "—"}
              </pre>
            </div>
          </div>
        )}

        {/* Manual Webhook Payload */}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900">
            View Webhook Payload (for Postman / curl)
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border bg-white p-4 text-xs text-gray-700">
            {JSON.stringify(
              (() => {
                const p = JSON.parse(JSON.stringify(DEFAULT_WEBHOOK_PAYLOAD));
                p.data.object.metadata.productId = itemId || "REPLACE_WITH_ITEM_ID";
                return p;
              })(),
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

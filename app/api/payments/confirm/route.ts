import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function POST(req: Request) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json({ success: false, message: "Invalid JSON body", error: String(parseErr) }, { status: 400 });
    }
    const sessionId = body?.sessionId;
    const paymentIntentId = body?.paymentIntentId || body?.payment_intent_id || body?.payment_intent?.id;
    if (!sessionId && !paymentIntentId) {
      return NextResponse.json({ success: false, message: "Missing sessionId or paymentIntentId" }, { status: 400 });
    }

    const debug = process.env.NODE_ENV !== "production";
    if (debug) {
      console.log("[payments/confirm] incoming body:", JSON.stringify(body).slice(0, 1000));
    }

    // Forward verification to backend (which has the Stripe secret key)
    const forwardUrl = `${BASE.replace(/\/$/, "")}/api/payments/confirm`;
    if (debug) console.log("[payments/confirm] forwarding to backend:", forwardUrl);

    const backendRes = await fetch(forwardUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, paymentIntentId }),
    });

    let backendData: any = null;
    try {
      backendData = await backendRes.json();
    } catch {
      const text = await backendRes.text().catch(() => "");
      return NextResponse.json({
        success: false,
        paid: false,
        message: "Backend returned non-JSON response",
        backendStatus: backendRes.status,
        backendText: text.slice(0, 500),
      }, { status: 502 });
    }

    if (debug) {
      console.log("[payments/confirm] backend responded:", backendRes.status, JSON.stringify(backendData).slice(0, 500));
    }

    // Pass through whatever the backend says
    const paid = backendData?.paid ?? backendData?.success ?? false;
    return NextResponse.json({
      success: true,
      paid: !!paid,
      forwarded: backendRes.ok,
      backendStatus: backendRes.status,
      metadata: backendData?.metadata,
      productId: backendData?.productId || backendData?.metadata?.productId,
      ...backendData,
    });
  } catch (err: any) {
    console.error("[payments/confirm] error:", err?.message || err);
    return NextResponse.json({ success: false, message: err?.message || String(err) }, { status: 500 });
  }
}

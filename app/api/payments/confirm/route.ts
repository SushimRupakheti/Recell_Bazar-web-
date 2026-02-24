import { NextResponse } from "next/server";
// Import Stripe dynamically so builds without the package won't fail during static analysis.

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
    if (!sessionId && !paymentIntentId) return NextResponse.json({ success: false, message: "Missing sessionId or paymentIntentId" }, { status: 400 });

    // Helpful debug info
    const debug = process.env.NODE_ENV !== "production";
    if (debug) {
      try {
        console.log("[payments/confirm] incoming body:", JSON.stringify(body).slice(0, 1000));
      } catch (e) {
        console.log("[payments/confirm] incoming body (stringify failed)");
      }
    }

    if (debug) {
      console.log("[payments/confirm] ENV: STRIPE_SECRET_KEY=", !!process.env.STRIPE_SECRET_KEY, " NEXT_PUBLIC_API_BASE_URL=", process.env.NEXT_PUBLIC_API_BASE_URL, " NODE_TLS_REJECT_UNAUTHORIZED=", process.env.NODE_TLS_REJECT_UNAUTHORIZED);
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ success: false, message: "Missing STRIPE_SECRET_KEY on server" }, { status: 500 });
    }

    // dynamic import
    let StripeLib: any = null;
    try {
        const newLocal = 'stripe';
      StripeLib = (await import(newLocal)).default;
    } catch (err) {
      return NextResponse.json({ success: false, message: "Stripe library not available on server" }, { status: 500 });
    }

    const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" } as any);
    let paid = false;
    let session: any = null;
    let paymentIntent: any = null;

    // retrieve either a Checkout session or a PaymentIntent depending on what's provided
    try {
      if (sessionId) {
        session = await stripe.checkout.sessions.retrieve(sessionId as string, { expand: ["payment_intent"] } as any);
        paymentIntent = session.payment_intent as any;
        paid = (session.payment_status === "paid") || (session.status === "complete") || (paymentIntent && paymentIntent.status === "succeeded");
      } else if (paymentIntentId) {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string) as any;
        // Accept several statuses that indicate a completed/processing payment depending on integration
        const okStatuses = ["succeeded", "processing", "requires_capture", "paid", "complete", "completed"];
        paid = okStatuses.includes((paymentIntent.status || "").toString());
      }
    } catch (stripeErr: any) {
      const causeCode = stripeErr?.cause?.code || stripeErr?.code || null;
      console.error('[payments/confirm] stripe fetch error:', stripeErr?.message || stripeErr, 'causeCode=', causeCode, 'stack=', stripeErr?.stack);
      // include any nested cause if present
      if (stripeErr?.cause) {
        try { console.error('[payments/confirm] stripeErr.cause:', JSON.stringify(stripeErr.cause).slice(0,1000)); } catch (e) { console.error('[payments/confirm] stripeErr.cause (stringify failed)'); }
      }
      const userMsg = causeCode === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
        ? 'Server TLS certificate verification failed (UNABLE_TO_GET_ISSUER_CERT_LOCALLY). Configure system CA or allow this host.'
        : (stripeErr?.message || 'Error retrieving Stripe objects');
      return NextResponse.json({ success: false, message: userMsg, causeCode, rawError: stripeErr?.message, stack: stripeErr?.stack }, { status: 502 });
    }

    // forward to backend to persist (best-effort)
    const forwardUrl = `${BASE.replace(/\/$/, "")}/api/payments/confirm`;
    let backendRes: Response | null = null;
    let backendText: string | null = null;
    try {
      if (debug) console.log('[payments/confirm] forwarding to backend url=', forwardUrl);
      backendRes = await fetch(forwardUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session, paymentIntent, paid }),
      });
      try {
        backendText = await backendRes.text();
      } catch (tbErr) {
        backendText = `failed to read backend text: ${String(tbErr)}`;
      }
      if (debug) console.log('[payments/confirm] backend responded ok=', backendRes.ok, 'status=', backendRes.status, 'text-snippet=', (backendText || '').slice(0,1000));
    } catch (err: any) {
      console.error('[payments/confirm] error forwarding to backend:', err?.message || err, 'stack=', err?.stack);
      try { console.error('[payments/confirm] forward error cause=', JSON.stringify(err?.cause).slice(0,1000)); } catch (e) {}
    }

    // Prepare a small response with diagnostics to help debug client-side
    const resp: any = { success: true, paid: !!paid, forwarded: backendRes ? backendRes.ok : false, backendStatus: backendRes ? backendRes.status : null, backendText };
    if (session) resp.session = { id: session.id, amount_total: session.amount_total };
    if (paymentIntent) resp.paymentIntent = { id: paymentIntent.id, status: paymentIntent.status, amount: paymentIntent.amount };

    return NextResponse.json(resp);
  } catch (err: any) {
    const debug = process.env.NODE_ENV !== "production";
    const message = err?.message || String(err);
    const stack = debug ? err?.stack : undefined;
    console.error("[payments/confirm] error:", message, stack);
    return NextResponse.json({ success: false, message, stack }, { status: 500 });
  }
}

import React from "react";

type Props = { searchParams?: { [key: string]: string | string[] | undefined } };

export default function Page({ searchParams }: Props) {
  const raw = Array.isArray(searchParams?.order) ? searchParams?.order[0] : searchParams?.order;
  let order: any = null;
  try {
    order = raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch {
    order = null;
  }

  // eSewa endpoint
  const ESEWA_URL = "https://rc-epay.esewa.com.np/auth";
  const scd = process.env.NEXT_PUBLIC_ESEWA_SCD || "";

  // Build su/fu to include original order on return
  const su = `${process.env.NEXT_PUBLIC_APP_ORIGIN || ""}/esewa/return?order=${encodeURIComponent(JSON.stringify(order || {}))}`;
  const fu = `${process.env.NEXT_PUBLIC_APP_ORIGIN || ""}/esewa/return?order=${encodeURIComponent(JSON.stringify(order || {}))}&failed=1`;

  const amt = order?.amount ?? 0;
  const pid = String(order?.oid ?? order?.itemId ?? "");
  const tAmt = amt;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Redirecting to eSewa</title>
      </head>
      <body>
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <h2>Redirecting to eSewa...</h2>
          <p>Please wait — you will be redirected to eSewa to complete payment.</p>
        </div>

        <form id="esewaForm" method="POST" action={ESEWA_URL}>
          <input type="hidden" name="amt" value={String(amt)} />
          <input type="hidden" name="psc" value="0" />
          <input type="hidden" name="pdc" value="0" />
          <input type="hidden" name="tAmt" value={String(tAmt)} />
          <input type="hidden" name="pid" value={pid} />
          <input type="hidden" name="scd" value={scd} />
          <input type="hidden" name="su" value={su} />
          <input type="hidden" name="fu" value={fu} />
        </form>

        <script dangerouslySetInnerHTML={{ __html: `document.getElementById('esewaForm').submit();` }} />
      </body>
    </html>
  );
}

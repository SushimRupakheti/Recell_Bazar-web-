import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function GET(req: Request) {
  try {
    const url = `${BASE}/api/admin/payments`;

    const cookie = req.headers.get("cookie") || "";
    const auth = req.headers.get("authorization") || "";

    const getCookieValue = (cookieHeader: string, name: string) => {
      if (!cookieHeader) return null;
      const parts = cookieHeader.split("; ");
      const match = parts.find((p) => p.startsWith(name + "="));
      if (!match) return null;
      return decodeURIComponent(match.split("=").slice(1).join("="));
    };

    const tokenFromCookie = getCookieValue(cookie, "auth_token") || getCookieValue(cookie, "token");
    const authorizationHeader = auth || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : "");

    const forwardUrl = new URL(url);
    // preserve query string if present
    const incomingUrl = new URL(req.url);
    incomingUrl.searchParams.forEach((v, k) => forwardUrl.searchParams.append(k, v));

    const res = await fetch(forwardUrl.toString(), {
      method: "GET",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
      },
    });

    const ct = res.headers.get("content-type") || "application/json";

    if (res.ok) {
      const body = await res.text();
      return new NextResponse(body, { status: res.status, headers: { "content-type": ct } });
    }

    let parsed: any = null;
    try {
      parsed = await res.json();
    } catch {
      try {
        parsed = await res.text();
      } catch {}
    }

    return NextResponse.json({ success: false, status: res.status, message: parsed || "Backend error" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Proxy failed" }, { status: 500 });
  }
}

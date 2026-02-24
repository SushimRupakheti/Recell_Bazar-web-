import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function GET(req: Request, { params }: { params: any }) {
  try {
    // params can be a Promise in some Next.js dev/runtime setups — await it
    const p = await params;
    const id = p?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ success: false, message: "Missing or invalid id" }, { status: 400 });
    }
    const url = `${BASE}/api/items/${id}`;

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

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
      },
    });

    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json";

    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": ct },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Proxy failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const p = await params;
    const id = p?.id;
    if (!id || id === "undefined") {
      return NextResponse.json({ success: false, message: "Missing or invalid id" }, { status: 400 });
    }
    const url = `${BASE}/api/items/${id}`;

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

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
        "content-type": req.headers.get("content-type") || "application/json",
      },
    });

    const ct = res.headers.get("content-type") || "application/json";

    if (res.ok) {
      const resBody = await res.text();
      return new NextResponse(resBody, { status: res.status, headers: { "content-type": ct } });
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

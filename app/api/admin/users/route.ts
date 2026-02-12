import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function GET(req: Request) {
  try {
    // Forward GET to backend users list endpoint
    const url = `${BASE}/api/admin/users`;

    const cookie = req.headers.get("cookie") || "";
    const auth = req.headers.get("authorization") || "";

    // If backend expects Bearer token in Authorization header but
    // client stores token in cookie, extract and set header.
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

export async function POST(req: Request) {
  try {
    // Forward POST to backend register endpoint
    const url = `${BASE}/api/admin/users/register`;

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

    // Forward raw body (works for multipart/form-data and JSON)
    const bodyBuffer = await req.arrayBuffer();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
        "content-type": req.headers.get("content-type") || "application/json",
      },
      body: bodyBuffer,
    });
    const ct = res.headers.get("content-type") || "application/json";

    if (res.ok) {
      const resBody = await res.text();
      return new NextResponse(resBody, {
        status: res.status,
        headers: { "content-type": ct },
      });
    }

    // Non-OK: forward backend response body and status code to the client
    let parsed: any = null;
    let bodyText: string = "";
    const ctBackend = res.headers.get("content-type") || "text/plain";
    try {
      if (ctBackend.includes("application/json")) {
        parsed = await res.json();
        bodyText = JSON.stringify(parsed);
      } else {
        bodyText = await res.text();
      }
    } catch {
      bodyText = "";
    }

    return new NextResponse(bodyText || "", {
      status: res.status,
      headers: { "content-type": ctBackend },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Proxy failed" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function getCookieValue(cookieHeader: string, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split("; ");
  const match = parts.find((p) => p.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const auth = req.headers.get("authorization") || "";

    const tokenFromCookie =
      getCookieValue(cookie, "auth_token") || getCookieValue(cookie, "token");
    const token = auth?.replace("Bearer ", "") || tokenFromCookie || "";

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Decode JWT to get user id
    let userId: string;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded._id || decoded.userId;
      if (!userId) throw new Error("No user id in token");
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Forward the FormData body to the backend
    const body = await req.arrayBuffer();
    const contentType = req.headers.get("content-type") || "";

    const url = `${BASE}/api/users/${userId}/profile-picture`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(cookie ? { cookie } : {}),
        authorization: `Bearer ${token}`,
        "content-type": contentType,
      },
      body: Buffer.from(body),
    });

    const ct = res.headers.get("content-type") || "application/json";
    const resBody = await res.text();

    return new NextResponse(resBody, {
      status: res.status,
      headers: { "content-type": ct },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Upload proxy failed" },
      { status: 500 }
    );
  }
}

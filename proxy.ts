import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value; // set on login
  const role = req.cookies.get("role")?.value;   // set on login (e.g. "admin" | "user")

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/user");

  // must be logged in
  if ((isAdminRoute || isUserRoute) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // must be admin
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};

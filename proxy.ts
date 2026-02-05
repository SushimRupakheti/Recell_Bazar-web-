import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/forget-password"];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const isPublicPath = publicPaths.some((p) => path.startsWith(p));
  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/user");

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isUserRoute && role !== "user" && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
    "/forget-password",
  ],
};

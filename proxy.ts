import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forget_password",
  "/auth/reset-password",
];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // support both legacy `token` and the app's `auth_token`
  const token = req.cookies.get("auth_token")?.value  //|| req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const isPublicPath = publicPaths.some((p) => path.startsWith(p));
  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/user");

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
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
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/user/:path*", "/auth/:path*"],
};
// import { NextRequest, NextResponse } from "next/server";
// import { jwtDecode } from "jwt-decode";

// const publicPaths = [
//   "/auth/login",
//   "/auth/register",
//   "/auth/forget_password",
//   "/auth/reset-password",
// ];

// export default function proxy(req: NextRequest) {
//   const path = req.nextUrl.pathname;

//   const token = req.cookies.get("auth_token")?.value;

//   let role: string | null = null;

//   if (token) {
//     try {
//       const decoded: any = jwtDecode(token);
//       role = decoded.role;
//     } catch {
//       role = null;
//     }
//   }

//   const isPublicPath = publicPaths.some((p) => path.startsWith(p));
//   const isAdminRoute = path.startsWith("/admin");
//   const isUserRoute = path.startsWith("/user");

//   if (!token && !isPublicPath) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   if (token && isPublicPath) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (isAdminRoute && role !== "admin") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (isUserRoute && role !== "user" && role !== "admin") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/user/:path*", "/auth/:path*"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  const isLoggedIn = sessionToken === "AdminToken";

  // 1. เส้นทางที่ต้องการ Login เพื่อเข้าถึง (Protected routes)
  const isProtectedRoute = pathname.startsWith("/categories") || pathname.startsWith("/settings");

  if (isProtectedRoute && !isLoggedIn) {
    // บังคับเปลี่ยนเส้นทางไปหน้า Login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. หากล็อกอินอยู่แล้ว พยายามเข้าหน้า Login จะเด้งไป Dashboard
  if (pathname.startsWith("/login") && isLoggedIn) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // รัน middleware กับเส้นทางเหล่านี้เท่านั้นเพื่อลด overhead
  matcher: [
    "/categories/:path*",
    "/settings/:path*",
    "/login",
  ],
};

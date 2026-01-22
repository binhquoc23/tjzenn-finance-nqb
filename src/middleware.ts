import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/favicon.ico", "/images/logo.png"];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Redirect if vercel.app
  // if (host.endsWith(".vercel.app")) {
  //   const url = request.nextUrl.clone();
  //   url.host = "admin.tjzenn.com";
  //   url.protocol = "https:";
  //   return NextResponse.redirect(url, 301);
  // }

  // 2. getInfo in token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isLoggedIn = !!token;

  // 3. if login redirect dashboard
  if (
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot") &&
    isLoggedIn
  ) {
    return NextResponse.redirect(`${origin}/auth/dashboard`);
  }

  // Chỉ chặn các đường dẫn /auth/**
  const isAuthRoute = pathname.startsWith("/auth");
  if (isAuthRoute && !isLoggedIn) {
    // Chưa login thì mời qua /login
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|fonts|.*\\..*).*)"],
};

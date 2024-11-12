import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/protected');
    const isAuth = !!req.nextauth.token;

    if (isProtectedRoute && !isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/guild-stats/:path*",
    "/reservations/:path*",
    "/tibia-map/:path*",
    "/settings/:path*"
  ],
};



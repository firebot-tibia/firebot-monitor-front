import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token
    const isPublicRoute = req.nextUrl.pathname === '/'

    if (isPublicRoute && isAuth) {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: [
    '/home/:path*',
    '/guild-stats/:path*',
    '/reservations/:path*',
    '/tibia-map/:path*',
    '/settings/:path*',
  ],
}

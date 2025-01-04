import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { routes } from './constants/routes'

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token
    const isPublicRoute = req.nextUrl.pathname === `${routes.home}`

    if (isPublicRoute && isAuth) {
      return NextResponse.redirect(new URL(`${routes.guild}`, req.url))
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL(`${routes.home}`, req.url))
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
    '/statistics/:path*',
    '/guild/:path*',
    '/reservations/:path*',
    '/tibia-map/:path*',
    '/settings/:path*',
  ],
}

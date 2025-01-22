import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

import { routes } from './constants/routes'
import { Logger } from './middlewares/useLogger'

const logger = Logger.getInstance()

export default withAuth(
  function middleware(req) {
    const startTime = Date.now()
    const isAuth = !!req.nextauth.token
    const isPublicRoute = req.nextUrl.pathname === `${routes.home}`

    logger.debug(
      'Middleware Check',
      {
        path: req.nextUrl.pathname,
        isAuth,
        isPublicRoute,
      },
      startTime,
    )

    if (isPublicRoute && isAuth) {
      logger.info(
        'Redirecting authenticated user from public route',
        {
          from: req.nextUrl.pathname,
          to: routes.guild,
        },
        startTime,
      )
      return NextResponse.redirect(new URL(`${routes.guild}`, req.url))
    }

    if (!isAuth) {
      logger.warn(
        'Unauthorized access attempt',
        {
          path: req.nextUrl.pathname,
          redirectTo: routes.home,
        },
        startTime,
      )
      return NextResponse.redirect(new URL(`${routes.home}`, req.url))
    }

    logger.debug(
      'Middleware passed',
      {
        path: req.nextUrl.pathname,
      },
      startTime,
    )
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        const isAuthorized = !!token
        logger.debug('Authorization check', { isAuthorized })
        return isAuthorized
      },
    },
  },
)

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico).*)',
    '/statistics/:path*',
    '/guild/:path*',
    '/reservations/:path*',
    '/tibia-map/:path*',
    '/settings/:path*',
  ],
}

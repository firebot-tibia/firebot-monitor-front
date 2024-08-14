import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL('/', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*', 
    '/soulwar/:path*', 
    '/orange/:path*', 
    '/settings/:path*', 
    '/enemy/:path*', 
    '/deathlist/:path*', 
    '/guild-stats/:path*'
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwtDecode from 'jsonwebtoken';
import { DecodedToken } from '../shared/dtos/auth.dto';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  if (pathname === '/' || pathname.startsWith('/public') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const decoded = jwtDecode.decode(token) as DecodedToken;
    if (decoded && Date.now() < decoded.exp * 1000) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/home/:path*', '/soulwar/:path*', '/orange/:path*', '/settings/:path*', '/enemy/:path*', '/deathlist/:path*', '/guild-stats/:path*'],
};

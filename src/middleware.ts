export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/home/:path*', 
    '/soulwar/:path*', 
    '/orange/:path*', 
    '/enemy/:path*', 
    '/deathlist/:path*', 
    '/guild-stats/:path*'
  ],
};

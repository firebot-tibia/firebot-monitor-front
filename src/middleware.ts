export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/home/:path*', 
    '/tibia-map/:path*', 
    '/reservations/:path*', 
    '/guild-stats/:path*'
  ],
};

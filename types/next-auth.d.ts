import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    access_token?: string
    refresh_token?: string
    user: User
  }

  interface User {
    access_token: string
    refresh_token: string
    ally_guild: string
    email: string
    enemy_guild: string
    exp: number
    status: string
    sub: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string
    refresh_token?: string
    ally_guild: string
    email: string
    enemy_guild: string
    exp: number
    status: string
    sub: string
  }
}

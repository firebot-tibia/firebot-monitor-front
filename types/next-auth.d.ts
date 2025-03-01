import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    access_token?: string
    refresh_token?: string
    user: {
      id: string
      email: string
      ally_guild: string
      enemy_guild: string
      exp: number
      status: string
      sub: string
      access_token?: string
      refresh_token?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    ally_guild: string
    enemy_guild: string
    exp: number
    status: string
    sub: string
    access_token?: string
    refresh_token?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string
    refresh_token?: string
    ally_guild?: string
    enemy_guild?: string
    exp?: number
    status?: string
    sub?: string
  }
}

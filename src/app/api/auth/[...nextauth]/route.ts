import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import type { NextAuthOptions, User } from 'next-auth'
import NextAuth, { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

import type { DecodedToken } from '../../../../components/features/auth/types/auth.types'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, credentials)
          return data
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        const decoded = jwtDecode<DecodedToken>(user.access_token)
        return {
          ...token,
          ...decoded,
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        }
      }

      if (token.exp && token.exp <= Date.now() / 1000) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, null, {
            headers: { 'x-refresh-token': token.refresh_token },
          })
          const decoded = jwtDecode<DecodedToken>(data.access_token)
          return {
            ...token,
            ...decoded,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          }
        } catch {
          return { ...token, error: 'RefreshAccessTokenError' }
        }
      }

      return token
    },

    async session({ token, session }: { token: JWT; session?: any }) {
      return {
        ...session,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        user: {
          access_token: token.access_token!,
          refresh_token: token.refresh_token!,
          ally_guild: token.ally_guild,
          email: token.email,
          enemy_guild: token.enemy_guild,
          exp: token.exp,
          status: token.status,
          sub: token.sub,
        },
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

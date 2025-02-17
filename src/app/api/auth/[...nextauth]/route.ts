import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import api from '@/libs/api/firebot-api'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials')
          }

          const response = await api.post('/login', {
            email: credentials.email,
            password: credentials.password,
            json: true,
          })

          if (!response.data?.access_token || !response.data?.refresh_token) {
            throw new Error('Invalid response from server')
          }

          return {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          }
        } catch (error) {
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          access_token: user.access_token,
          refresh_token: user.refresh_token,
          ally_guild: user.ally_guild,
          enemy_guild: user.enemy_guild,
          exp: user.exp,
          status: user.status,
          sub: user.sub,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        user: {
          ...session.user,
          id: token.sub,
          email: session.user.email,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          ally_guild: token.ally_guild,
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
    error: '/auth/error',
  },
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import api from '@/libs/api/firebot-api'

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
          const { data } = await api.post('/login', credentials)
          return data
        } catch {
          return null
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
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

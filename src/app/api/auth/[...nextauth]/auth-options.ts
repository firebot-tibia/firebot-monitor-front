import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';
import axios from 'axios';
import { useAuthStore } from '../../../../store/auth-store';
import { DecodedToken } from '../../../../shared/interface/auth.interface';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'x-refresh-token': token.refreshToken as string,
      },
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    const refreshedTokens = await response.json();
    const decoded = jwtDecode<{ exp: number }>(refreshedTokens.accessToken);
    useAuthStore.getState().setTokens(refreshedTokens.accessToken, refreshedTokens.refreshToken);
    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    useAuthStore.getState().clearTokens();
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          if (data) {
            return {
              ...data,
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            };
          }
          return null;
        } catch (error) {
          console.error('Login error:', error);
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: any }) {
      if (user) {
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        const decoded = jwtDecode(user.access_token) as DecodedToken;
        token.exp = decoded.exp;
      }
      const nowUnix = Math.floor(Date.now() / 1000);
      if (token.exp && nowUnix >= token.exp - 60) {
        return refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }: { session: any, token: JWT }) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.error = token.error;
      session.user = {
        ally_guild: token.ally_guild,
        email: token.email,
        enemy_guild: token.enemy_guild,
        exp: token.exp,
        status: token.status,
        sub: token.sub,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
};
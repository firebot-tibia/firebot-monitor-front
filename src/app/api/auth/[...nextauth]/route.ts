import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { DecodedToken } from '../../../../shared/dtos/auth.dto';
import jwt from 'jsonwebtoken';

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    authorize: async (credentials) => {
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
        return null;
      }
    },
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
  }),
];

const handler = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: any }) {
      if (user) {
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;

        const decoded = jwt.decode(user.access_token) as DecodedToken;
        token.exp = decoded.exp;
      }

      const isExpired = token.exp && Date.now() >= token.exp * 1000;

      if (isExpired) {
        console.log('Token expirado, tentando refresh...');
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {}, {
            headers: {
              'x-refresh-token': token.refresh_token,
            },
          });

          token.access_token = data.access_token;
          const decoded = jwt.decode(data.access_token) as DecodedToken;
          token.exp = decoded.exp;
        } catch (error) {
          console.error('Erro ao tentar atualizar o token:', error);
          return Promise.reject(error);
        }
      }

      return token;
    },

    async session({ session, token }: { session: any, token: JWT }) {
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
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
});

export { handler as GET, handler as POST };

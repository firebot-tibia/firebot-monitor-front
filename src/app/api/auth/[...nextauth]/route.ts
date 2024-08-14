import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    authorize: async (credentials) => {
      const user = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        email: credentials?.email,
        password: credentials?.password
      }, {
          headers: {
            "Content-Type": "application/json",
            Accept: '*'
          },
      })

      if(user) {
        return user.data;
      }

      return null;
    },
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      token: { label: "Token", type: "text" }
    }
  })
];

const handler = NextAuth({
  providers,
  callbacks: {
    async jwt({token, user}: { token: any, user: any}) {
      if (user) {
        token.access_token = user.access_token
      }

      return token
    },
    async session({session, token}) {
      session.user = token
      return session
    },
    redirect: async ({ url, baseUrl }) => {
      return url.startsWith(baseUrl)
        ? url
        : baseUrl
    },
    
  
  },
  pages: {
    signIn: '/',
  }
});

export { handler as GET, handler as POST };

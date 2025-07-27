import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from 'bcryptjs';
import prisma from "@/lib/prisma";
import { encode, decode } from "next-auth/jwt";

// Ensure the secret is a string
const secret = process.env.NEXTAUTH_SECRET as string;

export const authOptions: NextAuthOptions = {
  // Use the correct PrismaAdapter that is compatible with NextAuth v4
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials.password) {
                return null;
            }
            const user = await prisma.user.findUnique({
                where: { email: credentials.email }
            });

            if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
                return { id: user.id, name: user.name, email: user.email, image: user.image };
            }
            return null;
        }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // --- KEY FIX: Force NextAuth to use JWS (signed) instead of JWE (encrypted) ---
  jwt: {
    secret: secret,
    encode: async ({ secret, token }) => {
      // The signing algorithm is implicitly HS256 by default when using a secret.
      // The encode function from next-auth/jwt handles this.
      return encode({ token, secret });
    },
    decode: async ({ secret, token }) => {
      // The decode function also uses the same defaults.
      if (!token) throw new Error("No token to decode");
      return decode({ token, secret });
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    // The jwt callback is important to attach the user ID to the token
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
        }
        return token;
    }
  },
  secret: secret,
};

export default NextAuth(authOptions);
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
    // This callback is called whenever a JWT is created (i.e. at sign in)
    // or updated (i.e. whenever a session is accessed in the client).
    async jwt({ token, user, account }) {
      // Persist the user's ID and other data to the token right after sign-in
      if (account && user) {
        token.id = user.id;
        // Also persist subscription status to the token
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.creemPriceId = dbUser?.creemPriceId;
      }
      return token;
    },
    // This callback is called whenever a session is checked.
    // We forward data from the token to the session object.
    async session({ session, token }) {
      // The token now contains the data we persisted in the `jwt` callback
      if (token && session.user) {
          session.user.id = token.id as string;
          session.user.creemPriceId = token.creemPriceId as string | null;
      }
      return session;
    }
  },
  secret: secret,
};

export default NextAuth(authOptions);
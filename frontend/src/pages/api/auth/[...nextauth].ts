import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import * as bcrypt from 'bcryptjs';
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

// --- Custom JWT handling to ensure it's a signed JWS, not an encrypted JWE ---
import { getToken } from "next-auth/jwt";
const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ... (your existing providers)
  ],
  session: {
    strategy: "jwt",
  },
  // --- KEY FIX: Force NextAuth to use JWS (signed) instead of JWE (encrypted) ---
  jwt: {
    // A secret to use for signing Key generation (you should set this!)
    secret: process.env.NEXTAUTH_SECRET,
    // The maximum age of the JWT in seconds.
    maxAge: 60 * 60 * 24 * 30, // 30 days
    // The signing algorithm.
    async encode({ secret, token }) {
      // Use the jwt.encode method to create a JWS
      return await getToken({
        template: {
          ...token,
        },
        secret,
        encryption: false, // This is the crucial part to disable encryption
      });
    },
    async decode({ secret, token }) {
      if (!token) {
        throw new Error("No token to decode");
      }
      // Use the jwt.decode method to verify and decode the JWS
      return await getToken({
        token,
        secret,
        encryption: false,
        verificationOptions: {
          algorithms: ["HS256"],
        },
      });
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    // ... (any other callbacks you might have)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
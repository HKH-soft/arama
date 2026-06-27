import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Changed from bcrypt-ts
import * as argon2 from "argon2";
import { getUserByEmail } from "./auth-helpers-no-auth";

export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.passwordHash) {
          return null;
        }

        // Try Argon2 first, then fall back to bcrypt
        let isValid = false;
        try {
          isValid = await argon2.verify(user.passwordHash, credentials.password);
        } catch (error) {
          // If argon2 fails, try bcrypt
          try {
            isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          } catch (bcryptError) {
            return null;
          }
        }

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};
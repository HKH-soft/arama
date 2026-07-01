import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./auth-helpers-no-auth";
import { CredentialsSignin, type JWT, type Session } from "next-auth";
import { loginSchema } from "./validators/auth";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class UserNotFoundError extends CredentialsSignin {
  code = "user_not_found";
}

class AccountDisabledError extends CredentialsSignin {
  code = "account_disabled";
}

export const authConfig = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: unknown) {
        // Validate input format first
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.warn("Login validation failed:", parsed.error.issues);
          throw new InvalidCredentialsError();
        }

        const { email, password } = parsed.data;

        // Fetch user from database
        let user;
        try {
          user = await getUserByEmail(email);
        } catch (error) {
          console.error("Error fetching user during login:", error);
          throw new CredentialsSignin();
        }

        // User not found in database
        if (!user) {
          console.warn(`Login failed: user not found for email '${email}'`);
          throw new UserNotFoundError();
        }

        // User exists but has no password (e.g., OAuth-only account trying password login)
        if (!user.passwordHash) {
          console.warn(`Login failed: user '${email}' has no password hash (OAuth account?)`);
          throw new InvalidCredentialsError();
        }

        // Check if account is active
        if (user.isActive === false) {
          console.warn(`Login failed: user '${email}' account is disabled`);
          throw new AccountDisabledError();
        }

        // Verify password
        let isValid = false;
        try {
          isValid = await bcrypt.compare(password, user.passwordHash);
        } catch (error) {
          console.error("Error comparing passwords:", error);
          throw new CredentialsSignin();
        }

        if (!isValid) {
          console.warn(`Login failed: invalid password for email '${email}'`);
          throw new InvalidCredentialsError();
        }

        // Success - return user
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
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
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
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { getUserByEmail, getUserById } from "./auth-helpers";

export { getUserByEmail, getUserById };

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

// Export handlers as a named export as well
export const handlers = { GET, POST };

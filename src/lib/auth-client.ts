import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  twoFactorClient,
  usernameClient,
  phoneNumberClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    twoFactorClient(),
    usernameClient(),
    phoneNumberClient(),
    magicLinkClient(),
    organizationClient(),
    passkeyClient(),
  ],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Re-export commonly used functions for convenience
export const { signIn, signOut, useSession, signUp } = authClient;

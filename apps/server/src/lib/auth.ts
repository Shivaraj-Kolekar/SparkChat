import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

// Parse CORS origins from environment variable
const getTrustedOrigins = () => {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    console.warn("CORS_ORIGIN not set - authentication may not work properly");
    return [];
  }

  // Support multiple origins separated by commas
  return corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: getTrustedOrigins(),
  secret:
    process.env.BETTER_AUTH_SECRET || "fallback-secret-change-in-production",
  cookies: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    // Remove domain restriction for now to debug
  },
  callbacks: {
    onSignIn: async ({ user, account, profile }: any) => {
      console.log("User signed in:", user.email);
      return true;
    },
    onSession: async ({ session, user }: any) => {
      console.log("Session created for user:", user.email);
      return session;
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

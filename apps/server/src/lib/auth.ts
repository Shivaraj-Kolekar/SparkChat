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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.BETTER_AUTH_URL + "/api/auth/google/callback",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.BETTER_AUTH_URL + "/api/auth/github/callback",
    },
  },
});

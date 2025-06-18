import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  session: {
    strategy: "jwt",
  },
});

export const { signIn, signOut, signUp, useSession } = authClient;

// Utility function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await authClient.getSession();
    return session && "user" in session && !!session.user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Utility function to get session data
export const getSession = async () => {
  try {
    const session = await authClient.getSession();
    return session && "user" in session ? session : null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

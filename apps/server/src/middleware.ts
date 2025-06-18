import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: Request) {
  const res = NextResponse.next();

  // Handle CORS
  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || ""
  );
  res.headers.append(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie, X-Requested-With"
  );

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return res;
  }

  // Handle Better Auth session
  try {
    const session = await auth.api.getSession(request);
    if (session) {
      // Add session info to headers for debugging
      res.headers.append("X-Session-User", session.user?.name || "unknown");
    }
  } catch (error) {
    console.error("Middleware session error:", error);
  }

  return res;
}

export const config = {
  matcher: "/:path*",
};

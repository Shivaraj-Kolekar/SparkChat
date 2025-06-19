import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "https://sparkchat.dpdns.org";

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};

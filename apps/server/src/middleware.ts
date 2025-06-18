import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: Request) {
  const res = NextResponse.next();

  // Handle CORS
  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append(
    "Access-Control-Allow-Origin",
    "https://spark-chat-app.vercel.app"
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

  return res;
}

export const config = {
  matcher: "/:path*",
};

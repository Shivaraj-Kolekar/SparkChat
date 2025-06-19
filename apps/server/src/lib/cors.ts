import { NextRequest, NextResponse } from "next/server";

export function withCORS(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
    const response = await handler(req, ...args);
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGIN || "*"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization"
    );
    return response;
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://sparkchat.dpdns.org/",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Cookie, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

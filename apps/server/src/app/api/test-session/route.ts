import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Test session route called");
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  try {
    const session = await auth.api.getSession(req);
    console.log("Session result:", session);

    if (!session || !session.session?.userId) {
      console.log("No valid session found");
      return new Response(
        JSON.stringify({
          authenticated: false,
          message: "No valid session found",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Valid session found for user:", session.user?.name);
    return new Response(
      JSON.stringify({
        authenticated: true,
        user: session.user,
        sessionId: session.session.id,
        userId: session.session.userId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Session test error:", error);
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: "Session test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

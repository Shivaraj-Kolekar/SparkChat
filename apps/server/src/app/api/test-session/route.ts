import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session || !session.session?.userId) {
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
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

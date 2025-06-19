import { withCORS } from "@/lib/cors";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export const GET = withCORS(async (req: NextRequest) => {
  const session = getClerkSession(req);
  const user = await getClerkUser(req);

  if (!session.userId || !user) {
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
      user,
      sessionId: session.sessionId,
      userId: session.userId,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});

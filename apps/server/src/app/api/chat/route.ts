import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { chats as chatTable } from "@/db/schema/auth";
import { v4 as uuidv4 } from "uuid";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { withCORS } from "@/lib/cors";
import { user as userTable } from "@/db/schema/auth";
import { ensureUserInDb } from "@/lib/ensureUserInDb";

export const POST = withCORS(async (req: NextRequest) => {
  try {
    const { title } = await req.json();
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    await ensureUserInDb(user);
    await db.insert(chatTable).values({
      id: uuidv4(),
      title: title,
      created_at: new Date(),
      userId: user.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to store chat" },
      { status: 500 }
    );
  }
});

export const GET = withCORS(async (req: NextRequest) => {
  try {
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const result = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.userId, user.id));
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chats" },
      { status: 500 }
    );
  }
});

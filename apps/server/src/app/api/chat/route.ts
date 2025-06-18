import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { chats as chatTable } from "@/db/schema/auth";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    const session = await auth.api.getSession(req);
    if (!session?.session.userId) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    await db.insert(chatTable).values({
      id: uuidv4(),
      title: title,
      created_at: new Date(),
      userId: session.session.userId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to store chat" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);
    if (!session?.session?.userId) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const result = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.userId, session.session.userId));
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chats" },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../db";
import {
  chats as chatTable,
  messages as messagesTable,
} from "../../../db/schema/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { withCORS } from "@/lib/cors";

export const POST = withCORS(async (req: NextRequest) => {
  try {
    const { message, chatId, model } = await req.json();
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    if (!message || !message.role || !message.content || !chatId) {
      return NextResponse.json(
        { error: "Invalid message data or missing chatId" },
        { status: 400 }
      );
    }

    const chatcheck = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.id, chatId));

    const id = uuidv4();

    if (!chatcheck || chatcheck.length === 0) {
      await db.insert(chatTable).values({
        id: id,
        title: message.content,
        created_at: new Date(),
        userId: user.id,
      });
    }
    console.log(model);
    await db.insert(messagesTable).values({
      id: uuidv4(),
      chatId: !chatId ? id : chatId,
      role: message.role,
      content: message.content,
      userId: user.id,
      created_at: new Date(),
      model: model,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing message:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    );
  }
});

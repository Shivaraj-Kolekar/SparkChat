import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  chats as chatTable,
  messages as messagesTable,
} from "@/db/schema/auth";
import { eq, and, desc, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const chatId = params.id;
    const session = await auth.api.getSession(req);
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const messages = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.chatId, chatId),
          eq(messagesTable.userId, session.session.userId)
        )
      )
      .orderBy(asc(messagesTable.created_at));

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const chatId = params.id;
    const session = await auth.api.getSession(req);
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const chat = await db
      .delete(chatTable)
      .where(
        and(
          eq(chatTable.id, chatId),
          eq(chatTable.userId, session.session.userId)
        )
      );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error Deleting messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete messages",
      },
      { status: 500 }
    );
  }
}

import { withCORS } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  chats as chatTable,
  messages as messagesTable,
} from "@/db/schema/db";
import { eq, and, asc } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export const GET = withCORS(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params;
      const chatId = params.id;
      const chatArr = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.id, chatId));
      const chat = chatArr[0];
      if (!chat) {
        return NextResponse.json({ success: false, error: "Chat not found" }, { status: 404 });
      }
      const { userId } = getAuth(req);
      let messages;
      // If public, allow anyone to fetch
      if (chat.public === true) {
        messages = await db
          .select()
          .from(messagesTable)
          .where(and(eq(messagesTable.chatId, chatId)))
          .orderBy(asc(messagesTable.created_at));
        return NextResponse.json({
          success: true,
          messages,
          title: chat.title,
          chat: { public: true },
        });
      }
      // If not public, only allow owner
      if (!userId || chat.userId !== userId) {
        return NextResponse.json({ success: false, error: "Chat is not public" }, { status: 403 });
      }
      messages = await db
        .select()
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.chatId, chatId),
            eq(messagesTable.userId, userId)
          )
        )
        .orderBy(asc(messagesTable.created_at));
      return NextResponse.json({
        success: true,
        messages,
        title: chat.title,
        chat: { public: chat.public },
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
);

export const PUT = withCORS(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params;
      const chatId = params.id;
      const { userId } = getAuth(req);
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }
      const chatArr = await db.select().from(chatTable).where(eq(chatTable.id, chatId));
      const chat = chatArr[0];
      if (!chat || chat.userId !== userId) {
        return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
      }
      const body = await req.json();
      const updated = await db
        .update(chatTable)
        .set({ public: !!body.public })
        .where(eq(chatTable.id, chatId));
      return NextResponse.json({
        success: true,
        chat: { id: chatId, public: !!body.public },
      });
    } catch (error) {
      console.error("Error updating chat public status:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update chat public status",
        },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withCORS(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params;
      const chatId = params.id;
      const { userId } = getAuth(req);
      if (!userId) {
        return new Response("Unauthorized", {
          status: 401,
        });
      }
      await db
        .delete(chatTable)
        .where(and(eq(chatTable.id, chatId), eq(chatTable.userId, userId)));

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
);

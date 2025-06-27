import { withCORS } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  chats as chatTable,
  messages as messagesTable,
} from "@/db/schema/auth";
import { eq, and, asc } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export const GET = withCORS(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params;
      const chatId = params.id;
      const chat = await db
        .select()
        .from(chatTable)
        .where(eq(chatTable.id, chatId));
      const { userId } = getAuth(req);
      let messages;
      if (chat.length > 0 && chat[0].public === true) {
        messages = await db
          .select()
          .from(messagesTable)
          .where(and(eq(messagesTable.chatId, chatId)))
          .orderBy(asc(messagesTable.created_at));
      }
      if (!userId) {
        return new Response("Unauthorized", {
          status: 401,
        });
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
      const chat = await db.update(chatTable).set({ public: true });
      return NextResponse.json({
        success: true,
        chat,
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

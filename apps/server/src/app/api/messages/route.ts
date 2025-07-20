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
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

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
    let isNewChat = false;
    if (!chatcheck || chatcheck.length === 0) {
      isNewChat = true;
      await db.insert(chatTable).values({
        id: id,
        title: "New chat",
        created_at: new Date(),
        userId: user.id,
      });
    }
    await db.insert(messagesTable).values({
      id: uuidv4(),
      chatId: !chatId ? id : chatId,
      role: message.role,
      content: message.content,
      userId: user.id,
      created_at: new Date(),
      model: model,
    });

    // Smart title generation for new chat
    if (isNewChat) {
      (async () => {
        try {
          const aiModel = google("gemini-2.0-flash");
          const prompt = [
            {
              role: "user" as const,
              content:
                "Generate a short, descriptive chat title (max 6 words, no punctuation) for the following user message. Respond with only the title.\n\n" + message.content,
            },
          ];
          const result = await generateText({
            model: aiModel,
            messages: prompt,
            maxTokens: 12,
            temperature: 0.5,
          });
          const title = (result.text || "New chat").replace(/[\n\r]+/g, " ").trim().slice(0, 60);
          await db
            .update(chatTable)
            .set({ title })
            .where(eq(chatTable.id, id));
        } catch (err) {
          // fallback: use first 30 chars
          await db
            .update(chatTable)
            .set({ title: message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "") })
            .where(eq(chatTable.id, id));
        }
      })();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing message:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    );
  }
});

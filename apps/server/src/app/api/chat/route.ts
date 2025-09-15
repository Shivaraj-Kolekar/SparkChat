import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { chats as chatTable } from "@/db/schema/db";
import { v4 as uuidv4 } from "uuid";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { asc, desc, eq } from "drizzle-orm";
import { withCORS } from "@/lib/cors";
import { user as userTable } from "@/db/schema/db";
import { ensureUserInDb } from "@/lib/ensureUserInDb";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const POST = withCORS(async (req: NextRequest) => {
  try {
    const { title,created_at } = await req.json(); // 'title' is actually the user's prompt
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!user) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    await ensureUserInDb(user);
    const newChatId = uuidv4();
    // Insert chat with the prompt as the initial title
    await db.insert(chatTable).values({
      id: newChatId,
      title: title,
      created_at: created_at ? new Date(created_at) : new Date(),
      userId: user.id,
    });
    // Generate AI title from the prompt
    let aiTitle = title;
    try {
      const aiModel = google("gemini-2.0-flash");
      const prompt = [
        {
          role: "user" as const,
          content:
            "Generate a short, descriptive chat title (max 6 words, no punctuation) for the following user message. Respond with only the title.\n\n" + title,
        },
      ];
      const result = await generateText({
        model: aiModel,
        messages: prompt,
        maxTokens: 12,
        temperature: 0.5,
      });
      aiTitle = (result.text || title).replace(/[\n\r]+/g, " ").trim().slice(0, 60);
    } catch (err) {
      // fallback: use first 30 chars
      aiTitle = title.slice(0, 30) + (title.length > 30 ? "..." : "");
    }
    // Update chat title in DB
    await db.update(chatTable).set({ title: aiTitle }).where(eq(chatTable.id, newChatId));
    return NextResponse.json({ success: true, result: { id: newChatId, title: aiTitle } });
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
      .where(eq(chatTable.userId, user.id))
      .orderBy(desc(chatTable.created_at));
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chats" },
      { status: 500 }
    );
  }
});

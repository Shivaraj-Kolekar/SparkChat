import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { messages, userInfo } from "@/db/schema/auth";
import { google } from "@ai-sdk/google";
import { rateLimit } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { getUserPreferences } from "@/lib/cache";
import { withCORS } from "@/lib/cors";

export const maxDuration = 30;

// Function to create personalized system prompt based on user preferences
function createPersonalizedSystemPrompt(
  userPreferences: any,
  userName: string
) {
  let systemPrompt = "You are a helpful AI assistant.";

  // Add user's name if available
  if (userName) {
    systemPrompt += ` The user's name is ${userName}.`;
  }

  // Add profession if available
  if (userPreferences?.profession) {
    systemPrompt += ` The user is a ${userPreferences.profession}.`;
  }

  // Add traits if available
  if (userPreferences?.traits) {
    systemPrompt += ` The user prefers conversations to be ${userPreferences.traits}.`;
  }

  // Add user description if available
  if (userPreferences?.user_description) {
    systemPrompt += ` Additional context about the user: ${userPreferences.user_description}`;
  }

  // Add default behavior instructions
  systemPrompt +=
    " Always be helpful, accurate, and engaging in your responses.";

  return systemPrompt;
}

export const POST = withCORS(async (req: NextRequest) => {
  // Get user session
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check rate limit
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Try to find an existing rate limit record for today
  let [limit] = await db
    .select()
    .from(rateLimit)
    .where(eq(rateLimit.userId, userId))
    .orderBy(rateLimit.windowStart)
    .limit(1);

  // If the record exists and is for today, check the count
  if (limit && limit.windowStart && limit.windowEnd) {
    const windowStart = new Date(limit.windowStart);
    const windowEnd = new Date(limit.windowEnd);
    if (now >= windowStart && now < windowEnd) {
      if (limit.requestCount >= 10) {
        // User exceeded limit
        return new Response(
          JSON.stringify({
            error:
              "Rate limit exceeded. You can send more messages after: " +
              windowEnd.toLocaleString(),
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      } else {
        // Increment request count
        await db
          .update(rateLimit)
          .set({ requestCount: limit.requestCount + 1, updatedAt: now })
          .where(eq(rateLimit.id, limit.id));
      }
    } else {
      // Window expired, reset
      await db
        .update(rateLimit)
        .set({
          requestCount: 1,
          windowStart: today,
          windowEnd: tomorrow,
          updatedAt: now,
        })
        .where(eq(rateLimit.id, limit.id));
    }
  } else {
    // No record, create one
    await db.insert(rateLimit).values({
      userId,
      requestCount: 1,
      windowStart: today,
      windowEnd: tomorrow,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Fetch user preferences for personalized system prompt
  const userPreferences = await getUserPreferences(userId, db, userInfo, eq);

  const { messages, model, searchEnabled } = await req.json();
  let aiModel;
  if (
    model === "gemini-2.0-flash" ||
    model === "gemini-2.5-flash-preview-04-17" ||
    model === "gemini-2.0-flash-lite"
  ) {
    aiModel = google(model, {
      useSearchGrounding: searchEnabled,
    });
  } else {
    aiModel = groq(model); // Using Qwen model from Groq
  }

  // Create personalized system prompt
  const personalizedSystemPrompt = createPersonalizedSystemPrompt(
    userPreferences,
    "User" // Clerk: replace with actual user name if needed
  );

  const result = streamText({
    model: aiModel,
    system: personalizedSystemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
});

export const GET = withCORS(async (req: NextRequest) => {
  // Get user session
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = new Date();

  // Try to find an existing rate limit record for today
  let [limit] = await db
    .select()
    .from(rateLimit)
    .where(eq(rateLimit.userId, userId))
    .orderBy(rateLimit.windowStart)
    .limit(1);

  let remaining = 10;
  let resetAt = null;
  if (limit && limit.windowStart && limit.windowEnd) {
    const windowStart = new Date(limit.windowStart);
    const windowEnd = new Date(limit.windowEnd);
    if (now >= windowStart && now < windowEnd) {
      remaining = Math.max(0, 10 - limit.requestCount);
      resetAt = windowEnd.toISOString();
    } else {
      remaining = 10;
      resetAt = windowEnd.toISOString();
    }
  } else {
    // No record, so full quota
    remaining = 10;
    // Set resetAt to next midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    resetAt = tomorrow.toISOString();
  }

  return new Response(JSON.stringify({ remaining, resetAt }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

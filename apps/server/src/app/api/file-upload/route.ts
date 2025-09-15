import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatFiles } from "@/db/schema/db";
import { eq, and, desc } from "drizzle-orm";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { withCORS } from "@/lib/cors";

// POST /api/file-upload
// Body: { chatId, fileName, fileUrl, fileType }
export const POST = withCORS(async (req: NextRequest) => {
  try {
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, fileName, fileUrl, fileType } = await req.json();

    if (!chatId || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Rate limit: max 5 files per user per 24 hours
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowStart.getDate() + 1);

    const recentUploads = await db
      .select()
      .from(chatFiles)
      .where(
        and(
          eq(chatFiles.userId, user.id),
          desc(chatFiles.createdAt),
        )
      );

    const uploadsInWindow = recentUploads.filter((f) => {
      const created = new Date(f.createdAt);
      return created >= windowStart && created < windowEnd;
    });

    if (uploadsInWindow.length >= 5) {
      return NextResponse.json(
        {
          error: "File upload rate limit exceeded (max 5 per 24 hours)",
        },
        { status: 429 }
      );
    }

    // Store file metadata
    const result = await db
      .insert(chatFiles)
      .values({
        chatId,
        userId: user.id,
        fileName,
        fileUrl,
        fileType,
        createdAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "File uploaded and registered successfully",
    });
  } catch (error) {
    console.error("Error storing file metadata:", error);
    return NextResponse.json(
      { error: "Failed to store file metadata" },
      { status: 500 }
    );
  }
});

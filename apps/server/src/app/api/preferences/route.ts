import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userInfo } from "@/db/schema/db";
import { eq } from "drizzle-orm";
import { getClerkSession, getClerkUser } from "@/lib/auth";
import { invalidateUserPreferencesCache } from "@/lib/cache";
import { withCORS } from "@/lib/cors";
import { ensureUserInDb } from "@/lib/ensureUserInDb";

// GET - Fetch user preferences
export const GET = withCORS(async (req: NextRequest) => {
  try {
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPreferences = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, user.id))
      .limit(1);

    if (existingPreferences.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No preferences found",
      });
    }

    return NextResponse.json({
      success: true,
      data: existingPreferences[0],
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
});

// POST - Create or update user preferences
export const POST = withCORS(async (req: NextRequest) => {
  try {
    const session = getClerkSession(req);
    const user = await getClerkUser(req);
    if (!session.userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Ensure user exists in DB with all Clerk details
    await ensureUserInDb(user);
    const { name, profession, description, traits } = await req.json();

    // Check if user already has preferences
    const existingPreferences = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, user.id))
      .limit(1);

    let result;
    if (existingPreferences.length > 0) {
      // Update existing preferences
      result = await db
        .update(userInfo)
        .set({
          name: name || existingPreferences[0].name,
          profession: profession || existingPreferences[0].profession,
          traits: traits || existingPreferences[0].traits,
          user_description:
            description || existingPreferences[0].user_description,
          updatedAt: new Date(),
        })
        .where(eq(userInfo.userId, user.id))
        .returning();
    } else {
      // Create new preferences
      result = await db
        .insert(userInfo)
        .values({
          userId: user.id,
          name: name || "",
          profession: profession || "",
          traits: traits || "",
          user_description: description || "",
        })
        .returning();
    }

    // Invalidate cache to ensure AI API uses updated preferences
    invalidateUserPreferencesCache(user.id);

    return NextResponse.json({
      success: true,
      data: result[0],
      message:
        existingPreferences.length > 0
          ? "Preferences updated successfully"
          : "Preferences created successfully",
    });
  } catch (error) {
    console.error("Error storing preferences:", error);
    return NextResponse.json(
      { error: "Failed to store preferences" },
      { status: 500 }
    );
  }
});

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userInfo } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { invalidateUserPreferencesCache } from "../ai/route";

// GET - Fetch user preferences
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPreferences = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, session.user.id))
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
}

// POST - Create or update user preferences
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, profession, description, traits } = await req.json();

    // Check if user already has preferences
    const existingPreferences = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, session.user.id))
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
        .where(eq(userInfo.userId, session.user.id))
        .returning();
    } else {
      // Create new preferences
      result = await db
        .insert(userInfo)
        .values({
          userId: session.user.id,
          name: name || "",
          profession: profession || "",
          traits: traits || "",
          user_description: description || "",
        })
        .returning();
    }

    // Invalidate cache to ensure AI API uses updated preferences
    invalidateUserPreferencesCache(session.user.id);

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
}

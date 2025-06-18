import { db } from "@/db";
import { user as userTable, userInfo } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { invalidateUserPreferencesCache } from "../../ai/route";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const session = await auth.api.getSession(req);

    if (!session) {
      return NextResponse.json("Unauthorized", {
        status: 401,
      });
    }

    // Verify that the user is deleting their own account
    if (session.user.id !== id) {
      return NextResponse.json("Forbidden", {
        status: 403,
      });
    }

    // Delete user info first (if it exists)
    try {
      await db.delete(userInfo).where(eq(userInfo.userId, session.user.id));
    } catch (error) {
      console.log("No user info to delete or error deleting user info:", error);
    }

    // Invalidate cache for this user
    invalidateUserPreferencesCache(session.user.id);

    // Delete the user (this will cascade delete sessions, accounts, rate limits, messages, and chats)
    const deletedUser = await db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete account",
      },
      { status: 500 }
    );
  }
}

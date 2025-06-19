import { withCORS } from "@/lib/cors";
import { db } from "@/db";
import { user as userTable, userInfo } from "@/db/schema/auth";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { invalidateUserPreferencesCache } from "@/lib/cache";
import { users } from "@clerk/clerk-sdk-node";

export const DELETE = withCORS(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context.params;
      const id = params.id;
      const { userId } = getAuth(req);
      if (!userId) {
        return NextResponse.json("Unauthorized", { status: 401 });
      }
      if (userId !== id) {
        return NextResponse.json("Forbidden", { status: 403 });
      }

      // Delete user info first (if it exists)
      try {
        await db.delete(userInfo).where(eq(userInfo.userId, userId));
      } catch (error) {
        console.log(
          "No user info to delete or error deleting user info:",
          error
        );
      }

      // Invalidate cache for this user
      invalidateUserPreferencesCache(userId);

      // Delete user from Clerk first
      try {
        await users.deleteUser(userId);
      } catch (error) {
        console.error("Error deleting user from Clerk:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to delete user from Clerk. Account not deleted.",
          },
          { status: 500 }
        );
      }

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
);

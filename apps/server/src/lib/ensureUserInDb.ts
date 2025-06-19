import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export async function ensureUserInDb(clerkUser: any) {
  const exists = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, clerkUser.id));
  if (exists.length === 0) {
    await db.insert(userTable).values({
      id: clerkUser.id,
      name:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            "Unknown",
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      emailVerified:
        clerkUser.emailAddresses?.[0]?.verification?.status === "verified",
      image: clerkUser.imageUrl || "",
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(),
    });
  }
}

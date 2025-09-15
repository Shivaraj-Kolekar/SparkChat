import { db } from "@/db";
import { user as userTable } from "@/db/schema/db";
import { eq } from "drizzle-orm";

export async function ensureUserInDb(clerkUser: any) {
  try {
    if (!clerkUser || !clerkUser.id) {
      console.error("Missing clerkUser or clerkUser.id in ensureUserInDb", clerkUser);
      return;
    }
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
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : new Date(),
        updatedAt: new Date(),
      });
      console.log("User inserted into DB:", clerkUser.id);
    }
  } catch (err) {
    console.error("Error in ensureUserInDb:", err, clerkUser);
  }
}

import { getAuth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";
import type { NextRequest } from "next/server";

export async function getClerkUser(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return null;
  return await users.getUser(userId);
}
export function getClerkSession(req: NextRequest) {
  return getAuth(req);
}

import type { NextRequest } from "next/server";
import { getClerkSession, getClerkUser } from "./auth";

export async function createContext(req: NextRequest) {
  const session = getClerkSession(req);
  const user = await getClerkUser(req);
  return {
    session,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

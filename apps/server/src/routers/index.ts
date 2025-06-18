import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

import { TRPCError } from "@trpc/server";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});

export type AppRouter = typeof appRouter;

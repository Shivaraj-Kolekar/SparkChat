import { z } from 'better-auth'
import { protectedProcedure, publicProcedure, router, t } from '../lib/trpc'
import z3 from 'zod'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user
    }
  }),
  getOllamaModels: t.procedure
    .input(z3.object({ id: z3.number() })) // Input validation!
    .query(async () => {
      // Replace this with your actual data fetching logic
      const data = await fetch(`http://localhost:11434/api/tags`).then(res =>
        res.json()
      )
      return data // Output!
    })
})
export type AppRouter = typeof appRouter

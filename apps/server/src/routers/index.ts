import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../lib/trpc'
import { streamText } from 'ai'
import { ollama } from 'ollama-ai-provider'
import { TRPCError } from '@trpc/server'

const OllamaModelSchema = z.object({
  name: z.string(),
  model: z.string()
  // Add other properties as needed
})
const OllamaModelsSchema = z.array(OllamaModelSchema)

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
  chatmodel: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        model: z.string()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await streamText({
          model: ollama(input.model),
          messages: [{ role: 'user', content: input.message }],
          maxRetries: 3
        })

        // Get the response text from the result
        const response = await result.toDataStreamResponse()

        return {
          content: response,
          model: input.model
        }
      } catch (error) {
        console.error('Chat model error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get model response',
          cause: error
        })
      }
    }),
  getOllamaModels: publicProcedure
    .output(OllamaModelsSchema)
    .query(async () => {
      try {
        const response = await fetch(`http://localhost:11434/api/tags`)

        if (!response.ok) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Failed to fetch Ollama models: ${response.status} ${response.statusText}`
          })
        }

        const data = await response.json()
        const validatedData = OllamaModelsSchema.parse(data)
        return validatedData
      } catch (error) {
        console.error('Error fetching Ollama models:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Ollama models',
          cause: error
        })
      }
    })
})

export type AppRouter = typeof appRouter

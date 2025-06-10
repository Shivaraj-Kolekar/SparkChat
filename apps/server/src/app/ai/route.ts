import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 30

export async function POST (req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: google('gemini-2.0-flash', {
      useSearchGrounding: false
    }),

    system:
      'You are a helpful agent. My name is Shivraj and im a web developer and i want the chats to be funny, concise and creative ',
    messages
  })

  return result.toDataStreamResponse()
}

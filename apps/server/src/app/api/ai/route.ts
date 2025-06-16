import { db } from '@/db'
import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { messages } from '@/db/schema/auth'
import { google } from '@ai-sdk/google'
export const maxDuration = 30

export async function POST (req: Request) {
  const { messages, model, searchEnabled } = await req.json()
  let aiModel
  if (
    model === 'gemini-2.0-flash' ||
    model === 'gemini-2.5-flash-preview-04-17' ||
    model === 'gemini-2.0-flash-lite'
  ) {
    aiModel = google(model, {
      useSearchGrounding: searchEnabled
    })
  } else {
    aiModel = groq(model) // Using Qwen model from Groq
  }
  const result = streamText({
    model: aiModel,
    system:
      'You are a helpful agent. My name is Shivraj and im a web developer and i want the chats to be funny, concise and creative ',
    messages
  })

  return result.toDataStreamResponse()
}

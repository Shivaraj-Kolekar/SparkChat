import { db } from '@/db'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { ollama } from 'ollama-ai-provider'
import { messages } from '@/db/schema/auth'

export const maxDuration = 30

export async function POST (req: Request) {
  const { messages, model = 'gemini' } = await req.json()

  let aiModel
  if (model === 'gemini') {
    aiModel = google('gemini-2.0-flash', {
      useSearchGrounding: false
    })
  } else if (model === 'ollama') {
    aiModel = ollama('llama3.2') // or any other Ollama model you prefer
  } else {
    // Default to Gemini
    aiModel = google('gemini-2.0-flash', {
      useSearchGrounding: false
    })
  }

  const result = streamText({
    model: aiModel,
    system:
      'You are a helpful agent. My name is Shivraj and im a web developer and i want the chats to be funny, concise and creative ',
    messages
  })

  return result.toDataStreamResponse()
}

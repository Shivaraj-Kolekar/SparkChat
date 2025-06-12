import { NextResponse } from 'next/server'
import { db } from '../../../db'
import { chats, messages as messagesTable } from '../../../db/schema/auth'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST (req: Request) {
  try {
    const { message, chatId } = await req.json()
    const session = await auth.api.getSession(req)
    if (!session) {
      return new Response('Unauthorized', {
        status: 401
      })
    }

    if (!message || !message.role || !message.content || !chatId) {
      return NextResponse.json(
        { error: 'Invalid message data or missing chatId' },
        { status: 400 }
      )
    }

    const chatcheck = await db.select().from(chats).where(eq(chats.id, chatId))
    if (!chatcheck || chatcheck.length === 0) {
      return NextResponse.json(
        { error: 'No chat exists with this id in db' },
        { status: 400 }
      )
    }

    await db.insert(messagesTable).values({
      id: uuidv4(),
      chatId: chatId,
      role: message.role,
      content: message.content,
      userId: session.session.userId,
      created_at: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing message:', error)
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/db'
import { messages as messagesTable } from '@/db/schema/auth'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function GET (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id
    const session = await auth.api.getSession(req)
    if (!session) {
      return new Response('Unauthorized', {
        status: 401
      })
    }
    const messages = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.chatId, chatId),
          eq(messagesTable.userId, session.session.userId)
        )
      )
      .orderBy(messagesTable.created_at)

    return NextResponse.json({
      success: true,
      messages
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages'
      },
      { status: 500 }
    )
  }
}

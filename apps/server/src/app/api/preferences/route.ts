import { NextResponse } from 'next/server'
import { db } from '@/db'
import { userInfo } from '@/db/schema/auth'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function POST (req: Request) {
  try {
    const { name, profession, description, traits } = await req.json()
    // const session = await auth.api.getSession(req)

    const result = await db.insert(userInfo).values({
      name: name,
      user_description: description,
      traits: traits,
      profession: profession
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

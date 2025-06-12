import { NextResponse } from 'next/server'

export async function POST (req: Request) {
  try {
    const body = await req.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      throw new Error('Failed to store message')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing message:', error)
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { receiverId, message } = await request.json()

    if (!receiverId || !message) {
      return NextResponse.json({ error: "Receiver ID and message required" }, { status: 400 })
    }

    // Check if they are friends
    const friendships = await sql`
      SELECT id FROM friendships
      WHERE ((user_id = ${authUser.id} AND friend_id = ${receiverId})
         OR (user_id = ${receiverId} AND friend_id = ${authUser.id}))
        AND status = 'accepted'
    `

    if (friendships.length === 0) {
      return NextResponse.json({ error: "You can only chat with friends" }, { status: 403 })
    }

    // Insert message
    const newMessages = await sql`
      INSERT INTO chat_messages (sender_id, receiver_id, message)
      VALUES (${authUser.id}, ${receiverId}, ${message})
      RETURNING id, sender_id, receiver_id, message, is_read, created_at
    `

    const newMessage = {
      ...newMessages[0],
      sender_username: authUser.username,
    }

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

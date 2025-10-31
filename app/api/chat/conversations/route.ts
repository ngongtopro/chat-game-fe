import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get all friends with last message
    const conversations = await sql`
      SELECT DISTINCT
        u.id, u.username, u.avatar_url,
        (
          SELECT cm.message
          FROM chat_messages cm
          WHERE (cm.sender_id = ${authUser.id} AND cm.receiver_id = u.id)
             OR (cm.sender_id = u.id AND cm.receiver_id = ${authUser.id})
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT cm.created_at
          FROM chat_messages cm
          WHERE (cm.sender_id = ${authUser.id} AND cm.receiver_id = u.id)
             OR (cm.sender_id = u.id AND cm.receiver_id = ${authUser.id})
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM chat_messages cm
          WHERE cm.sender_id = u.id AND cm.receiver_id = ${authUser.id} AND cm.is_read = false
        ) as unread_count
      FROM users u
      JOIN friendships f ON (
        (f.user_id = ${authUser.id} AND f.friend_id = u.id)
        OR (f.user_id = u.id AND f.friend_id = ${authUser.id})
      )
      WHERE f.status = 'accepted'
      ORDER BY last_message_time DESC NULLS LAST
    `

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("[v0] Get conversations error:", error)
    return NextResponse.json({ error: "Failed to get conversations" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const friendId = searchParams.get("friendId")

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 })
    }

    const messages = await sql`
      SELECT 
        cm.id, cm.sender_id, cm.receiver_id, cm.message, cm.is_read, cm.created_at,
        u.username as sender_username
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE (cm.sender_id = ${authUser.id} AND cm.receiver_id = ${friendId})
         OR (cm.sender_id = ${friendId} AND cm.receiver_id = ${authUser.id})
      ORDER BY cm.created_at ASC
      LIMIT 100
    `

    // Mark messages as read
    await sql`
      UPDATE chat_messages
      SET is_read = true
      WHERE receiver_id = ${authUser.id} AND sender_id = ${friendId} AND is_read = false
    `

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Get messages error:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}

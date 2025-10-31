import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 })
    }

    // Check if friendship already exists
    const existing = await sql`
      SELECT id FROM friendships
      WHERE (user_id = ${authUser.id} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${authUser.id})
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 })
    }

    // Create friend request
    await sql`
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (${authUser.id}, ${friendId}, 'pending')
    `

    return NextResponse.json({ message: "Friend request sent" })
  } catch (error) {
    console.error("[v0] Send friend request error:", error)
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 })
  }
}

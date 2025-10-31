import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get accepted friends
    const friends = await sql`
      SELECT 
        f.id as friendship_id,
        u.id, u.username, u.email, u.avatar_url,
        f.status
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = ${authUser.id} THEN u.id = f.friend_id
          ELSE u.id = f.user_id
        END
      )
      WHERE (f.user_id = ${authUser.id} OR f.friend_id = ${authUser.id})
        AND f.status = 'accepted'
    `

    // Get pending requests (received)
    const pendingRequests = await sql`
      SELECT 
        f.id as friendship_id,
        u.id, u.username, u.email, u.avatar_url,
        f.status
      FROM friendships f
      JOIN users u ON u.id = f.user_id
      WHERE f.friend_id = ${authUser.id} AND f.status = 'pending'
    `

    return NextResponse.json({ friends, pendingRequests })
  } catch (error) {
    console.error("[v0] Get friends error:", error)
    return NextResponse.json({ error: "Failed to get friends" }, { status: 500 })
  }
}

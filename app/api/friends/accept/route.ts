import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { friendshipId } = await request.json()

    // Update friendship status
    await sql`
      UPDATE friendships
      SET status = 'accepted'
      WHERE id = ${friendshipId} AND friend_id = ${authUser.id}
    `

    return NextResponse.json({ message: "Friend request accepted" })
  } catch (error) {
    console.error("[v0] Accept friend request error:", error)
    return NextResponse.json({ error: "Failed to accept friend request" }, { status: 500 })
  }
}

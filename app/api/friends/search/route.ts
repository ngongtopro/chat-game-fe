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
    const query = searchParams.get("q") || ""

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search for users excluding self and existing friends
    const users = await sql`
      SELECT u.id, u.username, u.email, u.avatar_url
      FROM users u
      WHERE u.id != ${authUser.id}
        AND (u.username ILIKE ${`%${query}%`} OR u.email ILIKE ${`%${query}%`})
        AND NOT EXISTS (
          SELECT 1 FROM friendships f
          WHERE (f.user_id = ${authUser.id} AND f.friend_id = u.id)
             OR (f.user_id = u.id AND f.friend_id = ${authUser.id})
        )
      LIMIT 20
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Search users error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

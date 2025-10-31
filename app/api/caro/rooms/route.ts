import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import sql from "@/lib/db"

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rooms = await sql`
      SELECT 
        cr.id, cr.room_code, cr.player1_id, cr.bet_amount, cr.status,
        u.username as player1_username
      FROM caro_rooms cr
      JOIN users u ON cr.player1_id = u.id
      WHERE cr.status = 'waiting'
      ORDER BY cr.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[v0] Get rooms error:", error)
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 })
  }
}
